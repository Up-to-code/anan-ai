import { users } from "@/admin_zone/mocks/data";
import UsersPageClient from "./UsersPageClient";

/**
 * WHY:   The users route should remain a thin loader for the mocked directory page.
 * WHAT:  Renders the users table backed by the mock repository.
 * HOW:   Passes the mock users list into the interactive client component.
 */
type UsersPageProps = {
  tab?: string;
};

export default function UsersPage(_props: UsersPageProps) {
  return <UsersPageClient users={users} />;
}
