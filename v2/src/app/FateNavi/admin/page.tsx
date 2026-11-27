import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { PRODUCT_NEWYEAR } from "@/lib/constants/newyear";
import { isAdminConfigured, requireAdminSession } from "@/lib/server/adminAuth";

export const metadata: Metadata = {
  title: "프리미엄 종합사주 관리자",
  robots: { index: false, follow: false },
};

export default async function NewYearAdminPage() {
  if (!isAdminConfigured()) notFound();
  const authed = await requireAdminSession();
  return (
    <NewYearShell theme="premium" tone="ink" showHeader showFooter={false}>
      <AdminDashboard initiallyAuthed={authed} product={PRODUCT_NEWYEAR} />
    </NewYearShell>
  );
}
