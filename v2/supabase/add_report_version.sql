-- 유료 리포트 JSON 포맷 버전. null/미표기는 코드에서 v1으로 취급한다.
alter table public.analyses
  add column if not exists report_version int;

comment on column public.analyses.report_version is '유료 리포트 JSON/화면 포맷 버전. 생성 시점에 기록. null은 v1(레거시).';

-- 이미 결제·생성된 리포트는 v1으로 고정한다.
update public.analyses
set report_version = 1
where report is not null
  and report_version is null;
