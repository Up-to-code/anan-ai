import { profileSettings } from "@/admin_zone/mocks/data";
import ProfileSettingsClient from "./ProfileSettingsClient";

/**
 * WHY:   The profile settings route only needs to load the mock profile and delegate editing to the client component.
 * WHAT:  Renders the admin profile settings page.
 * HOW:   Passes the mocked current profile into the local-only form.
 */
export default function ProfileSettingsPage() {
  return <ProfileSettingsClient initialProfile={profileSettings} />;
}
