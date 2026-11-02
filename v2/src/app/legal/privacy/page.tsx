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
        <p>
          <span className="text-paper">분석 신청 시</span> — 이름, 성별, 생년월일, 태어난 시각(또는 모름),
          양력/음력·윤달 여부, 지금의 관계 상태
        </p>
        <p>
          <span className="text-paper">결제와 발송 시</span> — 이메일(리포트 안내용), 휴대폰 번호(결제
          요청·안내용). 결제대행사를 통해 확인되는 주문 정보가 포함될 수 있습니다.
        </p>
        <p>
          <span className="text-paper">자동 수집</span> — 서비스 이용 기록(어느 화면·단계까지 갔는지), 익명
          분석용 세션 식별값. 접속 기기·브라우저 정보는 서버·호스팅 환경에서 기술적으로 남을 수 있습니다.
        </p>
        <p>
          회사는 이용자 본인의 정보만 받습니다. 배우자나 연인, 앞으로 만날 상대의 이름이나 생년월일, 연락처는
          받지 않습니다.
        </p>
        <p>
          이용 기록(퍼널)에는 이용자가 적은 이름과 생년월일, 태어난 시각이 들어가지 않습니다. 어느 단계까지
          갔는지와 그 단계의 종류만 남고, 적은 값 자체는 수집하지 않습니다.
        </p>
        <p>
          회사는 결제 정보(카드번호 등)를 직접 저장하지 않으며, 결제는 결제대행 서비스가 처리합니다. 결제
          과정에서 회사가 받은 이메일은 리포트 발송·재열람 지원을 위해 데이터베이스에 저장됩니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 개인정보의 이용 목적">
        <p>1) 만세력 계산과 무료 결과·유료 리포트 생성·열람 제공</p>
        <p>2) 결제 확인과 리포트 발송, 재열람 지원</p>
        <p>3) 문의 응대와 분쟁 처리</p>
        <p>4) 서비스 운영과 개선(단계별 이탈 파악 등). 이때 입력값은 이용 기록에 넣지 않습니다.</p>
      </LegalSection>

      <LegalSection title="3. 보유와 이용 기간">
        <p>
          회사는 목적을 이룬 뒤 개인정보를 지체 없이 파기합니다. 다만 관련 법에 따라 보관이 필요한 경우 그
          기간 동안 보관합니다.
        </p>
        <p>계약과 청약철회 기록: 5년 (전자상거래법)</p>
        <p>대금 결제와 재화 공급 기록: 5년 (전자상거래법)</p>
        <p>소비자 불만과 분쟁 처리 기록: 3년 (전자상거래법)</p>
        <p>
          결제가 되지 않은 분석 신청 정보는 서비스 제공에 더 이상 필요하지 않으면 단기간(원칙적으로 7일
          이내) 후 삭제합니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 제3자 제공 및 처리 위탁">
        <p>
          회사는 이용자 동의 없이 개인정보를 외부에 제공하지 않습니다. 다만 서비스 운영을 위해 다음과 같이
          처리업무를 위탁할 수 있습니다.
        </p>
        <p>1) 결제 처리: 전자지급결제대행 사업자(페이앱)</p>
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

      <LegalSection title="7. 개인정보 보호 문의">
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
