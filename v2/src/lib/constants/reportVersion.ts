/** 새로 생성되는 유료 리포트에 찍는 포맷 버전. 장 구조를 바꿀 때 올린다. */
export const CURRENT_REPORT_VERSION = 2;

/** 저장된 버전. null/미표기는 첫 포맷(v1)으로 본다. */
export function resolveReportVersion(reportVersion: number | null | undefined): number {
  return reportVersion ?? 1;
}
