import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dohwa_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const LOGIN_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000 };

export { COOKIE_NAME as ADMIN_COOKIE_NAME, LOGIN_LIMIT as ADMIN_LOGIN_LIMIT };

function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

function sessionSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const password = adminPassword();
  return password ? `dohwa-admin:${password}` : null;
}

/** 관리자 비밀번호가 설정돼 있는지. 없으면 관리자 화면·API를 열지 않는다. */
export function isAdminConfigured(): boolean {
  return adminPassword() !== null && sessionSecret() !== null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

function sign(payload: string): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("admin session secret missing");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** 로그인 성공 시 심을 서명 쿠키 값. */
export function createAdminSessionToken(now = Date.now()): string {
  const exp = String(now + SESSION_TTL_MS);
  const payload = `v1.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readAdminSessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token || !sessionSecret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, exp, signature] = parts;
  if (version !== "v1" || !/^\d+$/.test(exp)) return false;
  const payload = `${version}.${exp}`;
  if (!safeEqual(signature, sign(payload))) return false;
  if (Number(exp) < now) return false;
  return true;
}

export function adminCookieOptions(maxAgeSec = Math.floor(SESSION_TTL_MS / 1000)) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

/** Route Handler / Server Component에서 현재 요청이 관리자 세션인지 확인한다. */
export async function requireAdminSession(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const jar = await cookies();
  return readAdminSessionToken(jar.get(COOKIE_NAME)?.value);
}
