# PRD: 여행지 소개 및 주변 숙소 예약 사이트

## 1. 제품 개요

여행지를 둘러보고 주변 숙소를 검색한 뒤 회원이 예약하는 반응형 웹사이트다. 관리자는 대시보드에서 여행지·숙소·회원·예약을 한곳에서 조회하고 관리한다. 첫 버전은 순수 HTML/CSS/JavaScript 정적 프런트엔드에 Firebase Authentication과 Realtime Database를 연결한다.

## 2. 목표 및 범위

- 여행지 정보와 주변 숙소를 보기 쉽게 제공한다.
- 로그인 회원이 숙박 기간과 인원을 입력해 예약을 생성하고 본인 예약을 확인·취소할 수 있다.
- 관리자가 회원, 여행지, 숙소, 예약을 검색·등록·수정·삭제 또는 상태 변경할 수 있다.
- 구조를 GitHub에 올리고 Vercel 정적 호스팅으로 배포할 수 있도록 준비한다.
- 결제 처리, 환불 정산, 외부 예약 재고 연동은 초기 범위에 포함하지 않는다. 결제 전 예약이라면 예약 상태를 “요청/대기”로 표시한다.

## 3. 메뉴 및 화면 구조

### 공통 주 메뉴

1. 홈
2. 여행지
3. 숙소 검색
4. 내 예약 (로그인 후)
5. 계정 영역: `회원가입` 버튼, `로그인` 버튼, `관리자` 버튼 순서

로그인 상태에서는 `회원가입`과 `로그인`을 `내 계정`으로 바꾼다. 관리자 버튼은 헤더에서 로그인 버튼 오른쪽에 배치하고, 관리자 전용 화면 진입 시 권한을 검사한다. 비관리자가 눌렀을 때는 로그인 후 권한 안내를 하거나 접근 거부 화면을 표시한다. 버튼을 숨기는 것만으로 접근을 보호하지 않는다.

### 보조 메뉴

- 여행지: 여행지 목록, 여행지 상세
- 숙소 검색: 검색 결과, 숙소 상세, 예약 작성
- 내 계정: 프로필 수정, 비밀번호 재설정(Firebase Authentication 이용)
- 내 예약: 예약 목록, 예약 상세, 예약 취소 요청
- 관리자: 대시보드, 여행지 관리, 숙소 관리, 회원 관리, 예약 관리

### 화면 구조도

```text
공통 헤더(로고 / 홈 / 여행지 / 숙소 검색 / 내 예약 / 회원가입 / 로그인 / 관리자)
├─ 홈
│  ├─ 여행지 추천
│  └─ 숙소 검색 바로가기
├─ 여행지 목록
│  └─ 여행지 상세
│     └─ 주변 숙소 목록 → 숙소 상세 → 예약 작성
├─ 숙소 검색 결과
│  └─ 숙소 상세 → 예약 작성 → 예약 완료 안내
├─ 로그인 / 회원가입
├─ 내 계정 / 프로필 수정
└─ 내 예약 목록 → 예약 상세 → 취소 요청

화면 공통 기능
└─ 페이지 상단 이동 버튼: 스크롤이 최상단을 벗어난 뒤 표시, 누르면 문서 최상단으로 부드럽게 이동

관리자 레이아웃(사이드 메뉴 / 상단 요약 / 본문)
├─ 대시보드
├─ 여행지 관리 → 등록 / 상세 / 수정
├─ 숙소 관리 → 등록 / 상세 / 수정
├─ 회원 관리 → 상세 / 상태 변경
└─ 예약 관리 → 상세 / 상태 변경
```

### 기획 화면 파일명

모든 HTML 화면은 `html/`에 둔다. 루트의 `index.html`은 홈 진입점이다.

