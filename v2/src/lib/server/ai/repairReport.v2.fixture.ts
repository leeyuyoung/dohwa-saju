/**
 * repairIncompleteReportV2 / validateReportForFinalOutputV2 수동·스크립트 검증용 픽스처.
 * `npx tsx src/lib/server/ai/repairReport.v2.fixture.ts` 로 실행.
 */
import Module from "node:module";

// server-only는 Next 서버 전용. 픽스처 러너에서는 no-op으로 둔다.
const moduleAny = Module as unknown as {
  _load: (request: string, parent: NodeModule | null | undefined, isMain: boolean) => unknown;
};
const originalLoad = moduleAny._load;
moduleAny._load = function (request: string, parent, isMain) {
  if (request === "server-only") return {};
  return originalLoad(request, parent, isMain);
};

async function main() {
  const { repairIncompleteReportV2, validateReportForFinalOutputV2 } = await import("./repairReport.v2");

  const longPara =
    "사주에 도화 기운이 있어 첫인상부터 은근히 남을 가능성이 커. 상대는 네가 별로 안 한 것 같은데 자꾸 신경이 쓰인다고 느껴. 눈빛과 말투에 남는 잔상이 있어서 한번 보면 쉽게 잊히지 않아. 가까운 자리에서 웃을 때 그 기운이 더 또렷해져.";

  function baseIncomplete() {
    return {
      intro: "네 사주에는 사람을 끌어당기는 매력이 숨어 있어.",
      saekgi: {
        paragraphs: [longPara],
      },
      part1: {
        headline: "타고난 매력의 결",
        sections: [
          { paragraphs: [longPara] },
          { paragraphs: [longPara, "얼굴에서 도화가 맺히는 지점이 분명히 있어."] },
          { paragraphs: [longPara, null, ""] },
        ],
      },
      part2: {
        headline: "첫인상의 잔상",
        sections: [
          { paragraphs: [longPara, "처음 본 순간 분위기가 먼저 남아."] },
          { paragraphs: [longPara, "다가가기 전에도 시선이 한 번 더 가."] },
          { paragraphs: [longPara] },
        ],
      },
      part3: {
        headline: "분위기 키워드",
        keywords: [
          { name: "잔향", paragraphs: [longPara] },
          { name: "온기", paragraphs: [longPara, "가까이 오면 편안함이 먼저 와."] },
          { name: "여운", paragraphs: [longPara, "떠난 뒤에도 장면이 남아."] },
        ],
        closingLine: "세 기운이 겹쳐 너만의 분위기를 만들어.",
      },
      part4: {
        headline: "숨은 매력을 살리는 법",
        sections: [
          { paragraphs: [longPara, "특별한 순간에 매력이 더 선명해져."] },
          { paragraphs: [longPara, "로즈베이지 립과 쿨톤 핑크 블러셔가 잘 어울려."] },
          { paragraphs: [longPara, "딥 네이비와 아이보리가 중심 색이야."] },
        ],
        closingLine: "넌 잔향 있는 매력으로 기억되는 사람이야.",
      },
      part5: {
        headline: "인연의 결",
        sections: [
          { paragraphs: [longPara, "키는 182cm 전후로 보이네. 마케팅 일을 하는 사람일 가능성이 커."] },
          { paragraphs: [longPara, "2027년 3월 중순 무렵 만남이 열리기 쉬워."] },
          { paragraphs: [longPara, "가까워질수록 말수가 줄어드는 매력이 있어."] },
          { paragraphs: [longPara] },
        ],
        closingLine: "결국 너에게 빠질 사람은 여운을 읽는 타입이야.",
      },
      conclusion: "네 매력은 과하지 않은데 오래 남는 쪽이야.",
    };
  }

  function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
  }

  const incomplete = baseIncomplete();
  const before = validateReportForFinalOutputV2(incomplete);
  assert(!before.ok, "incomplete fixture should fail strict validation before repair");

  const repaired = repairIncompleteReportV2(incomplete);
  const after = validateReportForFinalOutputV2(repaired, incomplete);
  assert(after.ok, `repair+validate should pass: ${after.ok ? "" : after.reasons.join("; ")}`);
  if (!after.ok) throw new Error("unreachable");
  assert(after.data.saekgi.paragraphs.length >= 2, "saekgi needs >=2 paragraphs");
  assert(
    after.data.part1.sections.every((s: { paragraphs: string[] }) => s.paragraphs.length >= 2),
    "part1 paragraphs",
  );
  assert(after.data.part2.closingLine != null && after.data.part2.closingLine.length > 0, "part2 closingLine derived");

  const happy = validateReportForFinalOutputV2(after.data);
  assert(happy.ok, "already-valid report should pass final validation without meaningSource");

  const missingPart = { ...incomplete, part4: undefined };
  const unrepaired = repairIncompleteReportV2(missingPart);
  const stillBad = validateReportForFinalOutputV2(unrepaired, missingPart);
  assert(!stillBad.ok, "missing part4 must remain invalid (no invented prose)");

  console.log(
    JSON.stringify(
      {
        ok: true,
        beforeFailed: !before.ok,
        afterOk: after.ok,
        saekgiParagraphs: after.data.saekgi.paragraphs.length,
        part2ClosingLine: after.data.part2.closingLine,
        missingPartStillInvalid: !stillBad.ok,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
