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
  data/lessons.ts    # 커리큘럼 (현재 단어만, 영상 없음)
  store/progress.tsx # 언어·스트릭·완료 레슨 (AsyncStorage)
  utils/quiz.ts      # 문제 생성
  i18n.ts            # UI 문자열 ko/en (기기 언어 기준)
```

## 수어 영상 규칙

- `Sign.videoUrl`이 비어 있으면 "영상 준비 중" 표시.
- 영상은 라이선스 확인된 출처(예: 국립국어원 한국수어사전, 공공누리 조건 확인)만 사용하고 `credit`에 출처 표기.
- 농인 원어민/공인 통역사 감수 전에는 배포하지 않음. 수어 동작을 글로 임의 작성하지 않음.

## 다음 단계

- [ ] 수어 영상 확보 + 감수
- [ ] Supabase 연동 (계정, 진도 동기화)
- [ ] 레슨 해금 순서, 복습
- [ ] 마스코트, 알림
