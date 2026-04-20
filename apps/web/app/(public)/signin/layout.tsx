/**
 * WHY:   The public sign-in route no longer needs app-local auth providers once auth lives in the app shell.
 * WHAT:  Leaves `/signin` as a thin route segment wrapper.
 * HOW:   Returns children directly so the page only depends on the global Better Auth provider.
 */
export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children;
}
