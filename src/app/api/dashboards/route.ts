import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifySession, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/dal";
import { DEFAULT_WALLPAPER } from "@/lib/wallpaper-engine/bundled";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dashboards = await prisma.dashboard.findMany({
      select: {
        id: true,
        name: true,
        settings: true,
        widgets: { select: { id: true, type: true, x: true, y: true, w: true, h: true } },
      },
      orderBy: { id: 'asc' }
    });
    const shaped = dashboards.map((d) => {
      const orientation = (d.settings as any)?.orientation;
      return {
        id: d.id,
        name: d.name,
        orientation: orientation === "landscape" ? "landscape" : "portrait",
        layout: d.widgets,
      };
    });
    return NextResponse.json(shaped, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  } catch(error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dashboards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifySession();
    const { id, name, oldId, sourceId, orientation } = await req.json();
    const orient = orientation === "landscape" ? "landscape" : "portrait";

    if (!id || !name) {
       return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
    }

    // Clean up ID (lowercase, alphanumeric, dashes)
    const safeId = id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    if (!safeId) return NextResponse.json({ error: "Invalid path ID" }, { status: 400 });

    if (sourceId && sourceId !== safeId) {
       // DUPLICATE: copy the dashboard + its widgets under a new ID, leave the
       // source untouched. Widget IDs get a unique suffix per target so the
       // copies never collide with the originals.
       const source = await prisma.dashboard.findUnique({
          where: { id: sourceId },
          include: { widgets: true }
       });
       if (!source) return NextResponse.json({ error: "Source dashboard not found" }, { status: 404 });

       await prisma.dashboard.create({
          data: {
             id: safeId,
             name,
             wallpaper: source.wallpaper || {},
             settings: source.settings || { orientation: orient }
          }
       });

       const widgetSuffix = `_${safeId}`;
       for (const w of source.widgets) {
          await prisma.widget.create({
             data: {
                id: w.id + widgetSuffix, // unique per target dashboard
                type: w.type,
                x: w.x, y: w.y, w: w.w, h: w.h,
                bgOpacity: w.bgOpacity,
                config: w.config || {},
                dashboardId: safeId
             }
          });
       }

    } else if (oldId && oldId !== safeId) {
       // RENAME: change the URL slug. Prisma doesn't easily CASCADE UPDATE
       // primary keys, so we copy → delete the old. Widget IDs get a suffix
       // to avoid clashing with anything else in the table.
       const oldDashboard = await prisma.dashboard.findUnique({
          where: { id: oldId },
          include: { widgets: true }
       });
       if (!oldDashboard) return NextResponse.json({ error: "Old dashboard not found" }, { status: 404 });

       // Create new
       await prisma.dashboard.create({
          data: {
             id: safeId,
             name: name,
             wallpaper: oldDashboard.wallpaper || {},
             settings: oldDashboard.settings || {}
          }
       });

       // Copy widgets
       for (const w of oldDashboard.widgets) {
          await prisma.widget.create({
             data: {
                id: w.id + "_copy", // prevent duplicate widget IDs
                type: w.type,
                x: w.x, y: w.y, w: w.w, h: w.h,
                bgOpacity: w.bgOpacity,
                config: w.config || {},
                dashboardId: safeId
             }
          });
       }

       // Delete old
       await prisma.dashboard.delete({ where: { id: oldId } });

    } else {
       // CREATE or UPDATE-IN-PLACE: same ID — just upsert the name.
       await prisma.dashboard.upsert({
          where: { id: safeId },
          update: { name }, // bestehender View: nur Name, Wallpaper bleibt unangetastet
          create: { id: safeId, name, wallpaper: DEFAULT_WALLPAPER as any, settings: { orientation: orient } }
       });
    }

    return NextResponse.json({ success: true, id: safeId });
  } catch(error: any) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse();
    console.error("Dashboard POST Error:", error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "This URL path already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save dashboard" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
     await verifySession();
     const id = req.nextUrl.searchParams.get('id');
     if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

     await prisma.dashboard.delete({ where: { id } });
     return NextResponse.json({ success: true });
  } catch(error) {
     if (error instanceof UnauthorizedError) return unauthorizedResponse();
     console.error(error);
     return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
