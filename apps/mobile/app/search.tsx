import SearchScreen from "@/features/SearchScreen/index";

/**
 * WHY:   Buyers still need a direct discovery route outside the main conversation timeline.
 * WHAT:  Renders the focused property search screen.
 * HOW:   Delegates all filtering and layout to the search feature folder.
 */
export default function SearchRoute() {
  return <SearchScreen />;
}
