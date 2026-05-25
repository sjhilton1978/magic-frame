import { redirect } from 'next/navigation';

// Single entry point for the app: /login.
// AuthGate on that page routes further based on session state:
//   - logged-in   → /editor
//   - no users yet → setup form
//   - otherwise    → login form
// /editor itself doesn't gate on auth at the layout level, so sending
// unauthenticated users straight there gives a half-broken UI.
export default function Home() {
  redirect('/login');
}
