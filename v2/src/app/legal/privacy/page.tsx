import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { BUSINESS, LEGAL_META } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="개인정보처리방침">
      <p>
        {LEGAL_META.serviceName}(이하 “회사”)는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를
        보호하고, 이와 관련한 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </p>

      <LegalSection title="1. 수집하는 개인정보 항목">
        <p>회사는 서비스 제공을 위해 다음 정보를 수집할 수 있습니다.</p>
        <p>
          1) 필수: 이름(호칭), 생년월일, 출생시간(또는 모름), 양력/음력 여부, 윤달 여부, 연애 상태, 결제 시
          이메일
        </p>
        <p>2) 결제 과정에서 결제대행사가 처리하는 결제 정보(카드번호 등은 회사가 직접 저장하지 않음)</p>
        <p>3) 자동 수집: 서비스 이용 기록, 접속 로그, 쿠키, 익명 분석용 세션 식별값, 기기·브라우저 정보</p>
      </LegalSection>

      <LegalSection title="2. 수집·이용 목적">
        <p>1) 사주 만세력 계산 및 무료 결과·유료 리포트 제공</p>
        <p>2) 결제 확인, 주문 관리, 리포트 열람 링크·안내 발송</p>
        <p>3) 고객 문의 대응, 부정 이용 방지, 서비스 품질 개선</p>
        <p>4) 법령상 의무 이행</p>
      </LegalSection>

      <LegalSection title="3. 보유·이용 기간">
        <p>
          1) 원칙적으로 목적 달성 후 지체 없이 파기합니다. 다만 전자상거래 등 관련 법령에 따라 거래 기록은
          일정 기간 보관할 수 있습니다.
        </p>
        <p>2) 계약·청약철회 기록: 5년 / 대금결제·재화공급 기록: 5년 / 소비자 불만·분쟁 처리: 3년</p>
        <p>3) 서비스 운영상 필요한 분석 데이터는 보관 기간을 최소화하며, 가능하면 식별성을 낮춰 처리합니다.</p>
      </LegalSection>

      <LegalSection title="4. 제3자 제공 및 처리 위탁">
        <p>
          회사는 이용자 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 서비스 운영을 위해 다음과 같이
          처리업무를 위탁할 수 있습니다.
        </p>
        <p>1) 결제 처리: 토스페이먼츠 등 전자지급결제대행 사업자</p>
        <p>2) 이메일 발송: 이메일 발송 대행 서비스(예: Resend)</p>
        <p>3) 인프라·데이터베이스: 클라우드 호스팅·DB 제공 사업자(예: Vercel, Supabase)</p>
        <p>4) 리포트 생성에 필요한 범위의 AI 처리 사업자</p>
      </LegalSection>

      <LegalSection title="5. 이용자의 권리">
        <p>
          이용자는 자신의 개인정보 열람·정정·삭제·처리정지 등을 요청할 수 있습니다. 요청은{" "}
          {BUSINESS.contactEmail} 로 연락해 주시기 바랍니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 개인정보의 파기">
        <p>
          전자적 파일은 복구 불가능한 방법으로 삭제하고, 출력물은 분쇄 또는 소각합니다. 법령상 보관이 필요한
          경우 해당 기간 동안 별도 분리 보관합니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 개인정보 보호책임">
        <p>개인정보 관련 문의: {BUSINESS.contactEmail}</p>
      </LegalSection>

      <LegalSection title="8. 고지의 의무">
        <p>
          본 방침 내용 추가·삭제·수정이 있으면 시행일 이전에 서비스 내 공지 또는 링크로 알립니다. 중요한
          변경은 가능한 한 개별 안내합니다.
        </p>
      </LegalSection>

      <p>시행일: {LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
