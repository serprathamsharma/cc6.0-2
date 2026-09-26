import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "impactlens",
  eventKey: process.env.INNGEST_EVENT_KEY || "local",
});
