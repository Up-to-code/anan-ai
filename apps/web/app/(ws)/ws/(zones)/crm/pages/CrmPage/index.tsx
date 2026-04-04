import type { CrmClientRecord } from "../../types/crmTypes";
import PipelineWorkspace from "../PipelinePage/PipelineWorkspace";

/**
 * WHY:   The CRM root route should stay as a thin server entrypoint while the board remains interactive.
 * WHAT:  Delegates the interactive CRM board to `PipelineWorkspace`.
 * HOW:   Passes SSR-loaded deal records and server actions into the client orchestrator.
 */
export default function CrmPage({
  clients,
  onStageChange,
  onFollowUpChange,
  onCreateClient,
}: {
  clients: CrmClientRecord[];
  onStageChange?: (input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" | "lost" }) => Promise<void>;
  onFollowUpChange?: (input: { dealId: string; nextFollowUpAt: number }) => Promise<void>;
  onCreateClient?: (input: { name: string }) => Promise<void>;
}) {
  return (
    <PipelineWorkspace
      initialClients={clients}
      onStageChange={onStageChange}
      onFollowUpChange={onFollowUpChange}
      onCreateClient={onCreateClient}
    />
  );
}
