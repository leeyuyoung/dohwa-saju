import Link from "next/link";
import { HanjiIntroVideo } from "@/components/newyear/HanjiIntroVideo";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { ReadingCountBubble } from "@/components/newyear/ReadingCountBubble";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
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
              <img src="/images/fatenavi4/hero-zodiac.jpg?v=6" alt="" />
              <p className="ny-premium-ribbon">태어나서부터 100세까지</p>
            </div>
            <p className="ny-premium-hero-kicker">PREMIUM</p>
            <h1 className="ny-premium-hero-title">종합사주</h1>
            <p className="ny-premium-price">5만자 이상의 미친 분량</p>
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
              <li>지금 고민에 맞춘 실행 포인트</li>
            </ul>
            <p className="ny-premium-note">좋은 말만 하지 않습니다. 길을 알려드립니다.</p>
          </section>
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
