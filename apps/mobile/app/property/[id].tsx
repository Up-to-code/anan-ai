import PropertyDetailScreen from "@/features/PropertyDetailScreen/index";

/**
 * WHY:   The buyer journey needs one dedicated property detail route for deeper review.
 * WHAT:  Renders the lightweight property detail screen.
 * HOW:   Keeps the route file thin by delegating to the detail feature folder.
 */
export default function PropertyRoute() {
  return <PropertyDetailScreen />;
}
