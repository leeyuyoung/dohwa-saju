import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PRODUCT_NEWYEAR } from "@/lib/constants/newyear";
import { isAdminConfigured, requireAdminSession } from "@/lib/server/adminAuth";

export const metadata: Metadata = {
  title: "2027 관리자",
  robots: { index: false, follow: false },
};

export default async function NewYearAdminPage() {
  if (!isAdminConfigured()) notFound();
  const authed = await requireAdminSession();
  return (
    <div className="min-h-dvh bg-night text-paper">
      <AdminDashboard initiallyAuthed={authed} product={PRODUCT_NEWYEAR} />
    </div>
  );
}
