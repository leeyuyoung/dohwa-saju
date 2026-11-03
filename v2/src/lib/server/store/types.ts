import type { FunnelEvent, FunnelStep, FunnelStepCount } from "@/lib/server/funnel";
import type { AiReport } from "@/lib/server/ai/reportSchema";
import type { SajuProfile } from "@/lib/saju";
import type { RelationshipStatus } from "@/lib/validation/analysisInput";

/** 유료 리포트 생성 상태. 무료 결과는 만세력 계산만으로 만들어 처음부터 ready다. */
export type AnalysisStatus = "generating" | "ready" | "failed";

/** 분석 1건. 리포트는 결제가 확인된 뒤에만 생성한다. */
export type AnalysisRecord = {
  token: string;
  status: AnalysisStatus;
  createdAt: number;
  updatedAt: number;
  name: string;
  /** 리포트 링크 발송용. 결제 직전에 받으며, 화면이나 AI 요청에는 쓰지 않는다. */
  email: string | null;
  /** 결제 직전 휴대폰. 결제 요청·안내용. 마케팅 동의 시 수신 채널로도 쓴다. */
  phone: string | null;
  /** 마케팅 수신 동의(선택). null은 결제 전·미응답. */
  marketingOptIn: boolean | null;
  relationshipStatus: RelationshipStatus;
  concern: string | null;
  profile: SajuProfile;
  report: AiReport | null;
  paidAt: number | null;
};

export type OrderStatus = "pending" | "paid" | "canceled";

/** 결제 시도 1건. 금액은 서버가 정하고, 토스 승인 결과로만 paid가 된다. 환불되면 canceled. */
export type OrderRecord = {
  orderId: string;
  token: string;
  amount: number;
  status: OrderStatus;
  paymentKey: string | null;
  method: string | null;
  createdAt: number;
  updatedAt: number;
  approvedAt: number | null;
};

export type OrderPatch = Partial<Pick<OrderRecord, "status" | "paymentKey" | "method" | "approvedAt">>;

export type { FunnelEvent, FunnelStep, FunnelStepCount };

export interface AnalysisStore {
  create(record: AnalysisRecord): Promise<void>;
  get(token: string): Promise<AnalysisRecord | null>;
  update(token: string, patch: Partial<Omit<AnalysisRecord, "token" | "createdAt">>): Promise<void>;
  /**
   * 결제됐고 리포트가 없는 기록을 'generating'으로 바꾼다. 다른 요청이 이미 생성 중이면 false.
   * staleBefore 이전부터 generating인 기록은 생성이 중단된 것으로 보고 다시 가져온다.
   */
  claimReportGeneration(token: string, staleBefore: number): Promise<boolean>;
  createOrder(order: OrderRecord): Promise<void>;
  getOrder(orderId: string): Promise<OrderRecord | null>;
  updateOrder(orderId: string, patch: OrderPatch): Promise<void>;
  /** createdBefore 이전에 만들어지고 끝내 결제되지 않은 주문을 지운다. */
  deleteStalePendingOrders(createdBefore: number): Promise<void>;
  /**
   * createdBefore 이전에 만들어지고 결제되지 않은 분석을 지운다.
   * 개인정보 보관 최소화를 위해 미결제 건만 지운다.
   */
  deleteUnpaidAnalysesBefore(createdBefore: number): Promise<void>;
  /** 최신 제출 건. 관리자 목록용. */
  listAnalyses(limit: number): Promise<AnalysisRecord[]>;
  /**
   * 퍼널 이벤트. 같은 sessionId+step은 한 번만 센다.
   * PII를 넣지 않는다. token은 제출 이후 단계에만 붙일 수 있다.
   */
  trackFunnelEvent(event: FunnelEvent): Promise<void>;
  /** 단계별 고유 세션 수와 이탈률. */
  funnelSummary(): Promise<FunnelStepCount[]>;
}
