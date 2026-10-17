import { configured, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, ref, get, set, push, requireFirebase } from "./firebase.js";
import { ADMIN_LOGIN_EMAIL } from "./firebase-config.js";

const $ = s => document.querySelector(s), esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pop = msg => alert(msg);
const signup = $("#signupDialog"), login = $("#loginDialog"), admin = $("#adminDialog");
$("#signupOpen").onclick = () => signup.showModal(); $("#loginOpen").onclick = () => login.showModal(); $("#adminOpen").onclick = () => admin.showModal();
document.querySelectorAll("[data-close]").forEach(b => b.onclick = () => document.getElementById(b.dataset.close).close());
$("#reserveBtn").onclick = () => auth?.currentUser ? document.querySelector("#stayGrid").scrollIntoView({behavior:"smooth"}) : pop("로그인후 예약하시오");
$("#logoutBtn").onclick = async () => { try { await signOut(auth); pop("로그아웃되었습니다"); } catch { pop("로그아웃에 실패했습니다."); } };
$("#adminLogoutBtn").onclick = async () => { try { await signOut(auth); sessionStorage.removeItem("adminMode"); location.reload(); } catch { pop("관리자 로그아웃에 실패했습니다."); } };

$("#signupForm").addEventListener("submit", async e => {
  e.preventDefault(); const f = new FormData(e.currentTarget), name = String(f.get("name")).trim(), email = String(f.get("email")).trim(), phone = String(f.get("phone") || "").trim();
  try { requireFirebase(); const cred = await createUserWithEmailAndPassword(auth, email, String(f.get("password"))); await set(ref(db, `members/${cred.user.uid}`), { name, email, phone, role: "member", createdAt: Date.now(), updatedAt: Date.now() }); signup.close(); e.currentTarget.reset(); pop("가입 완료되었습니다."); }
  catch (err) { pop(`회원가입에 실패했습니다: ${friendly(err)}`); }
});
$("#loginForm").addEventListener("submit", async e => { e.preventDefault(); const f = new FormData(e.currentTarget); try { requireFirebase(); await signInWithEmailAndPassword(auth, String(f.get("email")).trim(), String(f.get("password"))); login.close(); e.currentTarget.reset(); pop("로그인 되었습니다."); } catch { pop("로그인 실패되었습니다."); } });
$("#adminForm").addEventListener("submit", async e => { e.preventDefault(); const f = new FormData(e.currentTarget); if (String(f.get("username")).trim() !== "admin") { pop("관리자 로그인 실패되었습니다."); return; } try { requireFirebase(); const cred = await signInWithEmailAndPassword(auth, ADMIN_LOGIN_EMAIL, String(f.get("password"))); const snap = await get(ref(db, `members/${cred.user.uid}`)); if (!snap.exists() || snap.val().role !== "admin") { await signOut(auth); throw new Error("관리자 권한이 없습니다."); } sessionStorage.setItem("adminMode", "true"); admin.close(); pop("관리자 로그인 성공"); location.href = "admin.html"; } catch (err) { pop(`관리자 로그인 실패되었습니다. ${err.message === "관리자 권한이 없습니다." ? err.message : ""}`); } });

let selectedStay = null, stayCache = [];
const bookingDialog = $("#bookingDialog"), bookingForm = $("#bookingForm");
function beginBooking(stayId) {
  if (!auth?.currentUser) { pop("로그인후 예약하시오"); return; }
  selectedStay = stayCache.find(s => s.id === stayId); if (!selectedStay) { pop("숙소 정보를 찾을 수 없습니다."); return; }
  $("#bookingStayName").textContent = selectedStay.name + " · " + Number(selectedStay.pricePerNight).toLocaleString() + "원 / 1박";
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); const min = today.toISOString().slice(0,10);
  bookingForm.elements.checkIn.min = min; bookingForm.elements.checkIn.value = min;
  const next = new Date(min + "T00:00:00"); next.setDate(next.getDate()+1); bookingForm.elements.checkOut.min = next.toISOString().slice(0,10); bookingForm.elements.checkOut.value = next.toISOString().slice(0,10);
  bookingForm.elements.guestCount.max = selectedStay.maxGuests || 1; bookingForm.elements.guestCount.value = Math.min(2, selectedStay.maxGuests || 1); estimate(); bookingDialog.showModal();
}
function estimate(){if(!selectedStay)return;const a=new Date(bookingForm.elements.checkIn.value),b=new Date(bookingForm.elements.checkOut.value),n=Math.round((b-a)/86400000);$("#bookingEstimate").textContent=n>0?"예상 금액: "+(n*Number(selectedStay.pricePerNight)).toLocaleString()+"원 ("+n+"박)":"체크아웃 날짜를 체크인 이후로 선택하세요.";}
bookingForm.elements.checkIn.addEventListener("change",()=>{const d=new Date(bookingForm.elements.checkIn.value+"T00:00:00");d.setDate(d.getDate()+1);const value=d.toISOString().slice(0,10);bookingForm.elements.checkOut.min=value;if(bookingForm.elements.checkOut.value<value)bookingForm.elements.checkOut.value=value;estimate();});bookingForm.elements.checkOut.addEventListener("change",estimate);
bookingForm.addEventListener("submit",async e=>{e.preventDefault();try{requireFirebase();if(!selectedStay||!auth.currentUser)throw new Error("로그인 상태를 확인하세요.");const f=new FormData(bookingForm),checkIn=String(f.get("checkIn")),checkOut=String(f.get("checkOut")),guestCount=Number(f.get("guestCount")),nights=Math.round((new Date(checkOut)-new Date(checkIn))/86400000);if(nights<1)throw new Error("체크아웃은 체크인 이후 날짜여야 합니다.");if(guestCount<1||guestCount>Number(selectedStay.maxGuests))throw new Error("숙소의 최대 인원을 확인하세요.");const ms=await get(ref(db,"members/"+auth.currentUser.uid)),member=ms.val()||{};const ds=await get(ref(db,"destinations/"+selectedStay.destinationId)),destination=ds.val()||{};const reservation={memberId:auth.currentUser.uid,memberName:member.name||auth.currentUser.email,destinationId:selectedStay.destinationId,stayId:selectedStay.id,destinationName:destination.name||"",stayName:selectedStay.name,checkIn:checkIn,checkOut:checkOut,guestCount:guestCount,nights:nights,pricePerNight:Number(selectedStay.pricePerNight),totalPrice:nights*Number(selectedStay.pricePerNight),status:"pending",createdAt:Date.now(),updatedAt:Date.now()};await set(push(ref(db,"reservations")),reservation);bookingDialog.close();bookingForm.reset();pop("예약 요청이 접수되었습니다.");}catch(err){pop("예약에 실패했습니다: "+err.message);}});

