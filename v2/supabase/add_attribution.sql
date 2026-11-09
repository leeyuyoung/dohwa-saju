-- 광고 유입(UTM) 첫 터치. 제출 시점에 기록한다.
alter table public.analyses
  add column if not exists attribution jsonb;

comment on column public.analyses.attribution is '광고 유입 UTM 첫 터치. {utmSource,utmMedium,utmCampaign,utmContent,utmTerm,landing,capturedAt}';
