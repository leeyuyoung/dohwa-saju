import "server-only";

import { MemoryAnalysisStore } from "./memoryStore";
import { SupabaseAnalysisStore } from "./supabaseStore";
import type { AnalysisStore } from "./types";

export type {
  AnalysisRecord,
  AnalysisStatus,
  AnalysisStore,
  Attribution,
  FunnelEvent,
  FunnelStep,
  OrderRecord,
  StoredAiReport,
} from "./types";

// 개발 서버의 코드 변경(HMR) 때 모듈이 다시 불려도 같은 저장소를 쓰도록 전역에 둔다.
const globalForStore = globalThis as typeof globalThis & { __dohwaAnalysisStore?: AnalysisStore };

function createStore(): AnalysisStore {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (url && secretKey) return new SupabaseAnalysisStore(url.replace(/\/+$/, ""), secretKey);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_URL과 SUPABASE_SECRET_KEY가 설정되지 않았습니다. 배포 환경에서는 메모리 저장소를 쓸 수 없습니다.");
  }
  return new MemoryAnalysisStore();
}

export function getAnalysisStore(): AnalysisStore {
  const existing = globalForStore.__dohwaAnalysisStore;
  // HMR로 클래스가 바뀌면 예전 인스턴스에 새 메서드가 없어 깨지므로 다시 만든다.
  if (existing && typeof existing.listAnalyses === "function" && typeof existing.deleteUnpaidAnalysesBefore === "function") {
    return existing;
  }
  const created = createStore();
  globalForStore.__dohwaAnalysisStore = created;
  return created;
}
