import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { BUSINESS, LEGAL_META } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "사업자 정보",
  robots: { index: true, follow: true },
};

export default function BusinessInfoPage() {
  return (
    <LegalDoc title="사업자 정보">
      <p>「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 {LEGAL_META.serviceName} 서비스의 사업자 정보를 고지합니다.</p>
      <LegalSection title="기본 정보">
        <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2">
          <dt className="text-mist-dim">상호</dt>
          <dd className="text-paper">{BUSINESS.companyName}</dd>
          <dt className="text-mist-dim">대표자</dt>
          <dd className="text-paper">{BUSINESS.representative}</dd>
          <dt className="text-mist-dim">사업자등록번호</dt>
          <dd className="text-paper">{BUSINESS.businessNumber}</dd>
          <dt className="text-mist-dim">사업장 주소</dt>
          <dd className="text-paper break-keep">{BUSINESS.address}</dd>
          <dt className="text-mist-dim">이메일</dt>
          <dd className="text-paper">{BUSINESS.contactEmail}</dd>
          <dt className="text-mist-dim">호스팅</dt>
          <dd className="text-paper">{BUSINESS.hostingProvider}</dd>
        </dl>
      </LegalSection>
      <LegalSection title="안내">
        <p>시행일: {LEGAL_META.effectiveDate}</p>
      </LegalSection>
    </LegalDoc>
  );
}
