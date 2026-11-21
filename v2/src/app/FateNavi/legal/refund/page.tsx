import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { BUSINESS, NEWYEAR_LEGAL_LINKS, NEWYEAR_LEGAL_META } from "@/lib/constants/legal";
import { formatPrice } from "@/lib/constants/service";

export const metadata: Metadata = {
  title: "2027 환불정책",
  robots: { index: false, follow: false },
};

export default function NewYearRefundPage() {
  return (
    <LegalDoc title="환불정책" brand="newyear" links={NEWYEAR_LEGAL_LINKS}>
      <p>
        본 환불정책은 {NEWYEAR_LEGAL_META.serviceName}({formatPrice(NEWYEAR_LEGAL_META.price)})에 적용됩니다.
        「전자상거래 등에서의 소비자보호에 관한 법률」과 관련 고시를 따릅니다.
      </p>

      <LegalSection title="1. 상품의 성격">
        <p>
          유료 리포트는 결제 확인 후 이용자 사주에 맞춰 만들어 제공하는 <strong className="font-medium text-paper">디지털
          콘텐츠</strong>입니다. 물건 배송은 없습니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 청약철회가 제한되는 경우">
        <p>다음의 경우 청약철회(환불)가 제한될 수 있습니다.</p>
        <p>1) 결제가 확인되어 맞춤 리포트 작성이 시작된 이후</p>
        <p>2) 리포트를 열람하거나 이메일로 보낸 뒤</p>
        <p>3) 결제 화면에서 작성이 시작되면 청약철회가 제한될 수 있음을 고지받고 결제한 경우</p>
      </LegalSection>

      <LegalSection title="3. 환불이 가능한 경우">
        <p>회사는 다음의 경우 환불을 검토합니다.</p>
        <p>1) 결제 승인 오류, 중복 결제 등 회사 또는 결제대행사의 명백한 오류</p>
        <p>2) 결제 후에도 상당 시간 리포트 작성이 시작되지 않거나 제공할 수 없는 경우</p>
        <p>3) 법령상 청약철회가 허용되고, 위 제2조의 제한 사유에 해당하지 않는 경우</p>
      </LegalSection>

      <LegalSection title="4. 환불 신청 방법">
        <p>
          환불과 오류 문의는 {BUSINESS.contactEmail} 로 주문 시각, 결제 수단, 이용자 이메일, 증상을 적어 보내 주세요.
          회사는 접수한 뒤 확인합니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 환불 처리">
        <p>환불이 결정되면 결제대행사의 절차로 취소됩니다. 카드사·은행 사정에 따라 반영까지 며칠이 걸릴 수 있습니다.</p>
        <p>부정 결제나 타인 정보 도용이 확인되면 환불이 거절되거나 필요한 조치가 이루어질 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="6. 무료 결과에 대한 안내">
        <p>무료 결과 화면은 유료 상품이 아니며, 대금 환불 대상이 아닙니다.</p>
      </LegalSection>

      <p>시행일: {NEWYEAR_LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
