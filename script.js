// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://wcputjmttyxyhvdlbckn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PmpusysDHCSmbnlDQ-_QkA_pHd9pHw5";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// สร้าง Profile ให้ Anonymous User
async function ensureProfile() {
  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !sessionData.session) {
    console.error("ไม่พบ Anonymous Session:", sessionError);
    return;
  }

  const user = sessionData.session.user;

  const { data: profile, error: profileError } =
    await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error("ตรวจสอบ Profile ไม่สำเร็จ:", profileError);
    return;
  }

  if (!profile) {
    const { error: insertError } =
      await supabaseClient
        .from("profiles")
        .insert({
          id: user.id
        });

    if (insertError) {
      console.error("สร้าง Profile ไม่สำเร็จ:", insertError);
      return;
    }

    console.log("สร้าง Profile สำเร็จ:", user.id);
  }
}


/* =========================================================
   Eco Steps Demo — script.js
   Frontend-only prototype. State persisted in localStorage.
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "ecosteps_demo_state_v1";
  const FEEDBACK_URL = "https://forms.gle/S97mUgssZafxpZAa6";
  const POINTS_PER_MISSION = 5;
  const POINTS_PER_LEVEL = 20;

  /* ---------------- Data ---------------- */
  let MISSIONS = [
    { id: "sort-trash", icon: "🗑️", name: "แยกขยะก่อนทิ้ง", desc: "แยกขยะรีไซเคิล ขยะเปียก และขยะทั่วไปให้ถูกประเภทก่อนทิ้ง", diff: "ง่าย" },
    { id: "reduce-plastic", icon: "🧴", name: "ลดการใช้พลาสติก", desc: "หลีกเลี่ยงถุงพลาสติกและบรรจุภัณฑ์แบบใช้ครั้งเดียวทิ้ง", diff: "ปานกลาง" },
    { id: "bring-bottle", icon: "🧃", name: "พกขวดน้ำส่วนตัว", desc: "พกขวดน้ำของตัวเองแทนการซื้อน้ำขวดพลาสติก", diff: "ง่าย" },
    { id: "turn-off-lights", icon: "💡", name: "ปิดไฟเมื่อไม่ใช้งาน", desc: "ปิดไฟและเครื่องใช้ไฟฟ้าทุกครั้งที่ไม่ใช้งาน", diff: "ง่าย" },
    { id: "clean-school", icon: "🧹", name: "เก็บขยะบริเวณโรงเรียน", desc: "ช่วยกันเก็บขยะบริเวณโรงเรียนให้สะอาดน่าอยู่", diff: "ปานกลาง" },
    { id: "use-paper-wisely", icon: "📄", name: "ใช้กระดาษอย่างคุ้มค่า", desc: "ใช้กระดาษสองหน้าและลดการพิมพ์ที่ไม่จำเป็น", diff: "ง่าย" },
    { id: "save-water", icon: "🚿", name: "ประหยัดน้ำ", desc: "ปิดก๊อกน้ำระหว่างแปรงฟันและใช้น้ำอย่างรู้คุณค่า", diff: "ปานกลาง" },
    { id: "save-energy", icon: "🔌", name: "ลดการใช้พลังงาน", desc: "ถอดปลั๊กเครื่องใช้ไฟฟ้าที่ไม่ใช้งานเพื่อลดพลังงานสูญเปล่า", diff: "ยาก" },
  ];

  const REWARDS = [
    { level: 3, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 4, title: "Badge / รางวัลเล็ก", icon: "🏅" },
    { level: 5, title: "กรอบโปรไฟล์", icon: "🖼️" },
    { level: 6, title: "โปรไฟล์ใหม่ + สิทธิ์ดูดวง 1 ครั้ง", icon: "🔮" },
    { level: 8, title: "รางวัลพิเศษ", icon: "🎁" },
    { level: 9, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 10, title: "กรอบโปรไฟล์", icon: "🖼️" },
    { level: 11, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 12, title: "เกียรติบัตรนักประหยัดพลังงาน", icon: "📜" },
    { level: 13, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 14, title: "รางวัลพิเศษ", icon: "🎁" },
    { level: 15, title: "เกียรติบัตรรักษ์สิ่งแวดล้อม", icon: "📜" },
    { level: 16, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 17, title: "Badge พิเศษ", icon: "🏅" },
    { level: 18, title: "กรอบโปรไฟล์", icon: "🖼️" },
    { level: 19, title: "โปรไฟล์ใหม่", icon: "👤" },
    { level: 20, title: "เกียรติบัตรนักอนุรักษ์", icon: "📜" },
    { level: 25, title: "เกียรติบัตรระดับสูง", icon: "📜" },
    { level: 30, title: "Eco Champion", icon: "👑" },
  ];

  /* ---------------- Profile Collections ---------------- */

  const PROFILE_COLLECTIONS = {
    3: {
      name: "Nature Collection",
      description: "โปรไฟล์ธีมธรรมชาติ",
      images: []
    },

    6: {
      name: "Space Collection",
      description: "โปรไฟล์ธีมอวกาศ",
      images: []
    },

    9: {
      name: "Ocean Collection",
      description: "โปรไฟล์ธีมทะเลและมหาสมุทร",
      images: []
    },

    11: {
      name: "Festival Collection",
      description: "โปรไฟล์ธีมเทศกาล",
      images: []
    },

    13: {
      name: "Fantasy Collection",
      description: "โปรไฟล์ธีมแฟนตาซีและการผจญภัย",
      images: []
    },

    16: {
      name: "Cartoon Collection",
      description: "โปรไฟล์สไตล์การ์ตูน",
      images: []
    },

    19: {
      name: "Ultimate Collection",
      description: "โปรไฟล์คอลเลกชันพิเศษ",
      images: []
    }
  };


  /* ---------------- Frame Collections ---------------- */

  const FRAME_COLLECTIONS = {
    5: {
      name: "Nature Frames",
      description: "กรอบโปรไฟล์ธีมธรรมชาติ",
      images: []
    },

    10: {
      name: "Cosmic Frames",
      description: "กรอบโปรไฟล์ธีมอวกาศ",
      images: []
    },

    18: {
      name: "Ultimate Frames",
      description: "กรอบโปรไฟล์คอลเลกชันพิเศษ",
      images: []
    }
  };

  const PRODUCTS = [
    { id: "bottle", icon: "🌿", name: "แก้วน้ำรักษ์โลก", price: 199, desc: "แก้วน้ำสแตนเลสรักษ์โลก เก็บความเย็นได้นาน ลดการใช้ขวดพลาสติก" },
    { id: "totebag", icon: "👜", name: "ถุงผ้า", price: 129, desc: "ถุงผ้าดีไซน์น่ารัก ใช้แทนถุงพลาสติกได้ทุกโอกาส" },
    { id: "lunchbox", icon: "🍱", name: "กล่องอาหาร", price: 249, desc: "กล่องอาหารรักษ์โลก ปลอดสาร ใช้ซ้ำได้นาน" },
    { id: "shirt", icon: "👕", name: "เสื้อผ้าสไตล์น่ารัก", price: 350, desc: "เสื้อยืดลายเอกลักษณ์ Eco Steps ผลิตจากผ้าฝ้ายรักษ์โลก" },
    { id: "notebook", icon: "📓", name: "สมุดรีไซเคิล", price: 59, desc: "สมุดทำจากกระดาษรีไซเคิล 100% เป็นมิตรกับสิ่งแวดล้อม" },
  ];

  const IMPACT_CHART = [
    { label: "แยกขยะ", pct: 82 },
    { label: "ลดพลาสติก", pct: 68 },
    { label: "ประหยัดพลังงาน", pct: 74 },
    { label: "ประหยัดน้ำ", pct: 61 },
    { label: "เก็บขยะโรงเรียน", pct: 55 },
  ];

  const DEFAULT_STATE = {
    demoStarted: false,
    points: 0,
    missionsCompleted: 0,
    completedMissionIds: [],
    avatar: "male",
  };

  /* ---------------- State ---------------- */
  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable — demo continues in-memory */ }
  }

  function getLevel(points) { return Math.floor(points / POINTS_PER_LEVEL) + 1; }
  function getProgressInLevel(points) { return points % POINTS_PER_LEVEL; }
  function getUnlockedRewards() {
    const lvl = getLevel(state.points);
    return REWARDS.filter(r => r.level <= lvl);
  }
  function getNextReward() {
    const lvl = getLevel(state.points);
    return REWARDS.find(r => r.level > lvl) || null;
  }

  /* ---------------- Real profile from Supabase (profiles table) ----------------
     currentProfile ถือข้อมูลจริงของผู้ใช้ที่ล็อกอินอยู่ (full_name, class_name,
     student_code, avatar, points) ใช้แสดงในหน้า Profile และเป็นแหล่งคะแนนหลัก
     ของทั้งแอป แทนคะแนน Demo เดิมใน localStorage */
  let currentProfile = null;

  async function loadProfileFromSupabase() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData || !sessionData.session) {
      currentProfile = null;
      return null;
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, full_name, class_name, student_code, avatar, points")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("โหลด Profile จาก Supabase ไม่สำเร็จ:", error);
      currentProfile = null;
      return null;
    }

    currentProfile = data;

    // ซิงก์ avatar จาก Supabase เข้ากับ state เดิม (ยังใช้ path เดิมในการแสดงผล)
    if (currentProfile && (currentProfile.avatar === "male" || currentProfile.avatar === "female")) {
      state.avatar = currentProfile.avatar;
      saveState();
    }

    return currentProfile;
  }

  // แหล่งคะแนนหลักของทั้งแอป: ใช้ profiles.points จาก Supabase ถ้ามี
  // ถ้ายังโหลดไม่เสร็จ/ไม่มี session ค่อย fallback ไปคะแนน Demo เดิม
  function getDisplayPoints() {
    return (currentProfile && typeof currentProfile.points === "number")
      ? currentProfile.points
      : state.points;
  }

  /* ---------------- DOM refs ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const pages = $$(".page");
  const navBtns = $$("[data-nav]");
  const submitCtx = { missionId: null, beforeData: null, afterData: null };

  /* ---------------- Routing ---------------- */
  function navigate(pageName, opts) {
    opts = opts || {};
    if (pageName !== "home" && !state.demoStarted) {
      startDemo(function () { renderAndGo(pageName, opts); });
      return;
    }
    renderAndGo(pageName, opts);
  }

  function renderAndGo(pageName, opts) {
    pages.forEach(p => p.classList.toggle("active", p.dataset.page === pageName));
    navBtns.forEach(b => b.classList.toggle("active", b.dataset.nav === pageName));
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMobileMenu();

    if (pageName === "mission") renderMissions();
    if (pageName === "dashboard") renderDashboard();
    if (pageName === "rewards") renderRewards();
    if (pageName === "profile") { loadProfileFromSupabase().then(renderProfile); }
    if (pageName === "marketplace") renderMarketplace();
    if (pageName === "impact") renderImpact();
    if (pageName === "submit") renderSubmit(opts.missionId);
    if (pageName === "home") renderHeroTrail();

    updateTopPoints();
  }

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  /* ---------------- Mobile menu ---------------- */
  const hamburgerBtn = $("#hamburgerBtn");
  const navlinks = $("#navlinks");
  hamburgerBtn.addEventListener("click", () => {
    navlinks.classList.toggle("mobile-open");
    hamburgerBtn.classList.toggle("open");
  });
  function closeMobileMenu() {
    navlinks.classList.remove("mobile-open");
    hamburgerBtn.classList.remove("open");
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------------- Modals / Popups ---------------- */
  function openModal(id) { $("#" + id).classList.add("show"); }
  function closeModal(id) { $("#" + id).classList.remove("show"); }
  $$("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  $$(".modal-backdrop, .popup-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("show");
    });
  });

  /* ---------------- Try Demo flow ---------------- */
  function startDemo(callback) {
    openModal("tryDemoModal");
    const confirmBtn = $("#confirmDemoBtn");
    const handler = () => {
      state.demoStarted = true;
      saveState();
      closeModal("tryDemoModal");
      showToast("ยินดีต้อนรับ เรียนดี รักษ์สิ่งแวดล้อม 🌱");
      confirmBtn.removeEventListener("click", handler);
      if (callback) callback();
    };
    confirmBtn.addEventListener("click", handler);
  }

  $("[data-action='try-demo']").addEventListener("click", () => navigate("profile"));
  $("[data-action='start-mission']").addEventListener("click", () => navigate("mission"));

  /* ---------------- Reset Demo ---------------- */
  $("#resetDemoBtn").addEventListener("click", () => openModal("resetModal"));
  $("#confirmResetBtn").addEventListener("click", () => {
    state = Object.assign({}, DEFAULT_STATE);
    saveState();
    closeModal("resetModal");
    showToast("รีเซ็ต Demo เรียบร้อยแล้ว 🔄");
    updateTopPoints();
    navigate("home");
  });

  /* ---------------- Feedback buttons ---------------- */
  function openFeedback() { window.open(FEEDBACK_URL, "_blank", "noopener"); }
  $("#feedbackBtnHome").addEventListener("click", openFeedback);
  $("#feedbackBtnFooter").addEventListener("click", openFeedback);

  /* ---------------- Top points pill ---------------- */
  function updateTopPoints() {
    $("#topPoints").textContent = getDisplayPoints() + " pts";
  }

  /* ---------------- Hero step trail ---------------- */
  function renderHeroTrail() {
    const trail = $("#heroTrail");
    trail.innerHTML = "";
    const total = 12;
    const filled = Math.min(total, Math.round((getProgressInLevel(state.points) / POINTS_PER_LEVEL) * total));
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = "step-dot" + (i < filled ? " filled" : "");
      dot.style.left = (4 + i * (92 / total)) + "%";
      trail.appendChild(dot);
    }
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    const lvl = getLevel(state.points);
    const inLevel = getProgressInLevel(getDisplayPoints());
    $("#dashLevel").textContent = lvl;
    $("#dashPoints").textContent = getDisplayPoints();
    $("#dashMissionCount").textContent = state.missionsCompleted;
    $("#dashProgressLabel").textContent = inLevel + "/" + POINTS_PER_LEVEL;
    $("#dashProgressFill").style.width = (inLevel / POINTS_PER_LEVEL * 100) + "%";
    $("#dashAvatar").textContent = state.avatar === "female" ? "👧" : "🧑";

    const trailEl = $("#dashStepTrail");
    trailEl.innerHTML = "";
    const total = 20;
    const filled = Math.round((inLevel / POINTS_PER_LEVEL) * total);
    for (let i = 0; i < total; i++) {
      const d = document.createElement("span");
      d.className = "step-trail__dot" + (i < filled ? " on" : "");
      trailEl.appendChild(d);
    }

    const next = getNextReward();
    $("#dashNextReward").innerHTML = next
      ? `<span>${next.icon}</span><span>Level ${next.level} — ${next.title}</span>`
      : `<span>🏆</span><span>ปลดล็อกรางวัลครบทุกระดับแล้ว!</span>`;

    const suggestBox = $("#dashSuggestMissions");
    suggestBox.innerHTML = "";
    const undone = MISSIONS.filter(m => !state.completedMissionIds.includes(m.id));
    (undone.length ? undone : MISSIONS).slice(0, 3).forEach(m => {
      const el = document.createElement("div");
      el.className = "mission-card";
      el.innerHTML = `
        <span class="mission-card__icon">${m.icon}</span>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <div class="mission-card__meta">
          <span class="diff diff--${m.diff}">${m.diff}</span>
          <span class="points-badge">+${POINTS_PER_MISSION} pts</span>
        </div>
        <button class="btn btn--primary btn--sm btn--block" data-mission="${m.id}">ทำภารกิจ</button>
      `;
      el.querySelector("button").addEventListener("click", () => navigate("submit", { missionId: m.id }));
      suggestBox.appendChild(el);
    });
  }

  /* ---------------- Mission list ---------------- */
  function renderMissions() {
    const grid = $("#missionGrid");
    grid.innerHTML = "";
    MISSIONS.forEach(m => {
      const done = state.completedMissionIds.includes(m.id);
      const el = document.createElement("div");
      el.className = "mission-card" + (done ? " done" : "");
      el.innerHTML = `
        <span class="mission-card__icon">${m.icon}</span>
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <div class="mission-card__meta">
          <span class="diff diff--${m.diff}">${m.diff}</span>
          <span class="points-badge">+${POINTS_PER_MISSION} pts</span>
        </div>
        <button class="btn ${done ? "" : "btn--primary"} btn--sm btn--block">${done ? "✅ ทำสำเร็จแล้ว" : "ทำภารกิจ"}</button>
      `;
      el.querySelector("button").addEventListener("click", () => navigate("submit", { missionId: m.id }));
      grid.appendChild(el);
    });
  } 


