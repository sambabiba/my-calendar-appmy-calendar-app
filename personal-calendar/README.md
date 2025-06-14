# 📅 개인 캘린더 앱

Google Calendar 느낌의 **로컬 전용 일정 기록기**

## ✨ 주요 기능

- 📅 월간 달력 UI 자동 생성
- 🖊️ 날짜 클릭 → 일정 입력 (구현 예정)
- 📌 저장한 일정 표시 (구현 예정)
- 🧠 localStorage에 저장/불러오기 (구현 예정)
- 🔄 새로고침해도 기록 유지 (구현 예정)

## 🛠️ 사용 기술

- **UI**: HTML + CSS
- **기능 로직**: JavaScript
- **데이터 저장**: localStorage (브라우저 저장소)
- **배포**: Azure Static Web Apps (MCP)

## 📂 프로젝트 구조

```
personal-calendar/
├── index.html          # 메인 HTML 파일
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── script.js       # JavaScript 로직
└── README.md           # 프로젝트 설명
```

## 🚀 실행 방법

### 1. 로컬에서 실행
```bash
# 프로젝트 폴더로 이동
cd personal-calendar

# Live Server 확장프로그램 사용 (VS Code)
# 또는 간단한 HTTP 서버 실행
python -m http.server 8000
```

### 2. VS Code에서 실행
1. VS Code로 프로젝트 폴더 열기
2. Live Server 확장프로그램 설치
3. `index.html` 우클릭 → "Open with Live Server"

## 📋 개발 진행 상황

### ✅ 1단계: 기본 달력 UI 만들기 (완료)
- [x] 현재 연도/월 가져오기
- [x] 1일~마지막 날짜까지 렌더링
- [x] 오늘 날짜 하이라이트 표시
- [x] 지난 날짜 흐리게 표시
- [x] 반응형 디자인

### ⏳ 2단계: 날짜 클릭 → 일정 입력 모달창 (진행 예정)
- [ ] 모달창 UI 구현
- [ ] 일정 입력 폼 생성
- [ ] 입력 데이터 검증

### ⏳ 3단계: localStorage에 저장 및 불러오기 (진행 예정)
- [ ] 날짜별 일정 저장 구조 설계
- [ ] localStorage 저장/불러오기 함수
- [ ] 달력에 일정 표시

### ⏳ 4단계: 디자인 및 UX 향상 (진행 예정)
- [ ] 일정이 있는 날짜 배경 색 변경
- [ ] 일정 수정/삭제 기능
- [ ] 애니메이션 효과

### ⏳ 5단계: Azure 배포 (진행 예정)
- [ ] GitHub 레포지토리 생성
- [ ] Azure Static Web App 연결
- [ ] 자동 배포 설정

## 🎨 디자인 특징

- **모던 그라디언트 디자인**
- **오늘 날짜 펄스 애니메이션**
- **호버 효과 및 클릭 피드백**
- **일요일(빨간색), 토요일(파란색) 구분**
- **완전 반응형 디자인**

## 📱 브라우저 지원

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📝 개발 메모

### 현재 구현된 기능
1. **달력 자동 생성**: 월별로 정확한 날짜 배치
2. **날짜 상태 구분**: 오늘/과거/다른달 시각적 구분
3. **네비게이션**: 이전달/다음달 이동
4. **반응형**: 모바일 친화적 디자인

### 다음 구현할 기능
1. **일정 추가 모달**: 날짜 클릭시 팝업
2. **데이터 저장**: localStorage 활용
3. **일정 표시**: 달력에 저장된 일정 표시

## 🔗 참고 자료

- [MDN Web Docs - Date 객체](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN Web Docs - localStorage](https://developer.mozilla.org/ko/docs/Web/API/Window/localStorage)
- [CSS Grid 가이드](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Grid_Layout)

---

**개발자**: 개인 프로젝트  
**시작일**: 2025년 6월  
**상태**: 🚧 개발 중