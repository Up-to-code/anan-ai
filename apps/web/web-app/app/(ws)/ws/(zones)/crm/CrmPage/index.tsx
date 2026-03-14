import type { CrmClientRecord } from "../crmTypes";
import PipelineWorkspace from "../PipelinePage/PipelineWorkspace";

/**
 * WHY:   The CRM root route should stay as a thin server entrypoint while the board remains interactive.
 * WHAT:  Delegates the interactive CRM board to `PipelineWorkspace`.
 * HOW:   Passes SSR-loaded deal records and server actions into the client orchestrator.
 */
export default function CrmPage({
  clients,
  onStageChange,
  onCreateClient,
}: {
  clients: CrmClientRecord[];
  onStageChange?: (input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" }) => Promise<void>;
  onCreateClient?: (input: { name: string }) => Promise<void>;
}) {
  return (
    <PipelineWorkspace
      initialClients={clients}
      onStageChange={onStageChange}
      onCreateClient={onCreateClient}
    />
  );
}
