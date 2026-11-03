-- 결제 시 연락처·마케팅 수신 동의 보관
alter table public.analyses
  add column if not exists phone text,
  add column if not exists marketing_opt_in boolean;

comment on column public.analyses.phone is '결제 직전 입력한 휴대폰. 결제·안내용. 마케팅 동의 시 수신 채널로도 씀.';
comment on column public.analyses.marketing_opt_in is '마케팅 수신 동의(선택). null=미응답/결제 전, true/false=결제 시 선택.';
