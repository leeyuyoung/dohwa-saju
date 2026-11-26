"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyzingExperience } from "@/components/analyzing/AnalyzingExperience";
import { NewYearAfterPayLoading } from "@/components/newyear/NewYearAfterPayLoading";
import { clearPendingNewYear, loadPendingNewYear } from "@/lib/client/inputStorage";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";

const MISSING = {
  found: "입력된 생년월일이 없습니다.",
  tease: "출발점부터 다시 적어 주세요.",
  cta: "정보 입력하기",
};

const TOKEN_RE = /^[A-Za-z0-9_-]{8,128}$/;

export function NewYearAnalyzing({ theme = "hanji" }: { theme?: FateNaviThemeId }) {
  const searchParams = useSearchParams();
  const basePath = themeOf(theme).basePath;
  const isSheep = theme === "sheep";
  const isHanji = theme === "hanji";
  const isPremium = theme === "premium";
  const afterPay = searchParams.get("afterPay") === "1";
  const payToken = searchParams.get("token");
  const subjectName = useMemo(() => {
    const pending = loadPendingNewYear();
    if (!pending || typeof pending !== "object") return undefined;
    const name = (pending as { name?: unknown }).name;
    return typeof name === "string" && name.trim() ? name.trim() : undefined;
  }, []);
  const resultHref = useCallback((token: string) => `${basePath}/result/${token}`, [basePath]);

  if (isPremium && afterPay && payToken && TOKEN_RE.test(payToken)) {
    return <NewYearAfterPayLoading token={payToken} />;
  }

  const workingCopy = isSheep
    ? subjectName
      ? `${subjectName}님의 레벨업 가이드를\n준비하는 중`
      : "레벨업 가이드를\n준비하는 중"
    : subjectName
      ? `${subjectName}님의\n인생 설계서를 펼치는 중`
      : "인생 설계서를 펼치는 중";

  const loadingImageSrc = isSheep
    ? "/images/fatenavi2/mery-red.png"
    : isPremium
      ? "/images/fatenavi4/loading-ink.jpg"
      : "/images/fatenavi3/intro.jpg";

  const loadingCaption = isSheep
    ? "메리가 당신 흐름을 읽는 중"
    : isPremium
      ? "프리미엄 사주를 정리하는 중"
      : "같은 운명이라도, 길은 다시 그릴 수 있습니다";

  const loadingChecklist =
    isHanji || isPremium
      ? ["사주 원국을 세우는 중", "대운의 흐름을 읽는 중", "인생 설계서를 정리하는 중"]
      : undefined;

  return (
    <AnalyzingExperience
      endpoint="/api/FateNavi/analysis"
      loadPending={loadPendingNewYear}
      clearPending={clearPendingNewYear}
      trackSubmit={false}
      resultHref={resultHref}
      retryHref={`${basePath}/start`}
      workingCopy={workingCopy}
      missingCopy={MISSING}
      appearance="ink"
      subjectName={isSheep || isHanji || isPremium ? undefined : subjectName}
      autoGoResult
      loadingImageSrc={loadingImageSrc}
      loadingCaption={loadingCaption}
      loadingChecklist={loadingChecklist}
    />
  );
}
