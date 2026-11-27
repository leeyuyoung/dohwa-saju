"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { PRODUCT_NEWYEAR, type ProductId } from "@/lib/constants/newyear";

type FunnelRow = {
  step: string;
  label: string;
  sessions: number;
  dropOff: number | null;
};

type AnalysisRow = {
  token: string;
  createdAt: number;
  name: string;
  email: string | null;
  phone: string | null;
  marketingOptIn: boolean | null;
  attributionLabel: string;
  paidAt: number | null;
  status: string;
  emailSentAt: number | null;
  emailError: string | null;
  reportError: string | null;
  birth: { solar: string; lunar: string; time: string };
};

function formatEmailStatus(row: AnalysisRow) {
  if (row.emailSentAt) return { label: `발송 ${formatWhen(row.emailSentAt)}`, detail: null as string | null };
  if (row.emailError) return { label: "실패", detail: row.emailError };
  if (row.reportError) return { label: "생성실패", detail: row.reportError };
  if (row.status === "failed" && row.paidAt) return { label: "생성실패", detail: null };
  if (row.paidAt) return { label: "미발송", detail: null };
  return { label: "—", detail: null };
}

type Overview = {
  funnel: FunnelRow[];
  analyses: AnalysisRow[];
  generatedAt: number;
};

function formatWhen(ms: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatDrop(dropOff: number | null) {
  if (dropOff === null) return "—";
  return `${Math.round(dropOff * 100)}%`;
}

/** Asia/Seoul 기준 YYYY-MM-DD */
function kstYmd(ms = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function shiftKstYmd(ymd: string, offsetDays: number) {
  const base = Date.parse(`${ymd}T12:00:00+09:00`);
  return kstYmd(base + offsetDays * 24 * 60 * 60 * 1000);
}

const ANALYSES_PAGE_SIZE = 10;

type SortKey = "createdAt" | "paidAt";
type SortDir = "desc" | "asc";

const SORT_OPTIONS: { key: SortKey; dir: SortDir; label: string }[] = [
  { key: "createdAt", dir: "desc", label: "입력 최신순" },
  { key: "createdAt", dir: "asc", label: "입력 오래된순" },
  { key: "paidAt", dir: "desc", label: "결제 최신순" },
  { key: "paidAt", dir: "asc", label: "결제 오래된순" },
];

function sortAnalyses(rows: AnalysisRow[], key: SortKey, dir: SortDir) {
  const sign = dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = key === "paidAt" ? a.paidAt : a.createdAt;
    const bv = key === "paidAt" ? b.paidAt : b.createdAt;
    if (av === null && bv === null) return b.createdAt - a.createdAt;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (av === bv) return b.createdAt - a.createdAt;
    return av < bv ? -sign : sign;
  });
}

