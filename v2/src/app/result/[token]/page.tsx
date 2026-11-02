import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FreeResultScreen } from "@/components/result/FreeResultScreen";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { toFreeResultView } from "@/lib/server/resultView";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "나의 도화 지수",
  robots: { index: false, follow: false },
};

export default async function ResultPage({ params }: PageProps<"/result/[token]">) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token)) notFound();
  const record = await getAnalysisStore().get(token);
  if (!record) notFound();
  return <FreeResultScreen result={toFreeResultView(record)} token={token} paid={record.paidAt !== null} />;
}