async function loadMissionsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("missions")
    .select("id, title, description, points")
    .order("id");

  if (error) {
    console.error("โหลดภารกิจจาก Supabase ไม่สำเร็จ:", error);
    showToast("⚠️ โหลดภารกิจจาก Supabase ไม่ได้ — ใช้ภารกิจสำรองชั่วคราว (ส่งภารกิจจะไม่ผ่าน)");
    return;
  }

  if (!data || data.length === 0) {
    console.warn("ตาราง missions ใน Supabase ยังไม่มีข้อมูล (0 แถว) — ตรวจสอบว่าใส่ข้อมูล/เปิด RLS SELECT ให้อ่านได้หรือยัง");
    showToast("⚠️ ยังไม่พบภารกิจในฐานข้อมูล Supabase — ใช้ภารกิจสำรองชั่วคราว");
    return;
  }

  console.log("โหลดภารกิจจาก Supabase สำเร็จ:", data);

  MISSIONS = data.map((mission, index) => ({
    id: mission.id,
    icon: ["🗑️", "🧴", "🧃", "💡", "🧹", "📄", "🚿", "🔌"][index] || "🌱",
    name: mission.title,
    desc: mission.description,
    diff: "ง่าย"
  }));

  // รีเฟรชหน้าที่กำลังเปิดอยู่ตอนนี้ ให้ใช้ภารกิจชุดจริงจาก Supabase ทันที
  const activePage = document.querySelector(".page.active")?.dataset.page;
  if (activePage === "mission") renderMissions();
  if (activePage === "dashboard") renderDashboard();
}

  /* ---------------- Submit mission ---------------- */
  function renderSubmit(missionId) {
    const mission = MISSIONS.find(m => m.id === missionId) || MISSIONS[0];
    submitCtx.missionId = mission.id;
    submitCtx.beforeData = null;
    submitCtx.afterData = null;

    $("#submitTitle").textContent = "ส่งภารกิจ: " + mission.name;
    $("#submitDesc").textContent = mission.desc;
    $("#missionDesc").value = "";

    const beforeInput = $("#beforeImg");
    const afterInput = $("#afterImg");
    beforeInput.value = "";
    afterInput.value = "";
    $("#beforePreview").innerHTML = `<span class="preview__placeholder">ยังไม่มีรูป</span>`;
    $("#afterPreview").innerHTML = `<span class="preview__placeholder">ยังไม่มีรูป</span>`;
  }

  function handleImagePreview(inputEl, previewEl, key) {
    inputEl.addEventListener("change", () => {
      const file = inputEl.files && inputEl.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        submitCtx[key] = e.target.result;
        previewEl.innerHTML = `<img src="${e.target.result}" alt="ตัวอย่างรูปภาพ">`;
      };
      reader.readAsDataURL(file);
    });
  }
  handleImagePreview($("#beforeImg"), $("#beforePreview"), "beforeData");
  handleImagePreview($("#afterImg"), $("#afterPreview"), "afterData");

  $("#submitForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!submitCtx.missionId) {
    alert("กรุณาเลือกภารกิจก่อนส่ง");
    return;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();

  if (!sessionData.session) {
    alert("ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบก่อนส่งภารกิจ");
    const loginScreen = document.getElementById("loginScreen");
    if (loginScreen) loginScreen.style.display = "";
    return;
  }

  const userId = sessionData.session.user.id;

  const description =
  $("#missionDesc")?.value?.trim() || "";

  const { data, error } = await supabaseClient
    .from("submissions")
    .insert({
      user_id: userId,
      mission_id: submitCtx.missionId,
      before_image: submitCtx.beforeData || "",
      after_image: submitCtx.afterData || "",
      description: description,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("ส่งภารกิจไม่สำเร็จ:", error);
    alert("ส่งภารกิจไม่สำเร็จ กรุณาลองใหม่");
    return;
  }

  console.log("ส่งภารกิจเข้า Supabase สำเร็จ:", data);

  alert("ส่งภารกิจเรียบร้อยแล้ว! 🌱 รอการตรวจสอบจากผู้ดูแล");

  closeModal("submitModal");
});

  function completeMission(missionId) {
    const mission = MISSIONS.find(m => m.id === missionId);
    if (!mission) return;

    const prevLevel = getLevel(state.points);
    const alreadyDone = state.completedMissionIds.includes(missionId);

    state.points += POINTS_PER_MISSION;
    if (!alreadyDone) {
      state.completedMissionIds.push(missionId);
      state.missionsCompleted += 1;
    }
    saveState();
    updateTopPoints();

    $("#missionSuccessPoints").textContent = `+${POINTS_PER_MISSION} คะแนน — ${mission.name}`;
    openModal("missionSuccessPopup");
    document.getElementById("missionSuccessPopup").classList.add("show");

    const newLevel = getLevel(state.points);

    const closeSuccess = () => {
      document.getElementById("missionSuccessPopup").classList.remove("show");
      if (newLevel > prevLevel) {
        showLevelUp(newLevel);
      } else {
        navigate("mission");
      }
      $("#missionSuccessPopup").querySelectorAll("[data-close]").forEach(b => b.removeEventListener("click", closeSuccess));
    };
    $("#missionSuccessPopup").querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeSuccess, { once: true }));
  }

  function showLevelUp(newLevel) {
    $("#levelUpNumber").textContent = newLevel;
    const reward = REWARDS.find(r => r.level === newLevel);
    $("#levelUpReward").innerHTML = reward
      ? `${reward.icon} ปลดล็อกแล้ว: ${reward.title}`
      : "";
    const popup = $("#levelUpPopup");
    popup.classList.add("show");
    popup.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", function handler() {
      popup.classList.remove("show");
      navigate("mission");
      b.removeEventListener("click", handler);
    }, { once: true }));
  }

  /* ---------------- Rewards ---------------- */
  function renderRewards() {
    const grid = $("#rewardGrid");
    grid.innerHTML = "";
    const lvl = getLevel(state.points);
    REWARDS.forEach(r => {
      const unlocked = r.level <= lvl;
      const el = document.createElement("div");
      el.className = "reward-card" + (unlocked ? "" : " locked");
      el.innerHTML = `
        <span class="reward-card__icon">${r.icon}</span>
        <div class="reward-card__level">Level ${r.level}</div>
        <div class="reward-card__title">${r.title}</div>
        <div class="reward-card__status ${unlocked ? "unlocked" : "locked"}">${unlocked ? "✅ ปลดล็อกแล้ว" : "🔒 ยังไม่ปลดล็อก"}</div>
      `;
      grid.appendChild(el);
    });
  }

  /* ---------------- Profile ---------------- */
  function renderProfile() {
    // --- ข้อมูลจริงจาก Supabase (profiles table) ---
    if (currentProfile) {
      if (currentProfile.full_name) {
        $("#profileName").textContent = currentProfile.full_name;
      }
      if (currentProfile.class_name) {
        $("#profileClass").textContent = "ชั้น " + currentProfile.class_name;
      }
      const studentCodeEl = $("#profileStudentCode");
      if (studentCodeEl && currentProfile.student_code) {
        studentCodeEl.textContent = "รหัสนักเรียน: " + currentProfile.student_code;
      }
    }

    // --- คะแนน: ใช้ profiles.points จาก Supabase เป็นหลัก (ไม่ใช่คะแนน Demo เดิม) ---
    $("#profilePoints").textContent = getDisplayPoints();
    // --- Progress Level จากคะแนนจริง ---
const displayPoints = getDisplayPoints();
const currentLevel = getLevel(displayPoints);
const progressInLevel = getProgressInLevel(displayPoints);

$("#profileLevel").textContent = currentLevel;
$("#profileCurrentLevel").textContent = currentLevel;
$("#profileProgressLabel").textContent = `${progressInLevel}/${POINTS_PER_LEVEL}`;

const progressPercent =
  (progressInLevel / POINTS_PER_LEVEL) * 100;

$("#profileProgressFill").style.width = `${progressPercent}%`;

const pointsToNextLevel =
  POINTS_PER_LEVEL - progressInLevel;

$("#profileNextLevelPoints").textContent =
  pointsToNextLevel === POINTS_PER_LEVEL
    ? POINTS_PER_LEVEL
    : pointsToNextLevel;

    // --- Level / Rewards: ยังคงใช้ระบบเดิมตาม state.points (นอก scope งานนี้) ---
    $("#profileMissionCount").textContent = state.missionsCompleted;
    const unlocked = getUnlockedRewards();
    $("#profileRewardCount").textContent = unlocked.length;

    // --- Avatar: ซิงก์มาจาก Supabase ใน loadProfileFromSupabase() แล้ว (เข้า state.avatar) ---
    $("#profileAvatar").textContent = state.avatar === "female" ? "👧" : "🧑";

    $("#avatarMaleBtn").classList.toggle("selected", state.avatar === "male");
    $("#avatarFemaleBtn").classList.toggle("selected", state.avatar === "female");

    const list = $("#profileRewardList");
    list.innerHTML = "";
    if (!unlocked.length) {
      list.innerHTML = `<span class="muted">ยังไม่มีรางวัลที่ปลดล็อก — เริ่มทำภารกิจกันเลย!</span>`;
    } else {
      unlocked.forEach(r => {
        const chip = document.createElement("span");
        chip.className = "profile-reward-chip";
        chip.textContent = `${r.icon} ${r.title}`;
        list.appendChild(chip);
      });
    }
  }

  $("#avatarMaleBtn").addEventListener("click", () => setAvatar("male"));
  $("#avatarFemaleBtn").addEventListener("click", () => setAvatar("female"));
  function setAvatar(type) {
    state.avatar = type;
    saveState();
    renderProfile();
    showToast("เปลี่ยน Avatar เรียบร้อยแล้ว 🧑‍🎓");
  }

  /* ---------------- Marketplace ---------------- */
  function renderMarketplace() {
    const grid = $("#marketGrid");
    grid.innerHTML = "";
    PRODUCTS.forEach(p => {
      const el = document.createElement("div");
      el.className = "product-card";
      el.innerHTML = `
        <div class="product-card__img">${p.icon}</div>
        <div class="product-card__body">
          <h3>${p.name}</h3>
          <span class="product-card__price">${p.price.toLocaleString("th-TH")} บาท</span>
          <button class="btn btn--outline btn--sm btn--block">ดูรายละเอียด</button>
        </div>
      `;
      el.querySelector("button").addEventListener("click", () => openProductModal(p));
      grid.appendChild(el);
    });
  }

  function openProductModal(p) {
    $("#productModalImg").textContent = p.icon;
    $("#productModalName").textContent = p.name;
    $("#productModalDesc").textContent = p.desc;
    $("#productModalPrice").textContent = p.price.toLocaleString("th-TH") + " บาท";
    openModal("productModal");
  }

  /* ---------------- Impact dashboard ---------------- */
  let impactAnimated = false;
  
