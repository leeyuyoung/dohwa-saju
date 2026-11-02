import type { Metadata } from "next";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { BUSINESS, LEGAL_META } from "@/lib/constants/legal";
import { formatPrice } from "@/lib/constants/service";

export const metadata: Metadata = {
  title: "환불정책",
};

export default function RefundPage() {
  return (
    <LegalDoc title="환불정책">
      <p>
        본 환불정책은 {LEGAL_META.serviceName}의 유료 디지털 콘텐츠({LEGAL_META.orderName},{" "}
        {formatPrice(LEGAL_META.price)})에 적용됩니다. 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련
        고시를 따릅니다.
      </p>

      <LegalSection title="1. 상품의 성격">
        <p>
          유료 리포트는 결제 확인 후 이용자 맞춤으로 생성·제공되는 <strong className="font-medium text-paper">디지털
          콘텐츠</strong>입니다. 유형물 배송이 없는 온라인 콘텐츠에 해당합니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 청약철회가 제한되는 경우">
        <p>다음의 경우 청약철회(환불)가 제한될 수 있습니다.</p>
        <p>1) 결제가 확인되어 이용자 맞춤 리포트 작성이 시작된 이후</p>
        <p>2) 리포트 열람·다운로드·이메일 발송 등으로 콘텐츠 제공이 개시된 이후</p>
        <p>
          3) 이용자가 결제 화면에서 디지털 콘텐츠 제공이 개시되면 청약철회가 제한될 수 있음을 고지받고 결제를
          진행한 경우
        </p>
      </LegalSection>

      <LegalSection title="3. 환불이 가능한 경우">
        <p>회사는 다음의 경우 환불을 검토·진행합니다.</p>
        <p>1) 결제 승인 오류, 중복 결제 등 회사 또는 결제대행사 측 명백한 오류</p>
        <p>2) 결제 완료 후에도 상당한 시간 동안 리포트 생성이 시작되지 않거나 제공이 불가능한 경우</p>
        <p>3) 관련 법령상 청약철회가 허용되고, 위 제2조의 제한 사유에 해당하지 않는 경우</p>
      </LegalSection>

      <LegalSection title="4. 환불 신청 방법">
        <p>
          환불·오류 문의는 {BUSINESS.contactEmail} 로 주문 시각, 결제 수단, 이용자 이메일, 증상 설명을 함께
          보내 주세요. 회사는 접수 후 신속히 확인합니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 환불 처리">
        <p>
          1) 환불이 결정되면 결제대행 사업자의 절차에 따라 취소·환불되며, 카드사·은행 사정에 따라 반영까지
          수일이 소요될 수 있습니다.
        </p>
        <p>2) 부정 결제, 타인 정보 도용 등이 확인되면 환불이 거절되거나 관련 조치가 이루어질 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="6. 무료 결과에 대한 안내">
        <p>무료 결과 화면은 유료 상품이 아니며, 별도의 대금 환불 대상이 아닙니다.</p>
      </LegalSection>

      <p>시행일: {LEGAL_META.effectiveDate}</p>
    </LegalDoc>
  );
}
