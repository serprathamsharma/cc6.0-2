import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { uploadReceived } from "@/lib/inngest/functions/upload-received";
import { assetAnalyze } from "@/lib/inngest/functions/asset-analyze";
import { assetEmbed } from "@/lib/inngest/functions/asset-embed";
import { assetCluster } from "@/lib/inngest/functions/asset-cluster";
import { pairEvaluate } from "@/lib/inngest/functions/pair-evaluate";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    uploadReceived,
    assetAnalyze,
    assetEmbed,
    assetCluster,
    pairEvaluate,
  ],
});
