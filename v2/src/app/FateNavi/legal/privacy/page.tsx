import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { BUSINESS, NEWYEAR_LEGAL_LINKS, NEWYEAR_LEGAL_META } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  robots: { index: false, follow: false },
};

export default function NewYearPrivacyPage() {
  return (
    <LegalDoc title="개인정보처리방침" brand="newyear" theme="premium" links={NEWYEAR_LEGAL_LINKS}>
      <p>
        {NEWYEAR_LEGAL_META.serviceName}(이하 “회사”)는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 관련
        고충을 처리하기 위해 다음과 같이 개인정보처리방침을 공개합니다.
      </p>

      <LegalSection title="1. 수집하는 개인정보 항목">
        <p>
          <span className="text-paper">사주 신청 시</span> — 이름, 생년월일, 양력·음력과 윤달 여부, 태어난 시각(또는
          모름)
        </p>
        <p>
          <span className="text-paper">결제와 발송 시</span> — 이메일(리포트 안내용), 휴대폰 번호(결제 요청·안내용),
          마케팅 수신 동의 여부(선택). 결제대행사를 통해 확인되는 주문 정보가 포함될 수 있습니다.
        </p>
        <p>
          <span className="text-paper">자동 수집</span> — 접속 과정에서 서버·호스팅 환경에 남을 수 있는 기기·브라우저
          정보
        </p>
        <p>회사는 결제 카드번호 등을 직접 저장하지 않습니다. 결제는 결제대행 서비스가 처리합니다.</p>
      </LegalSection>

      <LegalSection title="2. 개인정보의 이용 목적">
        <p>1) 만세력 계산과 무료 결과·유료 리포트 작성, 열람 제공</p>
        <p>2) 결제 확인, 리포트 발송, 다시 열람할 수 있게 하는 지원</p>
        <p>3) 문의 응대와 분쟁 처리</p>
        <p>4) 이용자가 동의한 경우, 이메일·휴대폰으로 혜택·이벤트·새 서비스 안내</p>
      </LegalSection>

      <LegalSection title="3. 보유와 이용 기간">
        <p>회사는 목적을 달성한 뒤 개인정보를 지체 없이 파기합니다. 법령이 보관을 요구하면 그 기간만 보관합니다.</p>
        <p>계약과 청약철회 기록: 5년 (전자상거래법)</p>
        <p>대금 결제와 재화 공급 기록: 5년 (전자상거래법)</p>
        <p>소비자 불만과 분쟁 처리 기록: 3년 (전자상거래법)</p>
        <p>결제되지 않은 신청 정보는 더 이상 필요가 없으면 원칙적으로 7일 안에 삭제합니다.</p>
        <p>
          마케팅 수신은 동의 철회 시까지입니다. 철회·삭제 요청은 {BUSINESS.contactEmail} 로 보내 주시면 지체 없이
          처리합니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 제3자 제공 및 처리 위탁">
        <p>회사는 동의 없이 개인정보를 외부에 팔거나 넘기지 않습니다. 서비스 운영을 위해 다음 업무를 맡길 수 있습니다.</p>
        <p>1) 결제 처리: 전자지급결제대행 사업자(페이앱)</p>
        <p>2) 이메일 발송: 이메일 발송 대행 서비스</p>
        <p>3) 인프라·데이터베이스: 클라우드 호스팅·DB 제공 사업자</p>
        <p>4) 리포트 문장을 작성하는 데 필요한 범위의 AI 처리 사업자</p>
      </LegalSection>

      <LegalSection title="5. 이용자의 권리">
        <p>
          이용자는 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청은 {BUSINESS.contactEmail} 로
          연락해 주시기 바랍니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 개인정보의 파기">
        <p>전자 파일은 복구할 수 없는 방법으로 지우고, 종이 문서는 분쇄하거나 소각합니다. 법령상 보관분은 따로 둡니다.</p>
      </LegalSection>

      <LegalSection title="7. 개인정보 보호 문의">
        <p>개인정보 관련 문의: {BUSINESS.contactEmail}</p>
      </LegalSection>

      <LegalSection title="8. 고지의 의무">
        <p>이 방침을 바꾸면 시행 전에 서비스 화면이나 링크로 알립니다. 중요한 변경은 가능한 범위에서 개별 안내합니다.</p>
      </LegalSection>

      <p>시행일: {NEWYEAR_LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
