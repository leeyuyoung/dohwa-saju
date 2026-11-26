import Link from "next/link";
import { HanjiIntroVideo } from "@/components/newyear/HanjiIntroVideo";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { ReadingCountBubble } from "@/components/newyear/ReadingCountBubble";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import { NEWYEAR_LEGAL_LINKS } from "@/lib/constants/legal";
import {
  NEWYEAR_LIST_PRICE,
  NEWYEAR_REPORT_PRICE,
  PREMIUM_TOC_PARTS,
} from "@/lib/constants/newyear";
import { formatPrice } from "@/lib/constants/service";

const PREMIUM_REVIEWS = [
  {
    name: "이세O",
    body: "요즘 인생 현타와서 홀린 듯이 질렀습니다. 솔직히 반신반의했는데 결제하고 스크롤 내리다가 너무 용해서 기절할 뻔했네요. 뜬구름 잡는 소리 안 하고 팩폭 제대로 때려주네요. 제 타고난 기질 보면서 뜨끔한 부분이 한두 군데가 아니었습니다. 다른 사주들은 제 고민 적는 곳이 없는데 이건 적는 칸이 있어서 그거에 대해 딱 알려주니까 방향 잡기가 훨씬 수월하네요. 이 가격에 이 정도 퀄리티면 돈 전혀 안 아깝습니다.",
    quoteBefore: "이 가격에 이 정도 퀄리티면 ",
    quoteEmph: "돈 전혀 안 아깝습니다.",
    quoteAfter: "",
  },
  {
    name: "김미O",
    body: "서른 넘어가니까 인생의 갈림길에 서 있는 느낌이 들고 주변에 털어놓기도 애매해서 신청해 봤는데, 진짜 제대로 돈 값 합니다 !! 분량도 많고 정확해요. 특히 제가 요즘 제일 고민하던 부분에 대해 현실적인 액션 플랜을 콕 집어줘서 너무 좋았어요. 전 남자친구랑 헤어진 이유까지 설명되네요. 제 기질에 다 이유가 있었네요. 두고두고 보려구요.",
    quoteBefore: "전 남자친구랑 헤어진 이유까지 설명되네요. ",
    quoteEmph: "제 기질에 다 이유가 있었네요.",
    quoteAfter: " 두고두고 보려구요.",
  },
  {
    name: "이은O",
    body: "예전에 유명한 철학관 가서 10만 원 내고 20분 듣고 온 적 있는데, 나오자마자 다 까먹어서 아까웠거든요. 근데 이건 계속 볼 수 있어서 좋네요. 재물운, 직업운, 결혼운까지 빠지는 거 없이 디테일하고, 무엇보다 투자 망했던 시기까지 맞춰서 소름 돋았어요. 앞으로 돈 들어오는 시기도 알았으니 조심하려구요. 고민 많으신 30대 분들 한 번쯤 꼭 보시는 거 추천해요!",
    quoteBefore: "",
    quoteEmph: "투자 망했던 시기까지 맞춰서 소름 돋았어요.",
    quoteAfter: " 앞으로 돈 들어오는 시기도 알았으니 조심하려구요.",
  },
] as const;