| 화면 | 파일 |
|---|---|
| 홈 | `index.html` |
| 여행지 목록 | `html/destinations.html` |
| 여행지 상세 | `html/destination-detail.html` |
| 숙소 검색 결과 | `html/stays.html` |
| 숙소 상세 | `html/stay-detail.html` |
| 예약 작성 및 완료 | `html/reservation-form.html` |
| 로그인 | `html/login.html` |
| 회원가입 | `html/signup.html` |
| 내 계정 / 프로필 | `html/account.html` |
| 내 예약 목록 및 상세 | `html/my-reservations.html` |
| 관리자 대시보드 | `admin.html` (프로젝트 루트, 사용자 지정 진입 파일) |
| 관리자 여행지 관리 | `html/admin-destinations.html` |
| 관리자 숙소 관리 | `html/admin-stays.html` |
| 관리자 회원 관리 | `html/admin-members.html` |
| 관리자 예약 관리 | `html/admin-reservations.html` |

관리자 화면은 메뉴 전환 방식으로 여행지/숙소/회원/예약 관리 기능을 제공한다.

스타일 파일은 `css/`에 `base.css`, `layout.css`, `components.css`, `pages.css`, `admin.css`로 나눈다. JavaScript는 `js/`에 `firebase-config.js`, `firebase-auth.js`, `database.js`, `common.js`, `destinations.js`, `stays.js`, `reservations.js`, `account.js`, `admin.js`를 둔다. 화면별 스크립트가 필요한 경우 위 모듈을 재사용한다.

## 4. 데이터 설계

Firebase Realtime Database 구조 예시:

```text
/
  destinations/{destinationId}
  stays/{stayId}
  members/{uid}
  reservations/{reservationId}
```

RTDB는 SQL 테이블이 아닌 JSON 트리다. 아래 네 노드는 요청한 논리 테이블이며 ID는 Firebase push ID 또는 Authentication UID를 사용한다. 금액 단위는 KRW 정수로 저장한다.

### `destinations` — 여행지

| 필드 | 형식 | 필수 | 설명 |
|---|---|---:|---|
| `name` | string | 예 | 여행지 이름 |
| `region` | string | 예 | 시·도/도시 등 검색용 지역 |
| `description` | string | 예 | 소개 문구 |
| `imageUrl` | string | 예 | 대표 이미지 URL |
| `isPublished` | boolean | 예 | 공개 여부 |
| `createdAt` | number | 예 | 생성 시각, Unix ms |
| `updatedAt` | number | 예 | 수정 시각, Unix ms |

DB 키가 여행지 ID다. 여행지 삭제 시 연결된 숙소와 향후 예약의 표시 정책을 먼저 확인한다. 예약 이력이 있는 참조 데이터는 실제 삭제 대신 비공개 처리하는 것을 기본으로 한다.

### `stays` — 숙소

| 필드 | 형식 | 필수 | 설명 |
|---|---|---:|---|
| `destinationId` | string | 예 | 주변 여행지 ID |
| `name` | string | 예 | 숙소 이름 |
| `address` | string | 예 | 주소 |
| `description` | string | 예 | 숙소 소개 |
| `imageUrl` | string | 예 | 대표 이미지 URL |
| `pricePerNight` | number | 예 | 1박 기준 요금(KRW 정수) |
| `maxGuests` | number | 예 | 최대 투숙 인원 |
| `isAvailable` | boolean | 예 | 신규 예약 접수 여부 |
| `createdAt` | number | 예 | 생성 시각, Unix ms |
| `updatedAt` | number | 예 | 수정 시각, Unix ms |

DB 키가 숙소 ID다. 초기 버전에서는 날짜별 재고·요금 캘린더를 만들지 않는다. 실제 동시 재고 제어가 필요하면 예약 트랜잭션용 별도 경로/Cloud Functions를 설계한다.

### `members` — 회원 프로필

| 필드 | 형식 | 필수 | 설명 |
|---|---|---:|---|
| `name` | string | 예 | 표시 이름 |
| `email` | string | 예 | 로그인 이메일(인증 정보는 Firebase Auth가 관리) |
| `phone` | string | 아니오 | 예약 연락처 |
| `role` | string | 예 | `member` 또는 `admin` |
| `createdAt` | number | 예 | 생성 시각, Unix ms |
| `updatedAt` | number | 예 | 수정 시각, Unix ms |

DB 키는 Firebase Authentication의 UID다. 비밀번호, 카드 정보는 저장하지 않는다. 관리자 `role`은 일반 회원이 직접 변경할 수 없게 규칙과 운영 절차로 보호한다.

