# 핫딜 게시판 백엔드 설정 가이드

이 프로젝트는 외부 Supabase 프로젝트(`.env.local`의 `VITE_SUPABASE_URL`)를 사용합니다.
핫딜 게시판이 작동하려면 **3가지** 설정이 필요합니다.

---

## 1. DB 테이블 만들기

Supabase Dashboard → **SQL Editor** 에서 [`docs/hotdeals-setup.sql`](./hotdeals-setup.sql) 의 내용을 붙여넣고 실행합니다.

생성되는 것:
- `public.hotdeals` 테이블 (RLS, 누구나 읽기 가능)
- 인덱스 2개
- `pg_cron` / `pg_net` 확장 (자동 스케줄링용)

---

## 2. RSS 수집 Edge Function 배포

```bash
# Supabase CLI 설치 후
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase functions deploy fetch-hotdeals --no-verify-jwt
```

> `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` 는 Edge Function 런타임에 자동 주입됩니다.

수동 호출로 테스트:
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/fetch-hotdeals \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```
응답 예시: `{"ok":true,"totalInserted":42,"perSource":{"ppomppu":15,"ruliweb":12,"quasarzone":15}}`

---

## 3. 매일 자동 실행 cron 등록

`docs/hotdeals-setup.sql` 마지막의 `cron.schedule(...)` 블록의 주석을 풀고
- `YOUR-PROJECT.supabase.co` → 본인 프로젝트 URL
- `YOUR_SERVICE_ROLE_KEY`  → Settings → API → `service_role` key

로 치환한 뒤 SQL Editor에서 한 번만 실행합니다.

확인:
```sql
select * from cron.job;
select * from cron.job_run_details order by start_time desc limit 5;
```

---

## 수집 대상 RSS 피드

`supabase/functions/fetch-hotdeals/index.ts` 의 `FEEDS` 배열에 정의되어 있습니다.

| 사이트 | 피드 |
| --- | --- |
| 뽐뿌 | `https://www.ppomppu.co.kr/rss.php?id=ppomppu` |
| 루리웹 핫딜 | `https://bbs.ruliweb.com/news/board/1020/rss` |
| 퀘이사존 세일 | `https://quasarzone.com/rss/qb_saleinfo` |

피드 사이트가 RSS 구조를 바꾸면 파싱이 실패할 수 있으니 주기적으로 확인하세요.
30일 이상된 항목은 함수 실행 시 자동으로 정리됩니다.

---

## 백엔드 미설정 상태에서의 동작

DB가 아직 비어있거나 환경변수가 없으면, 핫딜 페이지는 **샘플 항목 1개**를 보여주며
사용자에게 백엔드 설정이 필요함을 안내합니다. UI는 정상 동작합니다.
