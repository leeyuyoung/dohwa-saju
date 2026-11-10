"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

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
  birth: { solar: string; lunar: string; time: string };
};

function formatEmailStatus(row: AnalysisRow) {
  if (row.emailSentAt) return { label: `발송 ${formatWhen(row.emailSentAt)}`, detail: null as string | null };
  if (row.emailError) return { label: "실패", detail: row.emailError };
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

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-3 py-2 font-normal">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-paper ${active ? "text-paper" : "text-mist"}`}
      >
        {label}
        <span aria-hidden className="text-[10px] tabular-nums">
          {active ? (dir === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </button>
    </th>
  );
}

/** 관리자 로그인·퍼널·제출 목록. 공개 UI와 분리된 운영 화면. */
export function AdminDashboard({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initiallyAuthed);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/overview", { credentials: "same-origin" });
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
  }, []);

  useEffect(() => {
    if (authed) void loadOverview();
  }, [authed, loadOverview]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setLoginError(data.message ?? "로그인에 실패했습니다.");
        return;
      }
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
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-5 py-16">
        <h1 className="font-serif text-xl text-paper">관리자 로그인</h1>
        <form onSubmit={login} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-mist">
            비밀번호
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-line bg-ink/50 px-3 py-2.5 text-paper outline-none focus:border-gold/50"
            />
          </label>
          {loginError && (
            <p role="alert" className="text-sm text-fire">
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loggingIn || !password}
            className="rounded-full bg-cinnabar/90 px-4 py-3 text-sm text-paper disabled:opacity-40"
          >
            {loggingIn ? "확인 중…" : "들어가기"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-10 px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl text-paper">운영 현황</h1>
          {overview && (
            <p className="mt-1 text-xs text-mist-dim">갱신 {formatWhen(overview.generatedAt)}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadOverview()}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:text-paper"
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:text-paper"
          >
            로그아웃
          </button>
        </div>
      </header>

      {loading && !overview && <p className="text-sm text-mist">불러오는 중…</p>}
      {loadError && (
        <p role="alert" className="text-sm text-fire">
          {loadError}
        </p>
      )}

      {overview && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-base text-gold-soft">퍼널 (고유 세션)</h2>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                <thead className="bg-ink/60 text-xs text-mist">
                  <tr>
                    <th className="px-3 py-2 font-normal">단계</th>
                    <th className="px-3 py-2 font-normal">세션</th>
                    <th className="px-3 py-2 font-normal">이탈</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.funnel.map((row) => (
                    <tr key={row.step} className="border-t border-line/70">
                      <td className="px-3 py-2 text-paper">{row.label}</td>
                      <td className="px-3 py-2 tabular-nums text-paper">{row.sessions}</td>
                      <td className="px-3 py-2 tabular-nums text-mist">{formatDrop(row.dropOff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-base text-gold-soft">
                제출 목록{analysesTotal > 0 ? ` (${analysesTotal}건)` : ""}
              </h2>
              <label className="flex items-center gap-2 text-xs text-mist">
                정렬
                <select
                  value={sortValue}
                  onChange={(event) => {
                    const [key, dir] = event.target.value.split(":") as [SortKey, SortDir];
                    setSort(key, dir);
                  }}
                  className="rounded-lg border border-line bg-ink/50 px-2 py-1.5 text-xs text-paper outline-none focus:border-gold/50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={`${option.key}:${option.dir}`} value={`${option.key}:${option.dir}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
                <thead className="bg-ink/60 text-xs text-mist">
                  <tr>
                    <SortHeader
                      label="입력"
                      active={sortKey === "createdAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("createdAt")}
                    />
                    <SortHeader
                      label="결제"
                      active={sortKey === "paidAt"}
                      dir={sortDir}
                      onClick={() => toggleSort("paidAt")}
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
                      <td colSpan={11} className="px-3 py-6 text-center text-mist">
                        아직 제출이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pageAnalyses.map((row) => {
                      const mail = formatEmailStatus(row);
                      return (
                        <tr key={row.token} className="border-t border-line/70 align-top">
                          <td className="whitespace-nowrap px-3 py-2 text-mist">{formatWhen(row.createdAt)}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-mist">
                            {row.paidAt ? formatWhen(row.paidAt) : "미결제"}
                          </td>
                          <td className="px-3 py-2 text-paper">{row.name}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-mist">{row.birth.solar}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-mist">{row.birth.time}</td>
                          <td className="max-w-[10rem] px-3 py-2 break-keep text-mist" title={row.attributionLabel}>
                            {row.attributionLabel}
                          </td>
                          <td className="px-3 py-2 break-all text-mist">{row.email ?? "—"}</td>
                          <td className="max-w-[11rem] px-3 py-2 text-mist">
                            <span className={row.emailError ? "text-fire" : row.emailSentAt ? "text-paper" : ""}>
                              {mail.label}
                            </span>
                            {mail.detail && (
                              <p className="mt-1 line-clamp-2 break-all text-[11px] text-fire/90" title={mail.detail}>
                                {mail.detail}
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-mist">{row.phone ?? "—"}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-mist">
                            {row.marketingOptIn === true ? "동의" : row.marketingOptIn === false ? "거부" : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-1 text-xs">
                              <a className="text-blossom underline-offset-2 hover:underline" href={`/result/${row.token}`}>
                                결과
                              </a>
                              {!row.paidAt && (
                                <a
                                  className="text-blossom underline-offset-2 hover:underline"
                                  href={`/checkout/${row.token}`}
                                >
                                  결제
                                </a>
                              )}
                              {row.paidAt && (
                                <a
                                  className="text-blossom underline-offset-2 hover:underline"
                                  href={`/report/${row.token}`}
                                >
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
              <div className="flex items-center justify-center gap-3 pt-1 text-sm text-mist">
                <button
                  type="button"
                  disabled={currentAnalysesPage <= 1}
                  onClick={() => setAnalysesPage((page) => Math.max(1, page - 1))}
                  className="rounded-full border border-line px-3 py-1.5 text-xs hover:text-paper disabled:opacity-30"
                >
                  이전
                </button>
                <span className="tabular-nums text-paper">
                  {currentAnalysesPage} / {analysesPageCount}
                </span>
                <button
                  type="button"
                  disabled={currentAnalysesPage >= analysesPageCount}
                  onClick={() => setAnalysesPage((page) => Math.min(analysesPageCount, page + 1))}
                  className="rounded-full border border-line px-3 py-1.5 text-xs hover:text-paper disabled:opacity-30"
                >
                  다음
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
