import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import actionCache from "@convex-dev/action-cache/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import rag from "@convex-dev/rag/convex.config";
import stagehand from "@browserbasehq/convex-stagehand/convex.config";
import workflow from "@convex-dev/workflow/convex.config";

const app = defineApp();
app.use(agent);
app.use(actionCache);
app.use(rateLimiter);
app.use(rag);
app.use(stagehand, { name: "stagehand" });
app.use(workflow);

export default app;
