import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";

/**
 * WHY:   Placeholder for AI agent configuration and monitoring within the Admin Zone.
 * WHAT:  Currently renders a static shell. Soon to be connected to Convex `ai_zone` agents.
 * HOW:   Designed as an Orchestrator. Will fetch agent statuses and workflow definitions.
 */
export default function Agents() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Agent configuration</CardTitle>
          <CardDescription>
            Agent settings and tools. Configure via Convex dashboard or agent docs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Future: surface agent model, tools list, or workflow status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
