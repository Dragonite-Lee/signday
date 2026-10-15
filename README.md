# Signday

하루 3분, 취미처럼 배우는 수어 앱. 한국수어(KSL) · 미국수어(ASL).

## 실행

```bash
npm install
npx expo start
```

## 구조

```
src/
  app/               # Expo Router 화면
    _layout.tsx      # 온보딩 가드 (언어 미선택 → onboarding)
    onboarding.tsx   # KSL/ASL 선택
    index.tsx        # 홈: 스트릭, 오늘의 레슨, 레슨 목록
    lesson/[id].tsx  # 수어 하나씩 보기
    quiz/[id].tsx    # 4지선다 퀴즈 → 완료 시 스트릭 갱신
  components/        # Button, Screen, SignVideo 등
  data/lessons.ts    # curated.json → 레슨 변환 (+ ASL 기본 단어)
  store/progress.tsx # 언어·스트릭·완료 레슨 (AsyncStorage)
  utils/quiz.ts      # 문제 생성
  i18n.ts            # UI 문자열 ko/en (기기 언어 기준)
```

## 수어 데이터 (국립국어원 일상생활수어)

KCISA API(`meta13/getCTE01701`)에서 받아 `src/data/signs.json`에 저장 → 앱에 번들. 서비스키는 앱에 들어가지 않음.

```bash
KCISA_KEY=발급받은키 npm run sync:signs   # api.kcisa.kr 접근 가능한 PC에서
node scripts/sync-signs.mjs ~/Downloads/signs-raw-*.json   # 또는 브라우저로 받은 원본에서
```

- 전체 데이터: `data/signs.all.json` (3,617개, 앱에 번들 안 됨)
- 입문 커리큘럼: `data/curriculum.json` 편집 → `npm run build:curriculum` → `src/data/curated.json` (앱이 사용)
- 단어별로 어떤 수어가 골렸는지 `data/curriculum.report.md`에서 확인 (⚠️ = 후보 여러 개, 힌트로 지정 가능)

## 수어 영상 규칙

- `Sign.videoUrl`이 비어 있으면 "영상 준비 중" 표시.
- 영상은 라이선스 확인된 출처(예: 국립국어원 한국수어사전, 공공누리 조건 확인)만 사용하고 `credit`에 출처 표기.
- 농인 원어민/공인 통역사 감수 전에는 배포하지 않음. 수어 동작을 글로 임의 작성하지 않음.

## 다음 단계

- [ ] 수어 영상 확보 + 감수
- [ ] Supabase 연동 (계정, 진도 동기화)
- [ ] 레슨 해금 순서, 복습
- [ ] 마스코트, 알림
