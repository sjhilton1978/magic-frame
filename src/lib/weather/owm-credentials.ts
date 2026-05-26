import "server-only";
import { prisma } from "@/lib/companion/prisma";

// OpenWeatherMap-API-Key.
// Quelle: AppSettings.extra.owm.apiKey (in der UI setzbar)
// mit Fallback auf env-Var OPENWEATHERMAP_API_KEY.
// Der Key wird nie an die UI zurückgegeben — nur ein Boolean ob gesetzt.

async function readExtra(): Promise<any> {
  try {
    const row = await prisma.appSettings.findUnique({ where: { id: "global" } });
    return (row?.extra as any) ?? {};
  } catch {
    return {};
  }
}

export async function getOwmKey(): Promise<string> {
  const stored = (await readExtra())?.owm ?? {};
  return (stored.apiKey || process.env.OPENWEATHERMAP_API_KEY || "").trim();
}

export async function getOwmStatus() {
  const stored = (await readExtra())?.owm ?? {};
  const hasStored = !!stored.apiKey;
  const hasEnv = !!process.env.OPENWEATHERMAP_API_KEY;
  return {
    configured: hasStored || hasEnv,
    // Wenn aus env: UI-Feld disabled (read-only)
    fromEnv: !hasStored && hasEnv,
  };
}

export async function setOwmKey(apiKey: string): Promise<void> {
  const extra = await readExtra();
  const trimmed = (apiKey || "").trim();
  const owm: Record<string, string> = { ...(extra.owm ?? {}) };
  if (trimmed) {
    owm.apiKey = trimmed;
  } else {
    // leerer Wert via setOwmKey löscht den Key aus der DB
    delete owm.apiKey;
  }
  await prisma.appSettings.upsert({
    where: { id: "global" },
    update: { extra: { ...extra, owm } as any, updatedAt: new Date() },
    create: { id: "global", haUrl: "", haToken: "", extra: { owm } as any },
  });
}

export async function clearOwmKey(): Promise<void> {
  const extra = await readExtra();
  const next = { ...extra };
  delete next.owm;
  await prisma.appSettings.upsert({
    where: { id: "global" },
    update: { extra: next as any, updatedAt: new Date() },
    create: { id: "global", haUrl: "", haToken: "" },
  });
}
