import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { NEWYEAR_LEGAL_LINKS, NEWYEAR_LEGAL_META } from "@/lib/constants/legal";
import { formatPrice } from "@/lib/constants/service";

export const metadata: Metadata = {
  title: "2027 이용약관",
  robots: { index: false, follow: false },
};

export default function NewYearTermsPage() {
  return (
    <LegalDoc title="이용약관" brand="newyear" links={NEWYEAR_LEGAL_LINKS}>
      <p>
        본 약관은 {NEWYEAR_LEGAL_META.serviceName}(이하 “서비스”)의 이용 조건과 절차, 회사와 이용자의 권리·의무를
        정합니다.
      </p>

      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 서비스가 온라인으로 제공하는 무료 사주 결과, 유료 신년 리포트 및 이에 부수하는 기능의 이용과
          관련하여 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (정의)">
        <p>1. “이용자”란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
        <p>2. “무료 결과”란 이용자가 입력한 생년월일 등을 바탕으로 만세력 계산 후 보여주는 미리보기 화면을 말합니다.</p>
        <p>
          3. “유료 리포트”란 {NEWYEAR_LEGAL_META.orderName} 결제를 마친 이용자에게 제공되는 디지털 콘텐츠를 말합니다.
        </p>
        <p>4. “회사”란 서비스를 운영·제공하는 사업자를 말합니다.</p>
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력과 변경)">
        <p>1. 본 약관은 서비스 화면에 게시하거나 링크로 공지함으로써 효력이 발생합니다.</p>
        <p>
          2. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일과 사유를 미리
          공지합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (서비스의 내용)">
        <p>1. 서비스는 전통 명리학·만세력과 자동화된 해석을 결합한 참고용 콘텐츠를 제공합니다.</p>
        <p>
          2. 해석은 의료·법률·투자·심리상담을 대신하지 않습니다. 이용자의 결정에 대한 책임은 이용자에게 있습니다.
        </p>
        <p>3. 회사는 서비스 품질을 위해 기능·화면·문구를 바꿀 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제5조 (이용 자격)">
        <p>1. 유료 결제는 만 19세 이상만 할 수 있습니다.</p>
        <p>2. 이용자는 타인의 정보를 무단으로 입력하거나 결제해서는 안 됩니다.</p>
      </LegalSection>

      <LegalSection title="제6조 (유료 서비스와 결제)">
        <p>
          1. 유료 리포트의 가격은 결제 화면에 표시된 금액(현재 {formatPrice(NEWYEAR_LEGAL_META.price)})을 따릅니다.
        </p>
        <p>2. 결제는 회사가 지정한 전자지급결제대행 사업자(페이앱)를 통해 이루어집니다.</p>
        <p>3. 결제 후 회사는 이용자가 남긴 이메일로 리포트 열람 방법을 안내할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제7조 (지식재산권)">
        <p>
          서비스의 문구, 화면, 리포트 구성에 대한 권리는 회사 또는 정당한 권리자에게 있습니다. 무단 복제·배포·재가공을
          금합니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (이용자의 의무)">
        <p>1. 허위 정보 입력, 결제 부정 이용, 서비스 장애를 일으키는 행위를 해서는 안 됩니다.</p>
        <p>2. 리포트를 상업적으로 재판매하거나 허락 없이 제3자에게 제공해서는 안 됩니다.</p>
      </LegalSection>

      <LegalSection title="제9조 (서비스의 중단)">
        <p>
          회사는 점검, 통신 장애, 천재지변, 제휴사 장애 등 상당한 이유가 있으면 서비스를 잠시 멈출 수 있습니다. 가능한
          범위에서 사전 또는 사후에 안내합니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (책임의 한계)">
        <p>1. 서비스는 참고용 콘텐츠입니다. 이를 근거로 한 행동의 결과에 대해 회사의 책임은 법령이 정한 범위로 제한됩니다.</p>
        <p>2. 이용자 귀책으로 생긴 손해는 회사가 책임지지 않습니다.</p>
      </LegalSection>

      <LegalSection title="제11조 (준거법과 분쟁)">
        <p>본 약관은 대한민국 법령을 따르며, 분쟁은 민사소송법 등 관련 법령의 관할 법원에 제기합니다.</p>
      </LegalSection>

      <p>시행일: {NEWYEAR_LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
