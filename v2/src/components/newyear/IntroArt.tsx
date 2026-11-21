import type { FateNaviThemeId } from "@/lib/constants/fatenaviTheme";

/** 인트로용 간단 일러스트. 테마별로 그림만 바뀐다. */
export function IntroArt({ theme }: { theme: FateNaviThemeId }) {
  if (theme === "sheep") {
    return (
      <div className="ny-intro-art ny-sheep-art" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/fatenavi2/mery-duo.png"
          alt=""
          className="ny-sheep-hero-img"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    );
  }

  if (theme === "hanji") {
    return (
      <div className="ny-intro-art ny-hanji-art" aria-hidden>
        <div className="ny-hanji-scroll">
          <p className="ny-hanji-title">命運</p>
          <p className="ny-hanji-sub">人生設計書</p>
          <span className="ny-hanji-seal">運</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ny-intro-art" aria-hidden>
      <div className="ny-intro-path" />
      <span className="ny-intro-node" data-signal="go" style={{ left: "12%", top: "58%" }} />
      <span className="ny-intro-node" data-signal="warn" style={{ left: "38%", top: "28%" }} />
      <span className="ny-intro-node" data-signal="stop" style={{ left: "62%", top: "52%" }} />
      <span className="ny-intro-node" data-signal="go" style={{ left: "84%", top: "22%" }} />
      <span className="ny-intro-pin" />
    </div>
  );
}
