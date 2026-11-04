"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/LogoMark";
import { trackFunnel } from "@/lib/client/funnel";
import { trackKarrotPurchase } from "@/lib/client/karrotPixel";

const POLL_MS = 2000;
const GIVE_UP_MS = 3 * 60 * 1000;

/** 페이앱 returnurl 착지. 웹훅으로 결제가 반영될 때까지 기다린다. */
export function PaymentReturn({ token, orderId }: { token: string; orderId: string }) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    let active = true;
    const startedAt = Date.now();
    const poll = async () => {
      while (active) {
        if (Date.now() - startedAt > GIVE_UP_MS) {
          setTimedOut(true);
          return;
        }
        try {
          const response = await fetch(`/api/analysis/${token}`, { cache: "no-store" });
          const data = (await response.json().catch(() => ({}))) as { paid?: boolean };
          if (data.paid) {
            if (!tracked.current) {
              tracked.current = true;
              trackFunnel("paid", token);
              trackKarrotPurchase();
            }
            router.replace(`/report/${token}`);
            return;
          }
        } catch {
          // 다음 폴링에서 다시 시도
        }
        await new Promise((resolve) => window.setTimeout(resolve, POLL_MS));
      }
    };
    void poll();
    return () => {
      active = false;
    };
  }, [token, orderId, router]);

  if (timedOut) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-2xl font-light">결제 확인이 지연되고 있습니다</h1>
          <p className="text-sm leading-relaxed text-mist">
            결제가 끝났다면 잠시 후 리포트 페이지에서 확인할 수 있어요.
            <br />
            이메일도 함께 확인해 주세요.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <ButtonLink href={`/report/${token}`}>리포트 확인하기</ButtonLink>
          <ButtonLink href={`/result/${token}`} variant="ghost">
            결과로 돌아가기
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
      <LogoMark size={64} className="animate-breathe" />
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl font-light">결제를 확인하고 있습니다</h1>
        <p className="text-sm leading-relaxed text-mist">
          확인이 끝나면 당신의 도화력이 보여집니다.
          <br />
          이 화면을 닫지 말고 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
