/**
 * Button widgets store the ids of the widgets they show / hide / toggle in
 * `targetsN` and `longPressTargetsN` config arrays. Widget ids get rewritten in
 * several places — layout save prefixes them with the dashboard id, and
 * duplicate / rename suffix them — and every one of those rewrites has to carry
 * the button references along, or a button ends up pointing at widget ids that
 * no longer exist and its show/hide silently does nothing.
 *
 * `remapButtonTargets` walks a widget config and rewrites every target id via
 * `mapId`. It is pure (returns a new object), only touches `targets*` /
 * `longPressTargets*` array keys, and leaves everything else untouched.
 */
export function remapButtonTargets(
  config: any,
  mapId: (id: string) => string,
): any {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return config ?? {};
  }
  const next: any = { ...config };
  for (const key of Object.keys(next)) {
    if (
      (key.startsWith("targets") || key.startsWith("longPressTargets")) &&
      Array.isArray(next[key])
    ) {
      next[key] = next[key].map((id: any) =>
        typeof id === "string" ? mapId(id) : id,
      );
    }
  }
  return next;
}
