// Firebase Console > Project settings > Your apps에서 웹 앱 설정을 복사하세요.
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Firebase Authentication에 미리 등록할 관리자의 이메일 주소.
// 화면에서는 admin 아이디를 받고, 아래 이메일로 Firebase Auth 로그인을 수행합니다.
export const ADMIN_LOGIN_EMAIL = "admin@example.com";