function friendly(err) { return ({"auth/email-already-in-use":"이미 가입된 이메일입니다.","auth/weak-password":"비밀번호는 6자 이상으로 입력하세요.","auth/invalid-email":"이메일 형식을 확인하세요.","auth/network-request-failed":"네트워크 연결을 확인하세요."})[err.code] || err.message || "잠시 후 다시 시도하세요."; }
if (configured) onAuthStateChanged(auth, user => { const adminMode = !!user && sessionStorage.getItem("adminMode") === "true"; $("#signupOpen").classList.toggle("hidden", !!user); $("#loginOpen").classList.toggle("hidden", !!user); $("#logoutBtn").classList.toggle("hidden", !user || adminMode); $("#adminOpen").classList.toggle("hidden", !!user); $("#adminLogoutBtn").classList.toggle("hidden", !adminMode); $("#reserveBtn").classList.toggle("hidden", adminMode); });
else { $("#dataNotice").textContent = "Firebase 설정 후 회원 기능과 여행지 데이터를 사용할 수 있습니다."; }

async function loadCards() {
  const dg = $("#destinationGrid"), sg = $("#stayGrid"); if (!configured) { dg.innerHTML = '<div class="empty-state">Firebase 설정을 완료하면 등록된 여행지가 표시됩니다.</div>'; sg.innerHTML = '<div class="empty-state">Firebase 설정을 완료하면 등록된 숙소가 표시됩니다.</div>'; return; }
  try { const [ds, ss] = await Promise.all([get(ref(db,"destinations")), get(ref(db,"stays"))]); const destinations = Object.entries(ds.val() || {}).filter(([,v])=>v.isPublished); const stays = Object.entries(ss.val() || {}).filter(([,v])=>v.isAvailable); stayCache=stays.map(([id,value])=>({id,...value}));
    dg.innerHTML = destinations.length ? destinations.map(([id,d])=>`<article class="place-card"><div class="place-image" style="${d.imageUrl?`background-image:url('${esc(d.imageUrl)}')`:""}">✦</div><div class="place-body"><h3>${esc(d.name)}</h3><p>${esc(d.region)} · ${esc(d.description)}</p><button class="small-btn" data-dest="${esc(id)}">주변 숙소 보기</button></div></article>`).join("") : '<div class="empty-state">등록된 여행지가 없습니다.</div>';
    sg.innerHTML = stays.length ? stays.map(([id,s])=>`<article class="place-card"><div class="place-image" style="${s.imageUrl?`background-image:url('${esc(s.imageUrl)}')`:""}">⌂</div><div class="place-body"><h3>${esc(s.name)}</h3><p>${esc(s.address)} · 최대 ${esc(s.maxGuests)}명</p><div class="price">₩${Number(s.pricePerNight||0).toLocaleString()} <span class="muted">/ 1박</span></div><button class="btn btn-primary" data-book="${esc(id)}">예약하기</button></div></article>`).join("") : '<div class="empty-state">등록된 숙소가 없습니다.</div>';
    document.querySelectorAll("[data-book]").forEach(b=>b.onclick=()=>beginBooking(b.dataset.book));
    document.querySelectorAll("[data-dest]").forEach(b=>b.onclick=()=>{const filtered=stays.filter(([,s])=>s.destinationId===b.dataset.dest);sg.innerHTML=filtered.length?filtered.map(([id,s])=>`<article class="place-card"><div class="place-image">⌂</div><div class="place-body"><h3>${esc(s.name)}</h3><p>${esc(s.address)}</p><div class="price">₩${Number(s.pricePerNight||0).toLocaleString()} / 1박</div><button class="btn btn-primary" data-book="${esc(id)}">예약하기</button></div></article>`).join(""):'<div class="empty-state">주변 숙소가 없습니다.</div>'; document.querySelectorAll("[data-book]").forEach(x=>x.onclick=()=>beginBooking(x.dataset.book)); });
  } catch(e) { dg.innerHTML='<div class="empty-state">데이터를 불러오지 못했습니다. Firebase 설정과 보안 규칙을 확인하세요.</div>'; sg.innerHTML=""; }
}
$("#searchBtn").onclick=()=>{const q=$("#destinationSearch").value.trim().toLowerCase();document.querySelectorAll("#destinationGrid .place-card").forEach(card=>card.classList.toggle("hidden",!card.textContent.toLowerCase().includes(q)));};
const topBtn=$("#toTop"); window.addEventListener("scroll",()=>topBtn.classList.toggle("visible",window.scrollY>0),{passive:true}); topBtn.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
loadCards();