### `reservations` — 예약

| 필드 | 형식 | 필수 | 설명 |
|---|---|---:|---|
| `memberId` | string | 예 | 예약 회원 UID |
| `destinationId` | string | 예 | 여행지 ID |
| `stayId` | string | 예 | 숙소 ID |
| `checkIn` | string | 예 | 체크인 날짜 `YYYY-MM-DD` |
| `checkOut` | string | 예 | 체크아웃 날짜 `YYYY-MM-DD` |
| `guestCount` | number | 예 | 투숙 인원 |
| `nights` | number | 예 | 숙박 박수 |
| `pricePerNight` | number | 예 | 예약 시점 1박 요금 스냅샷(KRW) |
| `totalPrice` | number | 예 | 예약 시점 총액 스냅샷(KRW) |
| `status` | string | 예 | `pending`, `confirmed`, `cancelled`, `completed` |
| `createdAt` | number | 예 | 예약 생성 시각, Unix ms |
| `updatedAt` | number | 예 | 마지막 수정 시각, Unix ms |

DB 키가 예약 ID다. 최소 예약 입력은 숙소, 체크인, 체크아웃, 인원이다. 숙박일수는 체크아웃-체크인으로 계산하고, 총액은 숙박일수×예약 시점 1박 요금으로 계산한다. 날짜는 체크인 전이며 체크아웃이 체크인 이후인지 검증한다. 인원은 1 이상, 숙소 최대 인원 이하로 제한한다. 예약 스냅샷은 `stayName`과 `destinationName`을 추가 저장해 숙소/여행지 이름이 바뀌거나 비공개되어도 예약 내역이 읽히도록 한다.

## 5. 회원 및 관리자 흐름

### 회원

1. 홈 또는 여행지 목록에서 여행지를 고른다.
2. 여행지 상세에서 연결된 숙소를 보거나 숙소 검색을 이용한다.
3. 숙소 상세에서 요금과 최대 인원을 확인한다.
4. 로그인 상태가 아니면 로그인/회원가입으로 이동한 뒤 예약 입력으로 돌아온다.
5. 체크인·체크아웃·인원 입력 후 유효성 검사와 예상 총액을 확인한다.
6. 예약을 제출하면 `pending` 상태로 저장하고 완료 안내 및 예약 ID를 표시한다.
7. 내 예약에서 상태와 일정을 확인한다. 정책상 가능한 예약은 취소 요청할 수 있다.

### 관리자

1. 권한이 확인된 계정으로 로그인해 관리자 메뉴에 접근한다.
2. 대시보드의 요약과 최근 예약을 확인한다.
3. 각 관리 메뉴에서 검색·필터·상세 보기를 이용한다.
4. 여행지/숙소는 등록·수정·공개/비공개 처리한다. 삭제는 예약 참조 여부를 확인하고 필요한 경우 비공개 처리한다.
5. 회원은 조회하고 필요한 경우 계정을 비활성 상태로 관리한다. 비밀번호는 조회/수정하지 않는다.
6. 예약은 상세를 확인하고 정책에 맞게 `pending`→`confirmed`/`cancelled`, 일정 종료 후 `completed`로 변경한다.

## 6. 관리자 대시보드 구체 항목

- 요약 카드: 공개 여행지 수, 예약 가능 숙소 수, 전체 회원 수, 미처리(`pending`) 예약 수
- 기간 선택: 최근 7일/30일 또는 전체
- 최근 예약 목록: 예약 ID, 회원, 숙소, 체크인·체크아웃, 결제 예정 총액, 상태, 생성일
- 빠른 작업: 여행지 등록, 숙소 등록, 예약 대기 목록 열기
- 관리 목록 공통: 키워드 검색, 상태 필터, 정렬, 페이지 또는 더 보기, 상세 보기, 등록/수정 폼, 삭제 확인
- 예약 관리 추가: 상태 필터, 기간 필터, 예약 상세, 상태 변경, 취소 사유(필요 시 최소 필드 추가)
- 회원 관리 추가: 이름/이메일 검색, 가입일, 역할 표시, 예약 수, 계정 상태
- 여행지/숙소 관리 추가: 공개·예약 가능 여부, 수정일, 연결 개수

