import { BrokerProfileScreen } from "../../src/features/BrokerProfileScreen";
import { useLocalSearchParams } from "expo-router";

/**
 * WHY:   The buyer feed needs an escape hatch into the creator's full catalog.
 * WHAT:  Expo Router dynamic route for viewing a broker's profile and active listings.
 * HOW:   Extracts the broker ID from the route params and passes it down to the feature component.
 */
export default function BrokerProfileRoute() {
  const { id } = useLocalSearchParams();
  return <BrokerProfileScreen brokerId={String(id)} />;
}