async function renderImpact() {
  const studentEl = $("#impactStudentCount");
  const missionEl = $("#impactMissionCount");
  const chart = $("#impactBarChart");

  // แสดงสถานะระหว่างโหลด
  studentEl.textContent = "…";
  missionEl.textContent = "…";
  chart.textContent = "กำลังเตรียมข้อมูล...";

  // ดึงข้อมูลสรุปจาก Supabase
  const { data, error } = await supabaseClient
    .rpc("get_impact_summary");

  if (error) {
    console.error("โหลด Impact Dashboard ไม่สำเร็จ:", error);

    studentEl.textContent = "—";
    missionEl.textContent = "—";
    chart.textContent = "ไม่สามารถโหลดข้อมูลได้";

    return;
  }

  if (!data || data.length === 0) {
    studentEl.textContent = "0";
    missionEl.textContent = "0";
    chart.textContent = "ยังไม่มีข้อมูล";
    return;
  }

  const summary = data[0];

  // แสดงข้อมูลจริง
  studentEl.textContent =
    Number(summary.student_count).toLocaleString("th-TH");

  missionEl.textContent =
    Number(summary.approved_mission_count).toLocaleString("th-TH");

  // กราฟรอข้อมูลหมวดหมู่จริง
  chart.textContent =
    "กราฟจะพร้อมเมื่อระบบจัดหมวดหมู่ภารกิจเรียบร้อย 🌱";
}

  function animateCount(el, target) {
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(progress * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


async function handleLogin() {
  const fullName = document.getElementById("loginFullName").value.trim();
  const className = document.getElementById("loginClass").value.trim();
  const studentCode = document.getElementById("loginStudentCode").value.trim();

  if (!fullName || !className || !studentCode) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  const { data: authData, error: authError } =
    await supabaseClient.auth.signInAnonymously();

  if (authError) {
    console.error("Anonymous Auth Error:", authError);
    alert("ไม่สามารถเข้าสู่ระบบได้");
    return;
  }

  const userId = authData.user.id;

  const { error: profileError } =
    await supabaseClient
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        class_name: className,
        student_code: studentCode
      });

  if (profileError) {
    console.error("Profile Error:", profileError);
    alert("บันทึกข้อมูลไม่สำเร็จ");
    return;
  }

  localStorage.setItem("ecosteps_logged_in", "true");
  localStorage.setItem("ecosteps_user_id", userId);

  const loginScreen = document.getElementById("loginScreen");
  if (loginScreen) {
    loginScreen.style.display = "none";
  } else {
    console.error("ไม่พบ element id='loginScreen' ใน HTML — ตรวจสอบว่า id ตรงกันหรือไม่");
  }

  // สำคัญ: บอกระบบ navigate() ว่า "เข้าระบบแล้ว" ไม่งั้นปุ่มเมนูอื่น ๆ
  // จะเด้ง popup Try Demo เก่าขึ้นมาแทนที่จะพาไปหน้าที่ต้องการ
  state.demoStarted = true;
  saveState();

  await loadProfileFromSupabase(); // โหลด profile จริง (รวม points) ก่อนพาเข้าแอป

  console.log("เข้าสู่ระบบสำเร็จ:", userId);

  // พาเข้าหน้า Dashboard ทันทีหลังล็อกอินสำเร็จ
  navigate("dashboard");
}

