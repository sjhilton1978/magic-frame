# Roadmap

Where Magic Frame is heading. This is a **loose** roadmap — features ship
individually in small patch releases as soon as they're stable, then once
a "theme" worth of features is in, the next minor version (v1.1.0) wraps
them with a release post.

Individual issues are the source of truth — this file is the one-paragraph
summary for anyone who doesn't want to scroll through them.

---

## Next up — *v1.1 theme: "community feedback round 2"*

The four issues currently scoped for the next minor release. Each one ships
in its own patch (v1.0.x) when ready; the v1.1.0 release is a story-grouped
recap once they're all in.

### 🎥 [Camera widget](https://github.com/jeremiaa/magic-frame/issues/3)
A new widget bound to a Home Assistant camera entity. MVP is snapshot
refresh through a server-side proxy (so the HA token never reaches the
browser). MJPEG stream + WebRTC via go2rtc as later tiers.

### ↔️ [Swipe between views on a single display](https://github.com/jeremiaa/magic-frame/issues/4)
A view today is bound to one URL. This adds a `linkedViews` list per view
+ horizontal swipe gesture + dot indicator, so one tablet can cycle through
several layouts. Auto-cycle (time-based) and HA-trigger-based view switching
come later.

### 🧱 [Widget stacking at the same grid position](https://github.com/jeremiaa/magic-frame/issues/5)
Today widgets can't overlap on the grid. Lifting this lets you stack
multiple alternate widgets at the same screen position and toggle between
them — the foundation for real "multi-mode" views on one display.

### 🤖 [HA-entity-triggered widget visibility](https://github.com/jeremiaa/magic-frame/issues/6)
Button widgets can already show/hide other widgets — but the trigger is
manual. This adds visibility rules driven by an HA entity state (presence,
time-of-day, motion, doorbell, …). Combined with widget stacking (#5) this
unlocks layouts that swap themselves based on what's happening in the home.

---

## Later — *v1.2+ ideas*

These aren't issues yet, just ideas worth tracking. If one resonates with
you, opening an issue and saying "this would matter to me because …" is
the best way to move it up.

- **Auto-cycle views** — time-of-day or interval-based view rotation
- **HA service call to switch views** — `magic_frame.switch_view(view_id, display_id)` so an HA automation can drive a display
- **More wallpaper sources** — Synology Photos, Apple Photos (shared albums)
- **Native companion app** — iOS first, beta via TestFlight
- **Smoother view transitions** — fade / slide between views, configurable
- **Compound visibility conditions** — `AND` / `OR` across multiple HA entities
- **Widget templates / view templates** — start a new view from a curated layout

---

## How releases work

- **Patches (`v1.0.x`)** ship continuously as features land — usually within a day of being stable.
- **Minor bumps (`v1.x.0`)** group a theme into a release post (forum thread, GitHub release notes, optional social share). The v1.1 milestone above is the next one.
- **Major bumps (`v2.0.0`)** are reserved for breaking changes — nothing planned yet.

If you want to be notified about a specific feature: subscribe to the
respective issue on GitHub. For broad release news, watch the repo or check
the [Releases page](https://github.com/jeremiaa/magic-frame/releases).