## 7. 반응형 및 공통 상태

- 모바일: 상단 메뉴는 접을 수 있는 내비게이션, 관리자 사이드 메뉴는 드로어 또는 상단 선택 메뉴로 표시한다. 목록은 카드형으로 바꾸고 표는 가로 넘침을 피한다.
- 태블릿/데스크톱: 콘텐츠 최대 폭을 제한하고 관리자 목록은 표/필터 패널을 사용한다.
- 모든 Firebase 비동기 화면은 로딩, 데이터 없음, 오류, 성공 상태를 제공한다.
- 이미지가 없거나 실패하면 대체 이미지를 표시한다. 사용자 입력을 그대로 HTML 삽입하지 않는다.
- 페이지 상단 이동 버튼은 초기 최상단에서는 숨긴다. 스크롤 위치가 0보다 커지는 순간 표시하고 다시 최상단에 도달하면 숨긴다. 클릭 시 `window.scrollTo({ top: 0, behavior: "smooth" })`로 이동한다. 버튼에는 접근 가능한 이름(예: `페이지 맨 위로 이동`)을 제공하고, 위쪽 화살표 아이콘은 인라인 SVG로 구현한다.
- 헤더 계정 버튼은 `회원가입` → `로그인` → `관리자` 순서로 배치한다. 즉 회원가입은 로그인 왼쪽, 관리자는 로그인 오른쪽이다. 작은 화면에서도 이 순서를 유지하거나 메뉴 안에서 순서를 동일하게 유지한다.

## 8. Firebase, GitHub, Vercel 준비

- Firebase Console에서 프로젝트와 Realtime Database를 만들고 Authentication의 이메일/비밀번호 제공자를 활성화한다.
- 로컬 개발은 Python 내장 정적 서버로 실행한다. 프로젝트 루트에서 `python -m http.server 8000`을 실행하고 `http://localhost:8000`에 접속한다. Python 실행 명령이 `python`이 아닌 환경은 `py -m http.server 8000`을 사용할 수 있다. 별도 백엔드 서버를 뜻하지 않으며, Firebase 연동은 브라우저에서 진행한다.
- `js/firebase-config.js`의 설정 객체를 프로젝트 값으로 채운다. 웹 설정값은 공개 가능하지만 RTDB 규칙을 함께 배포하고 기본 공개 읽기/쓰기를 금지한다.
- `database.rules.json`에 인증, 본인 데이터 접근, 관리자 전용 쓰기, 필드 타입과 필수 값 검증 규칙을 준비한다. 관리자 권한은 안전한 초기 프로비저닝 절차로 부여한다.
- 배포 전 회원 가입, 로그인, 본인 예약 조회, 다른 회원 데이터 차단, 관리자 CRUD를 실제 Firebase 프로젝트에서 확인한다.
- GitHub 저장소에는 소스와 규칙/설정 템플릿을 올린다. 비공개 서버 자격 증명 및 개인 키는 커밋하지 않는다.
- Vercel은 정적 사이트로 루트 디렉터리에서 배포한다. `index.html`을 엔트리로 사용하고 필요한 경우 `vercel.json`으로 HTML 경로 및 캐시 동작을 설정한다.
- Firebase 프로젝트와 GitHub/Vercel 계정 연결은 환경별 자격 증명 및 계정 권한이 준비된 뒤 완료한다. 준비 문서만 만든 경우 실제 연동·배포 완료로 표기하지 않는다.

## 9. 초기 버전 완료 조건

- 루트에 `index.html`, 문서에 정의된 화면/스타일/스크립트 파일 구조가 준비된다.
- 여행지 및 숙소 탐색, Firebase Auth 회원가입/로그인, 예약 생성·조회·취소 흐름이 연결된다.
- 관리자 전용 대시보드와 여행지·숙소·회원·예약 관리 화면이 제공된다.
- RTDB 규칙이 기본 거부이며 회원/관리자 접근 경계를 적용한다.
- 반응형 화면, 폼 검증, 로딩/빈/오류 상태가 준비되고 Firebase/GitHub/Vercel 설정 절차가 문서화된다.
