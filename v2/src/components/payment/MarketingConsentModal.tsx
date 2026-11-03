"use client";

type MarketingConsentModalProps = {
  open: boolean;
  onClose: () => void;
};

/** 마케팅 수신 동의 안내. 결제 하단 ‘자세히보기’에서 연다. */
export function MarketingConsentModal({ open, onClose }: MarketingConsentModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="marketing-consent-title"
        className="relative z-10 w-full max-w-[22rem] rounded-[1.15rem] bg-white px-5 pb-5 pt-6 shadow-[0_18px_48px_rgb(0_0_0_/_0.35)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center text-[#111]/70 transition-opacity hover:opacity-100"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 id="marketing-consent-title" className="pr-8 font-sans text-[17px] font-bold leading-snug tracking-[-0.02em] text-[#111]">
          마케팅 메시지 수신 동의
        </h2>
        <p className="mt-3 font-sans text-[13.5px] leading-[1.55] tracking-[-0.01em] text-[#222]">
          본인은 회사가 제공하는 각종 혜택, 이벤트 참여, 신규 서비스 관련 정보 제공 등을 위해 회사에 제공한
          이메일 및 휴대폰번호로 마케팅 메시지를 수신하는 것에 동의합니다.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#111] font-sans text-[15px] font-semibold tracking-[-0.02em] text-white transition-opacity hover:opacity-90"
        >
          확인
        </button>
      </div>
    </div>
  );
}
