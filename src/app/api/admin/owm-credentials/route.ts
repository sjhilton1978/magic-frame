import { NextRequest, NextResponse } from "next/server";
import {
  verifySession,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/lib/auth/dal";
import { getOwmStatus, setOwmKey, clearOwmKey } from "@/lib/weather/owm-credentials";

export const dynamic = "force-dynamic";

// GET — Status (nur ob konfiguriert, der Key selbst wird nie zurückgegeben)
export async function GET() {
  try {
    await verifySession();
    return NextResponse.json(await getOwmStatus());
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    return NextResponse.json({ error: "Interner Fehler." }, { status: 500 });
  }
}

// POST — Key speichern (Admin). Leerer Body löscht den Key.
export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Nur Admins dürfen API-Keys setzen." },
        { status: 403 },
      );
    }
    const body = await req.json().catch(() => ({}));
    const apiKey = typeof body.apiKey === "string" ? body.apiKey : "";
    await setOwmKey(apiKey);
    return NextResponse.json({ ok: true, status: await getOwmStatus() });
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    console.error("owm-credentials POST error", err);
    return NextResponse.json({ error: "Interner Fehler." }, { status: 500 });
  }
}

// DELETE — DB-Key löschen (env-Fallback bleibt)
export async function DELETE() {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Nur Admins." }, { status: 403 });
    }
    await clearOwmKey();
    return NextResponse.json({ ok: true, status: await getOwmStatus() });
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorizedResponse();
    return NextResponse.json({ error: "Interner Fehler." }, { status: 500 });
  }
}
