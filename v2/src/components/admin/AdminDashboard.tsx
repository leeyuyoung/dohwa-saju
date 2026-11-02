"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

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
  relationshipLabel: string;
  paidAt: number | null;
  status: string;
  birth: { solar: string; lunar: string; time: string };
};

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

/** 관리자 로그인·퍼널·제출 목록. 공개 UI와 분리된 운영 화면. */
export function AdminDashboard({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initiallyAuthed);

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
            <h2 className="font-serif text-base text-gold-soft">제출 목록 (최신 100건)</h2>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
                <thead className="bg-ink/60 text-xs text-mist">
                  <tr>
                    <th className="px-3 py-2 font-normal">시각</th>
                    <th className="px-3 py-2 font-normal">이름</th>
                    <th className="px-3 py-2 font-normal">양력</th>
                    <th className="px-3 py-2 font-normal">시간</th>
                    <th className="px-3 py-2 font-normal">연애</th>
                    <th className="px-3 py-2 font-normal">이메일</th>
                    <th className="px-3 py-2 font-normal">결제</th>
                    <th className="px-3 py-2 font-normal">링크</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.analyses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-mist">
                        아직 제출이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    overview.analyses.map((row) => (
                      <tr key={row.token} className="border-t border-line/70 align-top">
                        <td className="whitespace-nowrap px-3 py-2 text-mist">{formatWhen(row.createdAt)}</td>
                        <td className="px-3 py-2 text-paper">{row.name}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-mist">{row.birth.solar}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-mist">{row.birth.time}</td>
                        <td className="max-w-[9rem] px-3 py-2 text-mist break-keep">{row.relationshipLabel}</td>
                        <td className="px-3 py-2 text-mist break-all">{row.email ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-mist">
                          {row.paidAt ? formatWhen(row.paidAt) : "미결제"}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