const PREMIUM_KAKAO_REVIEWS = Array.from({ length: 11 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/images/fatenavi4/kakao-reviews/review-${n}.jpg`;
});

/** 2열·3열·2열 리듬으로 나열 (합 11) */
const PREMIUM_KAKAO_ROWS: { cols: 2 | 3; images: string[] }[] = [
  { cols: 2, images: PREMIUM_KAKAO_REVIEWS.slice(0, 2) },
  { cols: 3, images: PREMIUM_KAKAO_REVIEWS.slice(2, 5) },
  { cols: 2, images: PREMIUM_KAKAO_REVIEWS.slice(5, 7) },
  { cols: 2, images: PREMIUM_KAKAO_REVIEWS.slice(7, 9) },
  { cols: 2, images: PREMIUM_KAKAO_REVIEWS.slice(9, 11) },
];

export function FateNaviHome({ theme }: { theme: FateNaviThemeId }) {
  const config = themeOf(theme);
  const stickyCta = (
    <div className="ny-poster-cta">
      <ReadingCountBubble />
      <Link href={`${config.basePath}/start`} className="ny-btn">
        {config.ctaStart}
      </Link>
    </div>
  );

  if (theme === "sheep") {
    return (
      <NewYearShell theme={theme} showHeader={false} stickyCta={stickyCta}>
        <section className="ny-sheep-poster" aria-label="메리운세 인트로">
          <div className="ny-sheep-poster-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/fatenavi2/mery-intro-full.png"
              alt="메리운세"
              className="ny-sheep-poster-img"
            />
            <div className="ny-sheep-poster-scrim" aria-hidden />
            <div className="ny-sheep-poster-bubble">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/fatenavi2/mery-bubble.png?v=2"
                alt=""
                className="ny-sheep-poster-bubble-img"
              />
              <span className="ny-sheep-poster-bubble-text">올해도 고생했어!</span>
            </div>
          </div>
        </section>
      </NewYearShell>
    );
  }

  if (theme === "premium") {
    return (
      <NewYearShell theme={theme} showHeader={false} stickyCta={stickyCta}>
        <div className="ny-premium-landing">
          <section className="ny-premium-hero" aria-label="프리미엄 종합사주">
            <span className="ny-premium-hero-corner ny-premium-hero-corner-tl" aria-hidden />
            <span className="ny-premium-hero-corner ny-premium-hero-corner-tr" aria-hidden />
            <span className="ny-premium-hero-corner ny-premium-hero-corner-bl" aria-hidden />
            <span className="ny-premium-hero-corner ny-premium-hero-corner-br" aria-hidden />
            <div className="ny-premium-hero-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/fatenavi4/hero-zodiac.jpg?v=8" alt="" />
              <p className="ny-premium-ribbon">태어나서부터 100세까지</p>
            </div>
            <p className="ny-premium-hero-kicker">PREMIUM</p>
            <h1 className="ny-premium-hero-title">종합사주</h1>
            <p className="ny-premium-price">
              <span>
                <s>{formatPrice(NEWYEAR_LIST_PRICE)}</s>
                {formatPrice(NEWYEAR_REPORT_PRICE)}
              </span>
              <span className="ny-premium-price-note">5만자 이상의 미친 분량</span>
            </p>
          </section>

          <section className="ny-premium-section" aria-label="구성 안내">
            <h2 className="ny-premium-section-title">구성</h2>
            <p className="ny-premium-section-lead">1:1 맞춤 프리미엄 사주</p>
            <div className="ny-premium-features">
              {[
                { num: "01", label: "사주 원국\n정밀 분석" },
                { num: "02", label: "대운·세운\n흐름 해석" },
                { num: "03", label: "재물/직업\n건강/결혼운" },
              ].map((item) => (
                <div key={item.num} className="ny-premium-feature">
                  <span className="ny-premium-feature-num">{item.num}</span>
                  <p className="ny-premium-feature-label">
                    {item.label.split("\n").map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            <ul className="ny-premium-bullets">
              <li>타고난 기질과 강점·약점</li>
              <li>100년 인생 흐름과 갈림길</li>
              <li>2027년은 월별로까지</li>
              <li>지금 고민에 맞춘 실행 포인트</li>
            </ul>
            <p className="ny-premium-note">좋은 말만 하지 않습니다. 길을 알려드립니다.</p>
          </section>

          <section className="ny-premium-compare" aria-label="비교">
            <h2 className="ny-premium-compare-title">한 번 듣고 끝내시겠어요?</h2>
            <div className="ny-premium-compare-grid">
              <article className="ny-premium-compare-card is-before">
                <p className="ny-premium-compare-label">일반 철학관</p>
                <p className="ny-premium-compare-price">10만~30만 원</p>
                <ul>
                  <li>원국·대운까지는 안 감</li>
                  <li>한정된 시간</li>
                  <li>속 깊은 질문은 꺼내기 어렵고</li>
                  <li>시간 지나면 까먹음</li>
                </ul>
              </article>
              <article className="ny-premium-compare-card is-after">
                <p className="ny-premium-compare-label">프리미엄 종합사주</p>
                <p className="ny-premium-compare-price">
                  <s>{formatPrice(NEWYEAR_LIST_PRICE)}</s>
                  {formatPrice(NEWYEAR_REPORT_PRICE)}
                </p>
                <ul>
                  <li>원국부터 실행 포인트까지</li>
                  <li>100세 인생 분석</li>
                  <li>적어 주신 고민까지 반영</li>
                  <li>이메일로 평생 소장</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="ny-premium-trust" aria-label="해석 근거">
            <p className="ny-premium-trust-hook">
              <span className="ny-premium-trust-mark">혼자</span> 만들지 않았습니다.
            </p>
            <p className="ny-premium-trust-lead">
              <span className="ny-premium-trust-chip">현직 역술인</span>들과 함께 설계
            </p>
            <div className="ny-premium-trust-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/fatenavi4/trust-astronomy.jpg" alt="" />
            </div>
            <div className="ny-premium-trust-body">
              <p>
                <span className="ny-premium-trust-em">명리학적 해석 체계</span>를 바탕으로
                <br />
                역술인들의 <span className="ny-premium-trust-em">해석 방식과 판단 기준</span>을
                <br />
                <span className="ny-premium-trust-em">설계 단계부터</span> 반영했습니다.
              </p>
              <div className="ny-premium-trust-seal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/fatenavi4/trust-seal.png" alt="정통" />
              </div>
              <p>
                여러 차례의 <span className="ny-premium-trust-em">교차 검토와 문장 검증</span>을 거쳐
                <br />
                <span className="ny-premium-trust-em">근거 있는 풀이</span>가 나오도록 했습니다.
              </p>
            </div>
            <p className="ny-premium-trust-close">
              <span className="ny-premium-trust-mark">현장의 경험</span>을 알고리즘에 담았습니다.
            </p>
          </section>

          <section className="ny-premium-kakao" aria-label="카톡 실제 후기">
            <h2 className="ny-premium-kakao-title">실제 후기</h2>
            <div className="ny-premium-kakao-list">
              {PREMIUM_KAKAO_ROWS.map((row, rowIndex) => (
                <ul
                  key={rowIndex}
                  className={`ny-premium-kakao-row ny-premium-kakao-row-${row.cols}`}
                >
                  {row.images.map((src, index) => (
                    <li key={src} className="ny-premium-kakao-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`카톡 후기 ${rowIndex * 4 + index + 1}`}
                        className="ny-premium-kakao-img"
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </section>

          <section className="ny-premium-reviews" aria-label="이용 후기">
            <ul className="ny-premium-review-list">
              {PREMIUM_REVIEWS.map((review) => (
                <li key={review.name} className="ny-premium-review">
                  <div className="ny-premium-review-card">
                    <div className="ny-premium-review-head">
                      <span className="ny-premium-review-avatar" aria-hidden>
                        {review.name.slice(0, 1)}
                      </span>
                      <p className="ny-premium-review-name">{review.name} 님</p>
                      <span className="ny-premium-review-badge">적극 추천</span>
                    </div>
                    <p className="ny-premium-review-stars" aria-label="별점 5점">
                      ★★★★★
                    </p>
                    <p className="ny-premium-review-body">{review.body}</p>
                  </div>
                  <blockquote className="ny-premium-review-quote">
                    {review.quoteBefore}
                    <em>{review.quoteEmph}</em>
                    {review.quoteAfter}
                  </blockquote>
                </li>
              ))}
            </ul>
          </section>

          <section className="ny-premium-toc" aria-label="목차">
            <div className="ny-premium-toc-head">
              <span className="ny-premium-toc-mark" aria-hidden />
              <h2 className="ny-premium-toc-title">목차</h2>
              <p className="ny-premium-toc-lead">총 17장 · 한 권 분량</p>
            </div>

            <div className="ny-premium-toc-parts">
              {(() => {
                let chapterNo = 0;
                return PREMIUM_TOC_PARTS.map((part) => (
                  <div key={part.part} className="ny-premium-toc-part">
                    <h3 className="ny-premium-toc-part-title">
                      <span className="ny-premium-toc-diamond" aria-hidden />
                      <span>
                        제{part.part}부. {part.title}
                      </span>
                    </h3>
                    <ul className="ny-premium-toc-chapters">
                      {part.chapters.map((title) => {
                        chapterNo += 1;
                        return (
                          <li key={title}>
                            <span className="ny-premium-toc-num">
                              {String(chapterNo).padStart(2, "0")}
                            </span>
                            <span>{title}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          </section>

          <footer className="ny-premium-legal">
            <p>
              본 서비스의 해석은 사주 명리학의 전통적 해석 체계를 바탕으로 한 참고용 콘텐츠이며, 의료·법률·투자 등
              전문적인 판단을 대신하지 않습니다.
            </p>
            <nav className="ny-premium-legal-nav" aria-label="약관 및 사업자 정보">
              {NEWYEAR_LEGAL_LINKS.map((link, index) => (
                <span key={link.href} className="ny-premium-legal-item">
                  {index > 0 ? <span aria-hidden>·</span> : null}
                  <Link href={link.href}>{link.label}</Link>
                </span>
              ))}
            </nav>
          </footer>
        </div>
      </NewYearShell>
    );
  }

  return (
    <NewYearShell theme={theme} showHeader={false} stickyCta={stickyCta}>
      <div className="ny-hanji-landing">
        <section className="ny-hanji-poster" aria-label="운명내비 인트로">
          <div className="ny-hanji-poster-media">
            <HanjiIntroVideo />
            <div className="ny-hanji-poster-scrim" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/fatenavi3/cta-badge.png"
              alt="정통 명리학 기반"
              className="ny-hanji-cta-badge"
            />
            <div className="ny-hanji-poster-brand" aria-label={config.brand}>
              {[
                { src: "/images/fatenavi3/brand-chars/1-운.png?v=5", ch: "운" },
                { src: "/images/fatenavi3/brand-chars/2-명.png?v=5", ch: "명" },
                { src: "/images/fatenavi3/brand-chars/3-내.png?v=5", ch: "내" },
                { src: "/images/fatenavi3/brand-chars/4-비.png?v=5", ch: "비" },
              ].map((item, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.ch}
                  src={item.src}
                  alt=""
                  aria-hidden
                  className="ny-hanji-poster-brand-char"
                  style={{ animationDelay: `${0.18 + i * 0.24}s` }}
                />
              ))}
            </div>
            <p className="ny-hanji-poster-slogan">
              좋은 말만 하지 않습니다.
              <br />
              가야 할 길을 짚어드립니다.
            </p>
          </div>
        </section>

        <section className="ny-hanji-below" aria-label="설계서 안내">
          <div className="ny-hanji-below-block">
            <h2 className="ny-hanji-below-title">인생 설계서 한 권</h2>
            <p className="ny-hanji-below-body">
              사주 원국부터 100년 인생 흐름까지.
              <br />
              좋은 말만 하지 않고, 막히는 구간과 해결법
              <br />
              모두 알려드립니다.
            </p>
          </div>

          <div className="ny-hanji-below-block">
            <h2 className="ny-hanji-below-title">구성</h2>
            <div className="ny-hanji-below-features">
              {[
                { num: "01", label: "사주 원국\n정밀 분석" },
                { num: "02", label: "대운·세운\n흐름 해석" },
                { num: "03", label: "재물/직업\n건강/결혼운" },
              ].map((item) => (
                <div key={item.num} className="ny-hanji-below-feature">
                  <span className="ny-hanji-below-feature-num">{item.num}</span>
                  <p className="ny-hanji-below-feature-label">
                    {item.label.split("\n").map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="ny-hanji-below-block">
            <h2 className="ny-hanji-below-title">왜 운명내비인가</h2>
            <ul className="ny-hanji-below-bullets">
              <li>
                듣기 좋은 덕담 대신, <span className="ny-hanji-below-em">흉운의 시기</span>까지 가감
                없이
              </li>
              <li>
                <span className="ny-hanji-below-em">돈이 터지는 시기</span> - 타이밍과 돌파구 제시
              </li>
              <li>
                <span className="ny-hanji-below-em">100년 인생 풀이</span>와 구체적인 행동 지침 제시
              </li>
            </ul>
            <p className="ny-hanji-below-note">정통 명리학 기반 · 1:1 맞춤 풀이</p>
          </div>
        </section>
      </div>
    </NewYearShell>
  );
}
