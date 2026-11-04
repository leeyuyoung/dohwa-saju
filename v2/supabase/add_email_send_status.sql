-- 리포트 메일 발송 결과. 관리자 목록에서 확인한다.
alter table public.analyses
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_error text;

comment on column public.analyses.email_sent_at is '리포트 메일 발송 성공 시각';
comment on column public.analyses.email_error is '마지막 메일 발송 실패/스킵 사유. 성공 시 null';
