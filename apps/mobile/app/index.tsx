import HomeFeedScreen from "@/features/HomeFeedScreen";

/**
 * WHY:   The root mobile route should stay a thin orchestrator in line with the Anan architecture rules.
 * WHAT:  Renders the buyer feed home experience.
 * HOW:   Delegates all screen behavior to the feature folder.
 */
export default function IndexRoute() {
  return <HomeFeedScreen />;
}
