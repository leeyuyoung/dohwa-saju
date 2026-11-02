import { DETAILED_REPORT_LIST_PRICE, DETAILED_REPORT_ORDER_NAME, DETAILED_REPORT_PRICE, SERVICE } from "@/lib/constants/service";

/**
 * 전자상거래 고지용 사업자 정보.
 * 아래 값은 운영자가 실제 사업자 등록 내용으로 바꿔야 한다. 허위 기재 금지.
 */
export const BUSINESS = {
  /** 상호 */
  companyName: "엘더블와이컴퍼니",
  /** 대표자 */
  representative: "양흥미",
  /** 사업자등록번호 */
  businessNumber: "107-43-21676",
  /** 통신판매업 신고번호 (해당 시) */
  mailOrderNumber: "[제OOOO-OO-OOOO호]",
  /** 사업장 주소 */
  address: "경기도 하남시 위례중앙로 185, 6309-1304",
  /** 고객 문의 이메일 */
  contactEmail: "yylee00@naver.com",
  /** 호스팅 서비스 제공자 */
  hostingProvider: "Vercel Inc.",
} as const;

export const LEGAL_LINKS = [
  { href: "/legal/business", label: "사업자 정보" },
  { href: "/legal/terms", label: "이용약관" },
  { href: "/legal/privacy", label: "개인정보처리방침" },
  { href: "/legal/refund", label: "환불정책" },
] as const;

export const LEGAL_META = {
  serviceName: SERVICE.name,
  orderName: DETAILED_REPORT_ORDER_NAME,
  price: DETAILED_REPORT_PRICE,
  listPrice: DETAILED_REPORT_LIST_PRICE,
  effectiveDate: "2026년 11월 3일",
} as const;