/** FateNavi premium vs 도화(night) 톤. 구조는 같고 클래스만 갈라진다. */
function adminTone(premium: boolean) {
  if (premium) {
    return {
      title: "font-serif text-xl text-[#1c1c1c]",
      h2: "font-serif text-base text-[#d4521c]",
      muted: "text-[rgb(28_28_28/0.55)]",
      mutedDim: "text-[rgb(28_28_28/0.45)]",
      ink: "text-[#1c1c1c]",
      link: "text-[#d4521c] underline-offset-2 hover:underline",
      danger: "text-[#b84316]",
      dangerSoft: "text-[#b84316]/90",
      input:
        "rounded-xl border border-[rgb(28_28_28/0.16)] bg-[#faf9f6] px-3 py-2.5 text-[#1c1c1c] outline-none focus:border-[#d4521c]/55",
      inputSm:
        "rounded-lg border border-[rgb(28_28_28/0.16)] bg-[#faf9f6] px-2 py-1.5 text-sm text-[#1c1c1c] outline-none focus:border-[#d4521c]/55",
      select:
        "rounded-lg border border-[rgb(28_28_28/0.16)] bg-[#faf9f6] px-2 py-1.5 text-xs text-[#1c1c1c] outline-none focus:border-[#d4521c]/55",
      ghostBtn:
        "rounded-full border border-[rgb(28_28_28/0.16)] px-3 py-1.5 text-xs text-[rgb(28_28_28/0.62)] hover:text-[#1c1c1c]",
      primaryBtn:
        "rounded-[14px] bg-[#1c1c1c] px-4 py-3 text-sm font-serif font-bold text-[#f5f3ee] disabled:opacity-40",
      tableWrap: "overflow-x-auto rounded-xl border border-[rgb(28_28_28/0.12)] bg-[#fcfbf9]",
      thead: "bg-[#f3f0ec] text-xs text-[rgb(28_28_28/0.55)]",
      rowBorder: "border-t border-[rgb(28_28_28/0.1)]",
      sortIdle: "text-[rgb(28_28_28/0.55)]",
      sortActive: "text-[#1c1c1c]",
      sortHover: "hover:text-[#1c1c1c]",
      chipActive: "border-[#d4521c]/45 text-[#d4521c]",
      chipIdle: "border-[rgb(28_28_28/0.16)] text-[rgb(28_28_28/0.55)] hover:text-[#1c1c1c]",
      mailOk: "text-[#1c1c1c]",
    };
  }
  return {
    title: "font-serif text-xl text-paper",
    h2: "font-serif text-base text-gold-soft",
    muted: "text-mist",
    mutedDim: "text-mist-dim",
    ink: "text-paper",
    link: "text-blossom underline-offset-2 hover:underline",
    danger: "text-fire",
    dangerSoft: "text-fire/90",
    input: "rounded-xl border border-line bg-ink/50 px-3 py-2.5 text-paper outline-none focus:border-gold/50",
    inputSm: "rounded-lg border border-line bg-ink/50 px-2 py-1.5 text-sm text-paper outline-none focus:border-gold/50",
    select: "rounded-lg border border-line bg-ink/50 px-2 py-1.5 text-xs text-paper outline-none focus:border-gold/50",
    ghostBtn: "rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:text-paper",
    primaryBtn: "rounded-full bg-cinnabar/90 px-4 py-3 text-sm text-paper disabled:opacity-40",
    tableWrap: "overflow-x-auto rounded-2xl border border-line",
    thead: "bg-ink/60 text-xs text-mist",
    rowBorder: "border-t border-line/70",
    sortIdle: "text-mist",
    sortActive: "text-paper",
    sortHover: "hover:text-paper",
    chipActive: "border-gold/50 text-gold-soft",
    chipIdle: "border-line text-mist hover:text-paper",
    mailOk: "text-paper",
  };
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  tone: ReturnType<typeof adminTone>;
}) {
  return (
    <th className="px-3 py-2 font-normal">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${tone.sortHover} ${active ? tone.sortActive : tone.sortIdle}`}
      >
        {label}
        <span aria-hidden className="text-[10px] tabular-nums">
          {active ? (dir === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </button>
    </th>
  );
}

/** 관리자 로그인·퍼널·제출 목록. 도화와 신년 사주는 화면을 따로 연다. */
export function AdminDashboard({
  initiallyAuthed,
  product = "dohwa",
}: {
  initiallyAuthed: boolean;
  product?: ProductId;
}) {
  const isNewYear = product === PRODUCT_NEWYEAR;
  /** FateNavi(/FateNavi/admin)만 premium 크림 톤. 도화 /admin 은 기존 night. */
  const premium = isNewYear;
  const tone = adminTone(premium);
  const Root = premium ? "div" : "main";
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLocked, setLoginLocked] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initiallyAuthed);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [funnelFrom, setFunnelFrom] = useState("");
  const [funnelTo, setFunnelTo] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (isNewYear) params.set("product", PRODUCT_NEWYEAR);
      if (funnelFrom) params.set("from", funnelFrom);
      if (funnelTo) params.set("to", funnelTo);
      const qs = params.toString();
      const overviewUrl = qs ? `/api/admin/overview?${qs}` : "/api/admin/overview";
      const response = await fetch(overviewUrl, { credentials: "same-origin" });
      if (response.status === 401) {
        setAuthed(false);
        setOverview(null);
        return;
      }
      const data = (await response.json().catch(() => ({}))) as Overview & { message?: string };
      if (!response.ok) {
        setLoadError(data.message ?? "현황을 불러오지 못했습니다.");
        return;
      }
      setOverview(data);
      setAnalysesPage(1);
      setAuthed(true);
    } catch {
      setLoadError("네트워크 오류로 현황을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [funnelFrom, funnelTo, isNewYear]);

  useEffect(() => {
    if (authed) void loadOverview();
  }, [authed, loadOverview]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (loginLocked) return;
    setLoggingIn(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        failures?: number;
        maxFailures?: number;
        locked?: boolean;
      };
      if (!response.ok) {
        const locked = response.status === 423 || data.locked === true;
        setLoginLocked(locked);
        if (locked) {
          setLoginError(
            data.message ?? "로그인 실패 횟수를 초과해 잠겼습니다. 관리자에게 잠금 해제를 요청해주세요.",
          );
        } else if (typeof data.failures === "number" && typeof data.maxFailures === "number") {
          setLoginError(`비밀번호가 올바르지 않습니다. (${data.failures}/${data.maxFailures})`);
        } else {
          setLoginError(data.message ?? "로그인에 실패했습니다.");
        }
        return;
      }
      setLoginLocked(false);
      setPassword("");
      setAuthed(true);
    } catch {
      setLoginError("네트워크 오류로 로그인하지 못했습니다.");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    setAuthed(false);
    setOverview(null);
    setAnalysesPage(1);
  };

  const sortedAnalyses = useMemo(
    () => sortAnalyses(overview?.analyses ?? [], sortKey, sortDir),
    [overview?.analyses, sortKey, sortDir],
  );
  const analysesTotal = sortedAnalyses.length;
  const analysesPageCount = Math.max(1, Math.ceil(analysesTotal / ANALYSES_PAGE_SIZE));
  const currentAnalysesPage = Math.min(analysesPage, analysesPageCount);
  const pageAnalyses = sortedAnalyses.slice(
    (currentAnalysesPage - 1) * ANALYSES_PAGE_SIZE,
    currentAnalysesPage * ANALYSES_PAGE_SIZE,
  );
  const sortValue = `${sortKey}:${sortDir}`;

  const setSort = (key: SortKey, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
    setAnalysesPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSort(key, sortDir === "desc" ? "asc" : "desc");
      return;
    }
    setSort(key, "desc");
  };

  if (!authed) {
    return (
      <Root
        className={`ny-admin mx-auto flex min-h-[70dvh] w-full max-w-sm flex-col justify-center gap-6 px-5 py-16 ${premium ? "" : "min-h-dvh"}`}
      >
        {premium ? <p className="ny-admin-kicker">ADMIN</p> : null}
        <h1 className={tone.title}>{isNewYear ? "프리미엄 종합사주 관리자" : "관리자 로그인"}</h1>
        <form onSubmit={login} className="flex flex-col gap-3">
          <label className={`flex flex-col gap-1.5 text-sm ${tone.muted}`}>
            비밀번호
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={tone.input}
            />
          </label>
          {loginError && (
            <p role="alert" className={`text-sm ${tone.danger}`}>
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loggingIn || loginLocked || !password}
            className={tone.primaryBtn}
          >
            {loggingIn ? "확인 중…" : loginLocked ? "잠김" : "들어가기"}
          </button>
        </form>
      </Root>
    );
  }

  return (
    <Root
      className="ny-admin mx-auto flex min-h-[70dvh] w-full max-w-[116rem] flex-col gap-10 px-5 py-10"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {premium ? <p className="ny-admin-kicker">ADMIN</p> : null}
          <h1 className={tone.title}>{isNewYear ? "프리미엄 종합사주" : "운영 현황"}</h1>
          {overview && (
            <p className={`mt-1 text-xs ${tone.mutedDim}`}>갱신 {formatWhen(overview.generatedAt)}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadOverview()} className={tone.ghostBtn}>
            새로고침
          </button>
          <button type="button" onClick={() => void logout()} className={tone.ghostBtn}>
            로그아웃
          </button>
        </div>
      </header>

      {loading && !overview && <p className={`text-sm ${tone.muted}`}>불러오는 중…</p>}
      {loadError && (
        <p role="alert" className={`text-sm ${tone.danger}`}>
          {loadError}
        </p>
      )}

      {overview && (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className={tone.h2}>{isNewYear ? "퍼널 분석" : "퍼널 (고유 세션)"}</h2>
              <p className={`text-xs ${tone.mutedDim}`}>
                {funnelFrom || funnelTo
                  ? `${funnelFrom || "…"} ~ ${funnelTo || "…"} (KST)`
                  : "전체 기간"}
                {loading ? " · 불러오는 중…" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { label: "오늘", from: kstYmd(), to: kstYmd() },
                    { label: "어제", from: shiftKstYmd(kstYmd(), -1), to: shiftKstYmd(kstYmd(), -1) },
                    { label: "7일", from: shiftKstYmd(kstYmd(), -6), to: kstYmd() },
                    { label: "전체", from: "", to: "" },
                  ] as const
                ).map((preset) => {
                  const active = funnelFrom === preset.from && funnelTo === preset.to;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFunnelFrom(preset.from);
                        setFunnelTo(preset.to);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        active ? tone.chipActive : tone.chipIdle
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <label className={`flex flex-col gap-1 text-xs ${tone.muted}`}>
                시작
                <input
                  type="date"
                  value={funnelFrom}
                  onChange={(event) => setFunnelFrom(event.target.value)}
                  className={tone.inputSm}
                />
              </label>
              <label className={`flex flex-col gap-1 text-xs ${tone.muted}`}>
                끝
                <input
                  type="date"
                  value={funnelTo}
                  onChange={(event) => setFunnelTo(event.target.value)}
                  className={tone.inputSm}
                />
              </label>
            </div>
            <div className={tone.tableWrap}>
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead className={tone.thead}>
                  <tr>
                    <th className="px-3 py-2 font-normal">단계</th>
                    <th className="px-3 py-2 font-normal">세션</th>
                    <th className="px-3 py-2 font-normal">{isNewYear ? "전환" : "이탈"}</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.funnel.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={`px-3 py-6 text-center ${tone.muted}`}>
                        아직 퍼널 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    overview.funnel.map((row, index) => {
                      const prev = index === 0 ? null : overview.funnel[index - 1]?.sessions ?? 0;
                      const conversion =
                        prev === null || prev === 0 ? null : Math.min(1, row.sessions / prev);
                      return (
                        <tr key={row.step} className={tone.rowBorder}>
                          <td className={`px-3 py-2 ${tone.ink}`}>{row.label}</td>
                          <td className={`px-3 py-2 tabular-nums ${tone.ink}`}>{row.sessions}</td>
                          <td className={`px-3 py-2 tabular-nums ${tone.muted}`}>
                            {isNewYear ? formatDrop(conversion) : formatDrop(row.dropOff)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className={tone.h2}>
                제출 목록{analysesTotal > 0 ? ` (${analysesTotal}건)` : ""}
              </h2>
              <label className={`flex items-center gap-2 text-xs ${tone.muted}`}>
                정렬
                <select
                  value={sortValue}
                  onChange={(event) => {
                    const [key, dir] = event.target.value.split(":") as [SortKey, SortDir];
                    setSort(key, dir);
                  }}
                  className={tone.select}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={`${option.key}:${option.dir}`} value={`${option.key}:${option.dir}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={tone.tableWrap}>
              <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
                <thead className={tone.thead}>
                  <tr>
                    <SortHeader
                      label="입력"
                      active={sortKey === "createdAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("createdAt")}
                      tone={tone}
                    />
                    <SortHeader
                      label="결제"
                      active={sortKey === "paidAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("paidAt")}
                      tone={tone}
                    />
                    <th className="px-3 py-2 font-normal">이름</th>
                    <th className="px-3 py-2 font-normal">양력</th>
                    <th className="px-3 py-2 font-normal">시간</th>
                    <th className="px-3 py-2 font-normal">유입</th>
                    <th className="px-3 py-2 font-normal">이메일</th>
                    <th className="px-3 py-2 font-normal">메일발송</th>
                    <th className="px-3 py-2 font-normal">휴대폰</th>
                    <th className="px-3 py-2 font-normal">마케팅</th>
                    <th className="px-3 py-2 font-normal">링크</th>
                  </tr>
                </thead>
                <tbody>
                  {analysesTotal === 0 ? (
                    <tr>
                      <td colSpan={11} className={`px-3 py-6 text-center ${tone.muted}`}>
                        아직 제출이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pageAnalyses.map((row) => {
                      const mail = formatEmailStatus(row);
                      return (
                        <tr key={row.token} className={`${tone.rowBorder} align-top`}>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>
                            {formatWhen(row.createdAt)}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>
                            {row.paidAt ? formatWhen(row.paidAt) : "미결제"}
                          </td>
                          <td className={`px-3 py-2 ${tone.ink}`}>{row.name}</td>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>{row.birth.solar}</td>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>{row.birth.time}</td>
                          <td
                            className={`max-w-[10rem] px-3 py-2 break-keep ${tone.muted}`}
                            title={row.attributionLabel}
                          >
                            {row.attributionLabel}
                          </td>
                          <td className={`px-3 py-2 break-all ${tone.muted}`}>{row.email ?? "—"}</td>
                          <td className={`max-w-[11rem] px-3 py-2 ${tone.muted}`}>
                            <span
                              className={
                                row.emailError || row.reportError || (row.status === "failed" && row.paidAt)
                                  ? tone.danger
                                  : row.emailSentAt
                                    ? tone.mailOk
                                    : ""
                              }
                            >
                              {mail.label}
                            </span>
                            {mail.detail && (
                              <p
                                className={`mt-1 line-clamp-2 break-all text-[11px] ${tone.dangerSoft}`}
                                title={mail.detail}
                              >
                                {mail.detail}
                              </p>
                            )}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>{row.phone ?? "—"}</td>
                          <td className={`whitespace-nowrap px-3 py-2 ${tone.muted}`}>
                            {row.marketingOptIn === true ? "동의" : row.marketingOptIn === false ? "거부" : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-1 text-xs">
                              <a className={tone.link} href={`/result/${row.token}`}>
                                결과
                              </a>
                              {!row.paidAt && (
                                <a className={tone.link} href={`/checkout/${row.token}`}>
                                  결제
                                </a>
                              )}
                              {row.paidAt && (
                                <a className={tone.link} href={`/report/${row.token}`}>
                                  리포트
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {analysesTotal > ANALYSES_PAGE_SIZE && (
              <div className={`flex items-center justify-center gap-3 pt-1 text-sm ${tone.muted}`}>
                <button
                  type="button"
                  disabled={currentAnalysesPage <= 1}
                  onClick={() => setAnalysesPage((page) => Math.max(1, page - 1))}
                  className={`${tone.ghostBtn} disabled:opacity-30`}
                >
                  이전
                </button>
                <span className={`tabular-nums ${tone.ink}`}>
                  {currentAnalysesPage} / {analysesPageCount}
                </span>
                <button
                  type="button"
                  disabled={currentAnalysesPage >= analysesPageCount}
                  onClick={() => setAnalysesPage((page) => Math.min(analysesPageCount, page + 1))}
                  className={`${tone.ghostBtn} disabled:opacity-30`}
                >
                  다음
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </Root>
  );
}
