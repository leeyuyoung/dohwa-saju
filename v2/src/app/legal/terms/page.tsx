import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { LEGAL_META } from "@/lib/constants/legal";
import { formatPrice } from "@/lib/constants/service";

export const metadata: Metadata = {
  title: "이용약관",
};

export default function TermsPage() {
  return (
    <LegalDoc title="이용약관">
      <p>
        본 약관은 {LEGAL_META.serviceName}(이하 “서비스”)가 제공하는 사주·매력 분석 및 디지털 리포트 관련 서비스의
        이용 조건과 절차, 회사와 이용자의 권리·의무를 정합니다.
      </p>

      <LegalSection title="제1조 (목적)">
        <p>
          이 약관은 서비스가 온라인으로 제공하는 무료 분석 결과, 유료 상세 리포트 및 이에 부수하는 기능의 이용과
          관련하여 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (정의)">
        <p>1. “이용자”란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
        <p>
          2. “무료 결과”란 이용자가 입력한 생년월일 등 정보를 바탕으로 만세력 계산을 거쳐 제공되는 미리보기성
          분석 화면을 말합니다.
        </p>
        <p>
          3. “유료 리포트”란 {LEGAL_META.orderName} 등 결제를 완료한 이용자에게 제공되는 디지털 콘텐츠를
          말합니다.
        </p>
        <p>4. “회사”란 서비스를 운영·제공하는 사업자를 말합니다.</p>
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력과 변경)">
        <p>1. 본 약관은 서비스 화면 게시 또는 링크로 공지함으로써 효력이 발생합니다.</p>
        <p>
          2. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일 및 개정 사유를
          명시하여 사전에 공지합니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (서비스의 내용)">
        <p>1. 서비스는 전통 명리학·만세력 체계와 자동화된 해석을 결합한 참고용 콘텐츠를 제공합니다.</p>
        <p>
          2. 서비스의 해석은 의료·법률·투자·심리상담 등 전문 영역을 대체하지 않으며, 이용자의 의사결정에 대한
          최종 책임은 이용자에게 있습니다.
        </p>
        <p>3. 회사는 서비스 품질 개선을 위해 기능·화면·문구를 변경할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제5조 (이용 자격)">
        <p>1. 유료 결제는 만 19세 이상만 할 수 있습니다.</p>
        <p>2. 이용자는 타인의 정보를 무단으로 입력·결제해서는 안 됩니다.</p>
      </LegalSection>

      <LegalSection title="제6조 (유료 서비스와 결제)">
        <p>
          1. 유료 리포트의 판매 가격은 결제 화면에 표시된 금액(현재 기준 {formatPrice(LEGAL_META.price)})을
          따릅니다. 할인 표시가 있는 경우 해당 결제 시점의 조건이 적용됩니다.
        </p>
        <p>2. 결제는 회사가 지정한 전자지급결제대행 사업자(예: 토스페이먼츠)를 통해 이루어집니다.</p>
        <p>3. 결제 완료 후 회사는 이용자가 제공한 이메일 등으로 리포트 열람 방법을 안내할 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="제7조 (지식재산권)">
        <p>
          서비스에 포함된 문구, 이미지, 디자인, 리포트 구성 등 일체의 콘텐츠에 대한 권리는 회사 또는 정당한
          권리자에게 있으며, 무단 복제·배포·재가공을 금합니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (이용자의 의무)">
        <p>1. 허위 정보 입력, 결제 시스템 부정 이용, 서비스 장애를 유발하는 행위를 해서는 안 됩니다.</p>
        <p>2. 리포트를 상업적으로 재판매하거나 제3자에게 무단 제공하는 행위를 해서는 안 됩니다.</p>
      </LegalSection>

      <LegalSection title="제9조 (서비스의 중단)">
        <p>
          회사는 시스템 점검, 통신 장애, 천재지변, 제휴사 장애 등 상당한 이유가 있는 경우 서비스 제공을
          일시 중단할 수 있으며, 가능한 범위에서 사전 또는 사후 안내합니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (책임의 한계)">
        <p>
          1. 서비스는 참고용 콘텐츠이므로, 이를 근거로 한 행동의 결과에 대해 회사는 법령이 허용하는 범위 내에서
          책임을 제한합니다.
        </p>
        <p>2. 이용자 귀책 사유로 발생한 손해에 대해서는 회사가 책임지지 않습니다.</p>
      </LegalSection>

      <LegalSection title="제11조 (준거법과 분쟁)">
        <p>본 약관은 대한민국 법령에 따르며, 분쟁 발생 시 민사소송법 등 관련 법령에 따른 관할 법원에 제기합니다.</p>
      </LegalSection>

      <p>시행일: {LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
