import { FunnelBeacon } from "@/components/analytics/FunnelBeacon";
import { PageShell } from "@/components/layout/PageShell";
import { FreeTypeTeaser, ReportToc } from "@/components/result/FreeResultParts";
import { ManseryeokTable } from "@/components/result/ManseryeokTable";
import { ReviewCarousel } from "@/components/result/ReviewCarousel";
import { StickyCheckoutBar } from "@/components/result/StickyCheckoutBar";
import { BloomCard, FaceCard, PartnerCard, ScoreCard, SinseonLines, SinseonScene } from "@/components/result/TeaserCards";
import { WebtoonPanel } from "@/components/webtoon/WebtoonPanel";
import { DETAILED_REPORT_ORDER_NAME } from "@/lib/constants/service";
import type { FreeResultView } from "@/types/result";

const SEASONS = ["겨울", "봄", "여름", "가을"] as const;
const seasonOf = (month: number) => SEASONS[Math.floor((month % 12) / 3)];

/** 결제 버튼이 이 칸에 닿은 뒤부터 화면 아래에 따라다닌다. */
const TYPE_TEASER_ID = "dohwa-type";

const glow = (text: string) => <span className="text-blossom-glow">{text}</span>;

/** 무료 결과 화면. 도화선녀의 대사와 반만 열린 카드가 번갈아 나온다. 샘플이면 버튼이 입력 화면으로 간다. */
export function FreeResultScreen({
  result,
  sample = false,
  token,
  paid = false,
  paymentsReady = false,
}: {
  result: FreeResultView;
  sample?: boolean;
  token?: string;
  paid?: boolean;
  /** 결제 설정이 되어 있으면 CTA가 아래에서 시트를 연다. */
  paymentsReady?: boolean;
}) {
  const cta =
    paid && token
      ? { href: `/report/${token}`, label: "내 리포트 보러 가기" }
      : sample || !token
        ? { href: "/start", label: "숨겨진 색기 확인하기" }
        : { href: `/checkout/${token}`, label: "숨겨진 색기 확인하기" };

  const checkout =
    !paid && !sample && token && paymentsReady
      ? {
          token,
          title: DETAILED_REPORT_ORDER_NAME,
          buyerName: result.name,
        }
      : undefined;

  return (
    <PageShell withStickyBar>
      {token && !sample ? <FunnelBeacon step="result" token={token} /> : null}
      <h1 className="sr-only">{result.name}의 도화 풀이</h1>

      <WebtoonPanel
        priority
        src="/images/sunnyeo/holding-paper-back.jpg"
        alt="달밤의 복숭아꽃 정원에서 종이 뒷면을 보이며 건네는 도화선녀"
        bubbles={[
          { kind: "speech", text: "자, 여기 봐.", at: 0.15, place: { top: "4%", left: "5%" } },
          { kind: "whisper", text: `${result.name}.`, at: 0.65, place: { top: "31%", right: "3%" }, big: true },
          {
            kind: "caption",
            text: `${result.birth.year}년 ${seasonOf(result.birth.month)}에 피어난 꽃이네`,
            at: 1.3,
            place: { top: "84%", left: "5%" },
          },
        ]}
      />

      <SinseonLines
        lines={[
          <>
            먼저 네 사주에 새겨진
            <br />
            {glow("여덟 글자")}부터 짚어볼게.
          </>,
        ]}
      />
      <ManseryeokTable
        name={result.name}
        dayPillarName={result.dayPillarName}
        birthLabel={result.birthLabel}
        pillars={result.pillars}
      />

      <SinseonLines lines={[<>이 글자들로 네 {glow("도화 점수")}를 읽어볼게.</>]} />
      <ScoreCard result={result} />

      <SinseonLines
        lines={[
          <>
            점수만으로는 부족해.
            <br />
            네 {glow("도화유형")}도 살짝 열어줄게.
          </>,
        ]}
      />
      <div id={TYPE_TEASER_ID}>
        <FreeTypeTeaser type={result.dohwa.type} />
      </div>

      <SinseonScene
        className="mt-2"
        src="/images/sunnyeo/hero-eyes-closed-v2.png"
        alt="달빛 아래 벚꽃 사이로 돌아보며 눈 감고 웃는 도화선녀"
        headroom={0.06}
        cropBottom={0.08}
        bubbles={[
          { kind: "speech", text: "이 정도면…\n남자들이 가만 안 뒀을걸?", at: 0.2, place: { top: "2%", right: "3%" } },
          { kind: "speech", text: "근데 꽃은\n아무 때나 피는 게 아니야.", at: 1.2, place: { top: "64%", left: "3%" } },
        ]}
        lines={[
          <>
            네 사주엔 {glow("색기가 터지는 때")}가
            <br />
            이미 정해져 있어.
          </>,
        ]}
      />
      <BloomCard result={result} />

      <SinseonScene
        className="mt-2"
        src="/images/sunnyeo/tree-lean.jpg"
        alt="보름달 아래 복숭아나무에 기대어 팔짱을 낀 채 내려다보며 웃는 도화선녀"
        headroom={0.02}
        cropBottom={0.12}
        bubbles={[
          { kind: "speech", text: "얼마 안 남았어.", at: 0.3, place: { top: "8%", left: "8%" } },
          { kind: "speech", text: "그 달엔 가만있어도\n남자들이 꼬일걸.", at: 1.4, place: { top: "66%", right: "3%" } },
        ]}
        lines={[
          <>
            그때 너한테 목맬 남자…
            <br />
            궁금하지? {glow("살짝만")} 보여주지.
          </>,
        ]}
      />
      <PartnerCard result={result} />

      <SinseonLines
        divided
        lines={[
          <>
            네가 마음만 먹으면,
            <br />그 남잔 이미 {glow("네 손안에")} 있어.
          </>,
          <>
            근데 먼저 알아야 해.
            <br />그 남자 눈에 {glow("네가 어떻게 보이는지.")}
          </>,
        ]}
      />
      <FaceCard result={result} />

      <SinseonScene
        src="/images/sunnyeo/peach-bite.jpg"
        alt="복숭아나무 아래 비스듬히 기대앉아 복숭아를 입에 문 도화선녀"
        bubbles={[
          {
            kind: "speech",
            text: "색 하나 바꿨을 뿐인데,\n그 남자의 눈빛이\n달라질 거야.",
            at: 0.3,
            place: { top: "5%", left: "3%" },
          },
          { kind: "speech", text: "머리끝부터 향까지,\n다 정리해 뒀어.", at: 1.4, place: { top: "64%", right: "3%" } },
        ]}
        lines={[
          <>
            그 남자 {glow("정신 못 차리게")} 하는 법,
            <br />
            숨김없이, 아주 구체적으로 적어 뒀어.
          </>,
        ]}
      />

      <div className="mt-16 flex flex-col gap-16">
        <ReportToc gender={result.gender} />
        <ReviewCarousel />
      </div>

      <div className="mt-4">
        <WebtoonPanel
          src="/images/sunnyeo/whisper-offer.jpg"
          alt="가까이 기대어 속삭이며 손을 내밀어 함께 가자고 청하는 도화선녀"
          headroom={0.22}
          bubbles={[
            { kind: "speech", text: "그 색기,\n썩히기엔 아깝잖아.", at: 0.3, place: { top: "7%", left: "4%" } },
            { kind: "whisper", text: "이제\n쓰면 돼.", at: 1.6, place: { top: "72%", right: "5%" } },
          ]}
        />
      </div>

      <StickyCheckoutBar
        href={cta.href}
        label={cta.label}
        showAfterId={paid ? undefined : TYPE_TEASER_ID}
        checkout={checkout}
      />
    </PageShell>
  );
}
