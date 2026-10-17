# 여행길 예약 사이트

HTML, CSS, 순수 JavaScript로 만든 반응형 여행지·숙소 예약 사이트입니다. 로그인과 데이터 저장은 Firebase Authentication 및 Realtime Database를 사용합니다.

## 로컬 실행

프로젝트 루트에서 Python 정적 서버를 실행합니다.

```powershell
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. Windows에서 `python`이 인식되지 않으면 `py -m http.server 8000`을 사용합니다. ES 모듈과 Firebase는 `file://`로 열면 동작하지 않습니다.

## Firebase 연결

1. Firebase Console에서 프로젝트를 만든 뒤 웹 앱을 등록합니다.
2. Authentication에서 이메일/비밀번호 로그인을 활성화합니다.
3. Realtime Database를 만들고 `js/firebase-config.js`에 웹 앱의 `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`를 입력합니다.
4. Firebase Authentication에서 관리자 계정을 이메일/비밀번호 방식으로 직접 생성합니다.
5. `js/firebase-config.js`의 `ADMIN_LOGIN_EMAIL`과 `database.rules.json`의 `admin@example.com`을 실제 관리자 이메일 주소로 동일하게 변경합니다.
6. 관리자로 첫 로그인하여 만들어진 Authentication UID를 확인한 뒤 RTDB에 `/members/{관리자_UID}`를 생성합니다. 필드는 `name`, `email`, `role: "admin"`, `createdAt`, `updatedAt`이며 비밀번호는 기록하지 않습니다.
7. Realtime Database에서 `database.rules.json` 내용을 규칙으로 적용합니다. 관리자 계정이 자기 프로필의 role을 바꾸는 동작은 화면에서 제공하지 않습니다.

웹 API 설정값은 클라이언트에 들어가므로 비밀로 취급하지 않습니다. 데이터 보안은 Database Rules가 담당합니다. 관리자 이메일을 변경할 경우 규칙에도 같은 이메일을 반영해야 합니다. 이 기본 구성은 단일 관리자 이메일을 사용합니다. 운영 전에는 관리자 custom claims 또는 검증된 서버 측 권한 부여로 전환하는 것이 권장됩니다.

## 제공 기능

- 회원가입, 이메일/비밀번호 로그인, 로그아웃
- 여행지 및 숙소 공개 목록, 검색, 여행지별 주변 숙소 보기
- 로그인 회원의 숙소 예약 요청(날짜·인원 검증 및 요금 스냅샷 저장)
- 관리자 로그인, 대시보드 요약, 여행지/숙소 등록·수정·삭제, 예약 상태 관리, 회원 조회
- 작은 화면용 반응형 레이아웃과 스크롤 상단 이동 버튼

예약은 초기 버전에서 `pending` 요청으로 기록됩니다. 날짜별 재고 잠금, 결제, 취소 환불, 동시 예약 방지는 포함되지 않습니다. 실제 판매 운영 전에 예약 가능 재고를 서버 측 트랜잭션/Cloud Functions로 검증하고 결제 흐름을 추가해야 합니다.

## 배포 준비

정적 사이트이므로 저장소 루트를 Vercel 프로젝트로 연결하면 `index.html`과 `admin.html`을 제공할 수 있습니다. Firebase 설정 및 Authentication 승인 도메인에 배포 도메인을 등록하고, 보안 규칙을 먼저 적용하세요. 실제 Firebase 프로젝트 설정 전에는 로그인/데이터 기능이 작동하지 않습니다.
