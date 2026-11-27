"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDuoCompanion } from "@/components/newyear/DuoCompanionFields";
import { CheckoutWidget } from "@/components/payment/CheckoutWidget";
import {
  NEWYEAR_LIST_PRICE,
  NEWYEAR_LIST_PRICE_DUO,
  NEWYEAR_REPORT_PRICE,
  NEWYEAR_REPORT_PRICE_DUO,
  type NewyearCheckoutPack,
} from "@/lib/constants/newyear";
import { formatPrice } from "@/lib/constants/service";

const PACKS: {
  id: NewyearCheckoutPack;
  title: string;
  subtitle?: string;
  recommend?: boolean;
  listPrice: number;
  price: number;
}[] = [
  {
    id: "solo",
    title: "프리미엄 종합사주",
    subtitle: "태어나서부터 100세까지",
    listPrice: NEWYEAR_LIST_PRICE,
    price: NEWYEAR_REPORT_PRICE,
  },
  {
    id: "duo",
    title: "프리미엄 종합사주 2인",
    subtitle: "리포트 1+1",
    recommend: true,
    listPrice: NEWYEAR_LIST_PRICE_DUO,
    price: NEWYEAR_REPORT_PRICE_DUO,
  },
];

function discountPercent(list: number, sale: number) {
  return Math.round((1 - sale / list) * 100);
}

export function PremiumCheckout({ token, backHref }: { token: string; backHref: string }) {
  const [pack, setPack] = useState<NewyearCheckoutPack>("solo");
  const selected = useMemo(() => PACKS.find((item) => item.id === pack) ?? PACKS[0], [pack]);
  const companion = useDuoCompanion();

  return (
    <div className="ny-premium-checkout">
      <section className="ny-premium-checkout-top">
        <header className="ny-premium-checkout-bar">
          <Link href={backHref} className="ny-premium-checkout-back" aria-label="뒤로">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 5.5 8.5 12 15 18.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="ny-premium-checkout-bar-title">결제하기</h1>
          <span className="ny-premium-checkout-bar-spacer" aria-hidden />
        </header>

        <div className="ny-premium-checkout-hero" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/fatenavi4/checkout-hero.jpg" alt="" />
        </div>
      </section>

      <section className="ny-premium-checkout-section ny-premium-checkout-section-packs" aria-label="상품 선택">
        <div className="ny-premium-checkout-packs">
          {PACKS.map((item) => {
            const selectedPack = item.id === pack;
            return (
              <button
                key={item.id}
                type="button"
                className={`ny-premium-checkout-pack${selectedPack ? " is-selected" : ""}`}
                aria-pressed={selectedPack}
                onClick={() => setPack(item.id)}
              >
                <span className="ny-premium-checkout-pack-copy">
                  <span className="ny-premium-checkout-pack-title-row">
                    {item.recommend ? (
                      <span className="ny-premium-checkout-badge">추천</span>
                    ) : null}
                    <span className="ny-premium-checkout-pack-title">{item.title}</span>
                  </span>
                  {item.subtitle ? (
                    <span className="ny-premium-checkout-pack-sub">{item.subtitle}</span>
                  ) : null}
                </span>
                <span className="ny-premium-checkout-pack-price">
                  <span className="ny-premium-checkout-pack-list">
                    <em>{discountPercent(item.listPrice, item.price)}%</em>{" "}
                    <s>{formatPrice(item.listPrice)}</s>
                  </span>
                  <span className="ny-premium-checkout-pack-sale">{formatPrice(item.price)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {pack === "duo" ? (
        <section
          className="ny-premium-checkout-section ny-premium-checkout-section-companion"
          aria-label="함께 볼 사람"
        >
          {companion.fields}
        </section>
      ) : null}

      <section className="ny-premium-checkout-section ny-premium-checkout-section-form" aria-label="결제 정보">
        <CheckoutWidget
          token={token}
          amount={selected.price}
          pack={pack}
          legalBase="/FateNavi/legal"
          tone="ink"
          onBeforePay={() => (pack === "duo" ? companion.validate() : null)}
          getPartner={() => (pack === "duo" ? companion.payload() : null)}
        />
      </section>
    </div>
  );
}