document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin();
});

/* ---------------- Init ---------------- */

async function init() {
  updateTopPoints();
  renderHeroTrail();

  navBtns.forEach(b =>
    b.classList.toggle("active", b.dataset.nav === "home")
  );

  window.addEventListener("resize", renderHeroTrail);

  // โหลดภารกิจจริงจาก Supabase ให้เสร็จก่อน แล้วค่อยพาไปหน้าไหนก็ตาม
  // (เดิมสลับลำดับ ทำให้บางทีหน้า Mission ที่เห็นเป็นชุด hardcode เก่า ไม่ใช่ของจริงจาก Supabase)
  await loadMissionsFromSupabase();

  // เช็ค session จริงจาก Supabase แทนการเชื่อ flag ใน localStorage เฉย ๆ
  // (flag อาจค้างจากการทดสอบครั้งก่อน ทั้งที่ session จริงหมดอายุ/ไม่มีแล้ว
  // ถ้าเชื่อ flag เพียวๆ จะข้ามหน้า login ทั้งที่ไม่มี user จริงผูกอยู่ ทำให้ส่งภารกิจไม่ได้)
  const { data: sessionCheck } = await supabaseClient.auth.getSession();
  const hasValidSession = !!(sessionCheck && sessionCheck.session);

  const loginScreen = document.getElementById("loginScreen");

  if (hasValidSession) {
    if (loginScreen) loginScreen.style.display = "none";
    state.demoStarted = true;
    saveState();

    await ensureProfile();
    await loadProfileFromSupabase(); // โหลดคะแนน/ข้อมูลจริงจาก Supabase ก่อนพาเข้า Dashboard
    navigate("dashboard");
  } else {
    // ไม่มี session จริง -> ล้าง flag เก่าทิ้ง แล้วโชว์หน้า login ให้กรอกใหม่
    localStorage.removeItem("ecosteps_logged_in");
    localStorage.removeItem("ecosteps_user_id");
    if (loginScreen) loginScreen.style.display = ""; // เผื่อเคยถูกสั่งซ่อนไว้ ให้กลับมาโชว์ตามค่าเริ่มต้น
    renderAndGo("home");
  }
}

init();

})(); // <-- ปิด IIFE ที่เปิดไว้บรรทัดบนสุด (นี่คือจุดที่ขาดหายไปและทำให้ทั้งไฟล์พังก่อนหน้านี้)