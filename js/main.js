/* ============================================================
   雷特娛樂官網 main.js — 邏輯檔(依檔內順序)
   開場 Intro → 游標 → 語言切換 applyLang → 捲動進度/回頂/藍色底圖 aboutCurtain
   → Reveal 進場 → 案例大圖/縮圖瀏覽器 → 首屏輪播 → 廠牌牆/名單 openRoster
   → KOL 資訊卡 openK(SOC 社群 icon 定義)→ 人像流 FLOW_COUNTS+renderFlows
   → 表單 → 行動選單 → Init
   ============================================================ */

const LANGUAGE_STORAGE_KEY = "rayter-site-language";
let currentLang = (()=>{
  const requested = new URLSearchParams(location.search).get("lang");
  if(requested === "en" || requested === "zh") return requested;
  try{
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if(saved === "en" || saved === "zh") return saved;
  }catch(e){}
  return "zh";
})();
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

/* ================= Intro ================= */
const intro = document.getElementById("intro");
const INTRO_SEEN_KEY = "rayter-tech-intro-v2";
let introEndTimer = null;
let introExitTimer = null;

function endIntro(remember){
  if(intro.classList.contains("done")) return;
  intro.classList.add("done");
  document.body.classList.remove("intro-lock", "intro-exiting");
  if(remember !== false){
    try{ sessionStorage.setItem(INTRO_SEEN_KEY, "1"); }catch(e){}
  }
  clearTimeout(introEndTimer);
  clearTimeout(introExitTimer);
  document.querySelector(".intro-logo-flight")?.remove();
  setTimeout(()=>intro.remove(), 120);
}

function flyLogoToHeader(){
  const source = intro.querySelector(".intro-logo-host, .intro-static-logo");
  const target = document.querySelector(".brand img");
  if(!source || !target || !Element.prototype.animate) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if(!from.width || !to.width) return;

  const flight = source.cloneNode(true);
  flight.classList.add("intro-logo-flight");
  flight.removeAttribute("aria-hidden");
  Object.assign(flight.style, {
    position:"fixed", left:from.left+"px", top:from.top+"px",
    width:from.width+"px", height:from.height+"px", margin:"0",
    zIndex:"240", pointerEvents:"none", transformOrigin:"center center"
  });
  document.body.appendChild(flight);
  source.style.opacity = "0";

  const dx = to.left + to.width/2 - (from.left + from.width/2);
  const dy = to.top + to.height/2 - (from.top + from.height/2);
  const scale = Math.max(.08, to.width/from.width);
  flight.animate([
    {opacity:1,transform:"translate3d(0,0,0) scale(1) skewX(0)",filter:"blur(0) drop-shadow(0 12px 22px rgba(42,113,148,.12))"},
    {opacity:1,transform:`translate3d(${dx*.18}px,${dy*.18-8}px,0) scale(.86) skewX(-4deg)`,filter:"blur(0) drop-shadow(18px 8px 16px rgba(42,113,148,.16))",offset:.34},
    {opacity:.92,transform:`translate3d(${dx*.72}px,${dy*.72}px,0) scale(${Math.max(scale*1.7,.34)}) skewX(-2deg)`,filter:"blur(.45px) drop-shadow(10px 5px 10px rgba(42,113,148,.12))",offset:.76},
    {opacity:.04,transform:`translate3d(${dx}px,${dy}px,0) scale(${scale}) skewX(0)`,filter:"blur(0) drop-shadow(0 0 0 transparent)"}
  ],{duration:860,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"});
}

function startIntroExit(remember, skipped){
  if(intro.classList.contains("is-exiting") || intro.classList.contains("done")) return;
  clearTimeout(introEndTimer);
  if(skipped && intro.getAnimations){
    intro.getAnimations({subtree:true}).forEach(animation=>{
      try{ animation.finish(); }catch(e){}
    });
  }
  if(remember !== false){
    try{ sessionStorage.setItem(INTRO_SEEN_KEY, "1"); }catch(e){}
  }
  flyLogoToHeader();
  document.body.classList.add("intro-exiting");
  intro.classList.add("is-exiting");
  intro.setAttribute("aria-hidden", "true");
  introExitTimer = setTimeout(()=>endIntro(false), 1040);
}

function buildTechIntro(){
  const logoMarkup = window.RAYTER_LOGO_SVG;
  if(!logoMarkup){
    intro.innerHTML = `<img class="intro-static-logo" src="assets/rayter-logo.svg" alt="${currentLang === "en" ? "Rayter Digital Entertainment" : "雷特娛樂 Rayter Entertainment"}">`;
    introEndTimer = setTimeout(()=>startIntroExit(true, false), 1700);
    return;
  }

  intro.setAttribute("aria-label", currentLang === "en" ? "Rayter Entertainment intro animation; click to skip" : "雷特娛樂開場動畫，點擊可略過");
  intro.innerHTML = `
    <div class="intro-tech-grid" aria-hidden="true"></div>
    <div class="intro-exit-band intro-exit-band-blue" aria-hidden="true"><span>RAYTER / ENTER</span></div>
    <div class="intro-exit-band intro-exit-band-yellow" aria-hidden="true"></div>
    <div class="intro-orbit intro-orbit-a" aria-hidden="true"></div>
    <div class="intro-orbit intro-orbit-b" aria-hidden="true"></div>
    <div class="intro-kinetic-wash" aria-hidden="true"></div>
    <div class="intro-speed-field" aria-hidden="true">${"<i></i>".repeat(10)}</div>
    <div class="intro-edge intro-edge-a" aria-hidden="true"></div>
    <div class="intro-edge intro-edge-b" aria-hidden="true"></div>
    <div class="intro-stage">
      <span class="intro-corner intro-corner-tl" aria-hidden="true"></span>
      <span class="intro-corner intro-corner-tr" aria-hidden="true"></span>
      <span class="intro-corner intro-corner-bl" aria-hidden="true"></span>
      <span class="intro-corner intro-corner-br" aria-hidden="true"></span>
      <div class="intro-velocity intro-velocity-a" aria-hidden="true"></div>
      <div class="intro-velocity intro-velocity-b" aria-hidden="true"></div>
      <div class="intro-scan" aria-hidden="true"></div>
      <div class="intro-impact" aria-hidden="true"></div>
      <div class="intro-logo-echo intro-logo-echo-left" aria-hidden="true">${logoMarkup}</div>
      <div class="intro-logo-echo intro-logo-echo-right" aria-hidden="true">${logoMarkup}</div>
      <div class="intro-logo-host">${logoMarkup}</div>
    </div>
    <div class="intro-progress" aria-hidden="true"><i></i></div>
    <button class="intro-skip" type="button" aria-label="${currentLang === "en" ? "Skip intro animation" : "略過開場動畫"}">SKIP</button>`;

  intro.classList.add("tech-intro", "is-running");
  const svg = intro.querySelector(".intro-logo-host svg");
  if(!svg || !Element.prototype.animate){
    intro.classList.add("intro-static");
    introEndTimer = setTimeout(()=>startIntroExit(true, false), 1800);
    return;
  }

  intro.querySelectorAll("svg").forEach(el=>el.classList.add("intro-logo-svg"));
  const titlePaths = [], yellowPaths = [], subtitlePaths = [];
  svg.querySelectorAll("path").forEach(path=>{
    path.style.transformBox = "fill-box";
    path.style.transformOrigin = "center";
    path.style.willChange = "transform, opacity, filter";
    const fill = path.getAttribute("fill") || "";
    const box = path.getBBox();
    if(fill.includes("91.372681")) yellowPaths.push(path);
    else if(box.y >= 162) subtitlePaths.push(path);
    else titlePaths.push(path);
  });

  const byX = (a,b)=>a.getBBox().x-b.getBBox().x;
  titlePaths.sort(byX); yellowPaths.sort(byX); subtitlePaths.sort(byX);
  const yOffsets = [-9,7,-5,10,-7,6];
  const rotations = [-2.8,1.8,-1.4,2.2,-1.8,1.2];

  titlePaths.forEach((path,index)=>{
    const box = path.getBBox();
    const direction = box.x + box.width/2 < 142 ? -1 : 1;
    const x = direction * (138 + index%3*32);
    path.animate([
      {opacity:0,transform:`translate(${x}px,${yOffsets[index%yOffsets.length]}px) skewX(${direction*-15}deg) rotate(${rotations[index%rotations.length]}deg) scaleX(1.22)`,filter:"blur(13px) brightness(1.35)"},
      {opacity:.72,transform:`translate(${direction*9}px,0) skewX(${direction*-3}deg) rotate(0) scaleX(1.03)`,filter:"blur(1.5px) brightness(1.08)",offset:.78},
      {opacity:1,transform:"translate(0,0) skewX(0) rotate(0) scaleX(1)",filter:"blur(0) brightness(1)"}
    ],{duration:450,delay:220+index*42,easing:"cubic-bezier(.08,.82,.2,1)",fill:"both"});
  });

  yellowPaths.forEach((path,index)=>{
    const fromX = index===2 ? 82 : index===0 ? -74 : 58;
    path.animate([
      {opacity:0,transform:`translate(${fromX}px,-8px) skewX(-16deg) rotate(${index%2?12:-12}deg) scale(.2)`,filter:"blur(7px) brightness(2.6) drop-shadow(0 0 10px rgba(218,212,32,.55))"},
      {opacity:1,transform:"translate(0,0) rotate(0) scale(1.08)",filter:"blur(0) brightness(1.55) drop-shadow(0 0 8px rgba(218,212,32,.5))",offset:.76},
      {opacity:1,transform:"translate(0,0) rotate(0) scale(1)",filter:"blur(0) brightness(1)"}
    ],{duration:360,delay:760+index*92,easing:"cubic-bezier(.08,1.24,.2,1)",fill:"both"});
  });

  subtitlePaths.forEach((path,index)=>{
    path.animate([
      {opacity:0,transform:"translate(-34px,2px) skewX(-19deg) scaleX(1.1)",filter:"blur(5px)"},
      {opacity:1,transform:"translate(0,0) skewX(0) scaleX(1)",filter:"blur(0)"}
    ],{duration:280,delay:1040+index*21,easing:"cubic-bezier(.08,.82,.2,1)",fill:"both"});
  });

  introEndTimer = setTimeout(()=>startIntroExit(true, false), 2280);
}

let introSeen = false;
try{ introSeen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1"; }catch(e){}
if(reduced || introSeen) endIntro(false);
else{
  buildTechIntro();
  intro.addEventListener("click", ()=>startIntroExit(true, true));
}

/* ================= Cursor ================= */
const cDot=document.getElementById("cDot"), cRing=document.getElementById("cRing");
if(finePointer && !reduced){
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;
    cDot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  (function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;
    cRing.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);})();
  const hoverSel="a,button,.vcard,.p-card,.kol-card,.flow-card,.case-tile,input,textarea";
  document.addEventListener("mouseover",e=>{if(e.target.closest(hoverSel))document.body.classList.add("cursor-hover")});
  document.addEventListener("mouseout",e=>{if(e.target.closest(hoverSel))document.body.classList.remove("cursor-hover")});
}else{cDot.remove();cRing.remove();}

/* ================= i18n ================= */
const CASE_ALT_EN = {
  "assets/media/cases/pc-1.webp":"PC game livestream arena campaign",
  "assets/media/cases/pc-2.webp":"VALORANT ranked challenge campaign",
  "assets/media/cases/pc-3.webp":"PUBG Hot Drop mode creator campaign",
  "assets/media/cases/pc-4.webp":"MapleStory creator campaign",
  "assets/media/cases/mobile-1.webp":"Capybara Go creator campaign",
  "assets/media/cases/mobile-2.webp":"Mobile game creator campaign 2",
  "assets/media/cases/mobile-3.webp":"Mobile game creator campaign 3",
  "assets/media/cases/mobile-4.webp":"Mobile RPG creator campaign",
  "assets/media/cases/console-1.webp":"Nioh 3 creator campaign",
  "assets/media/cases/console-2.webp":"Black Myth: Wukong creator campaign",
  "assets/media/cases/console-3.webp":"FANTASY LIFE i Nintendo Switch 2 Edition creator campaign",
  "assets/media/cases/console-4.webp":"Inazuma Eleven: Victory Road creator campaign",
  "assets/media/cases/offline-1.webp":"Offline event activation",
  "assets/media/cases/offline-2.webp":"Creator meet-and-greet activation"
};
function brandName(brand){
  return currentLang === "en" ? (brand.en || "Talent Partner") : brand.zh;
}
function kolName(kol){
  return currentLang === "en" ? (kol.nEn || "Creator") : kol.n;
}
function kolIntro(kol){
  return currentLang === "en" ? (kol.introEn || "") : (kol.intro || "");
}
function kolTags(kol){
  return currentLang === "en" ? (kol.tagsEn || []) : (kol.tags || []);
}
function setLocalizedAttribute(selector,attribute,zh,en){
  document.querySelectorAll(selector).forEach(el=>el.setAttribute(attribute,currentLang === "en" ? en : zh));
}
function updateCaseLanguage(){
  document.querySelectorAll(".case-thumb[data-src]").forEach(thumb=>{
    if(!thumb.dataset.altZh) thumb.dataset.altZh = thumb.dataset.alt || "合作案例";
    const alt = currentLang === "en"
      ? (CASE_ALT_EN[thumb.dataset.src] || "Case study")
      : thumb.dataset.altZh;
    thumb.dataset.alt = alt;
    thumb.setAttribute("aria-label",alt);
  });
  document.querySelectorAll("[data-case-browser]").forEach(browser=>{
    const active = browser.querySelector(".case-thumb.active") || browser.querySelector(".case-thumb");
    const image = browser.querySelector("[data-case-main]");
    if(active && image) image.alt = active.dataset.alt || (currentLang === "en" ? "Case study" : "合作案例");
  });
  document.querySelectorAll(".case-thumbs").forEach(tablist=>{
    const title = tablist.closest(".mbar")?.querySelector(".mb-title")?.textContent.trim() || "";
    tablist.setAttribute("aria-label",title + (currentLang === "en" ? " case studies" : " 案例"));
  });
}
function updateInterfaceLanguage(){
  document.title = currentLang === "en"
    ? "Rayter Digital Entertainment | Gaming & Creator Partnerships"
    : "雷特娛樂 Rayter Entertainment";
  const description = document.querySelector('meta[name="description"]');
  if(description) description.content = currentLang === "en"
    ? "Rayter Digital Entertainment connects brands with gaming creators through talent matching, content production, integrated campaigns and live activations."
    : "雷特數位娛樂深耕遊戲、直播與 KOL 行銷領域,專注於商業合作、遊戲行銷企劃、內容整合與專案執行。";
  setLocalizedAttribute(".site-header .brand","aria-label","雷特娛樂，回到頁首","Rayter Entertainment, back to top");
  setLocalizedAttribute(".site-header .brand img, .footer-brand img","alt","雷特娛樂 Rayter Entertainment","Rayter Digital Entertainment");
  setLocalizedAttribute(".main-nav","aria-label","主選單","Main navigation");
  setLocalizedAttribute(".m-menu nav","aria-label","行動選單","Mobile navigation");
  setLocalizedAttribute(".lang-seg","aria-label","語言切換","Language selector");
  const menuButton = document.getElementById("menuBtn");
  if(menuButton){
    const menuOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-label",currentLang === "en"
      ? (menuOpen ? "Close menu" : "Open menu")
      : (menuOpen ? "關閉選單" : "開啟選單"));
  }
  setLocalizedAttribute("#carousel","aria-label","輪播 Banner","Featured work carousel");
  setLocalizedAttribute("#prevSlide","aria-label","上一張","Previous slide");
  setLocalizedAttribute("#nextSlide","aria-label","下一張","Next slide");
  setLocalizedAttribute("#dots","aria-label","輪播頁籤","Carousel navigation");
  setLocalizedAttribute("#captchaCode","aria-label","驗證碼","Captcha code");
  setLocalizedAttribute("#captchaRefresh","aria-label","更換驗證碼","Generate a new captcha");
  setLocalizedAttribute("#captchaRefresh","title","更換驗證碼","Generate a new captcha");
  setLocalizedAttribute("#toTop","aria-label","回到頂端","Back to top");
  setLocalizedAttribute(".footer-brand","aria-label","回到頂端","Back to top");
  setLocalizedAttribute(".km-card","aria-label","KOL 資訊","Creator profile");
  setLocalizedAttribute(".km-close","aria-label","關閉","Close");
  setLocalizedAttribute('.km-nav[data-knav="-1"]',"aria-label","上一位","Previous creator");
  setLocalizedAttribute('.km-nav[data-knav="1"]',"aria-label","下一位","Next creator");
  setLocalizedAttribute(".hero .slide:first-child img","alt","雷特娛樂 KOL 陣容","Rayter creator network");
  setLocalizedAttribute(".production-videos","aria-label","內容製作影片案例","Content production video showcases");
  updateProductionLanguage();
  document.querySelectorAll(".lang-seg .ls").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===currentLang ? "true" : "false"));
  document.querySelectorAll("#dots button").forEach((dot,index)=>{
    dot.setAttribute("aria-label",currentLang === "en"
      ? `Slide ${index+1} of ${slides.length}`
      : `第 ${index+1} 張，共 ${slides.length} 張`);
  });
  updateCaseLanguage();
  const formMessage = document.getElementById("formMsg");
  if(formMessage?.dataset.messageKey) setFormMessage(formMessage.dataset.messageKey);
}

/* ================= Content production playlists ================= */
const productionFrames = [...document.querySelectorAll("[data-production-frame]")];
const localFilePreview = location.protocol === "file:";
function productionTitle(frame){
  return frame.dataset[currentLang === "en" ? "titleEn" : "titleZh"] || "YouTube playlist";
}
function updateProductionLanguage(){
  productionFrames.forEach(frame=>{
    const title = productionTitle(frame);
    const launch = frame.querySelector(".production-launch");
    const player = frame.querySelector("iframe");
    if(launch){
      launch.setAttribute("aria-label",currentLang === "en"
        ? `${localFilePreview ? "Open" : "Play"} ${title}`
        : `${localFilePreview ? "開啟" : "播放"}${title}`);
    }
    if(player) player.title = title;
  });
}
function launchProductionPlaylist(frame){
  const playlistUrl = frame.dataset.playlistUrl;
  if(localFilePreview){
    window.open(playlistUrl,"_blank","noopener");
    return;
  }
  const playlist = frame.dataset.playlist;
  if(!playlist || frame.classList.contains("is-playing")) return;
  const params = new URLSearchParams({
    listType:"playlist", list:playlist, playsinline:"1", rel:"0", autoplay:"1"
  });
  if(location.origin && location.origin !== "null") params.set("origin",location.origin);
  const player = document.createElement("iframe");
  player.src = `https://www.youtube.com/embed?${params.toString()}`;
  player.title = productionTitle(frame);
  player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  player.referrerPolicy = "strict-origin-when-cross-origin";
  player.allowFullscreen = true;
  frame.classList.add("is-playing");
  frame.replaceChildren(player);
}
function setupProductionPlayers(){
  document.documentElement.classList.toggle("local-file-preview",localFilePreview);
  productionFrames.forEach(frame=>{
    frame.querySelector(".production-launch")?.addEventListener("click",()=>launchProductionPlaylist(frame));
  });
  updateProductionLanguage();
}
function applyLang(lang,persist){
  currentLang = lang === "en" ? "en" : "zh";
  document.documentElement.lang = currentLang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-zh]").forEach(el=>{
    const t = el.getAttribute("data-"+currentLang);
    if(t !== null && !el.querySelector("a")) el.textContent = t;
  });
  document.querySelectorAll(".lang-seg .ls").forEach(function(b){ b.classList.toggle("on", b.dataset.lang===currentLang); });
  updateInterfaceLanguage();
  renderBrands();
  renderFlows();
  if(!document.getElementById("brandRoster").hidden && activeBrand) openRoster(activeBrand, true);
  if(kmState && !kModal.hidden){
    const selector = `[data-kb="${kmState.b}"][data-ki="${kmState.i}"]`;
    const roster = document.getElementById("brandRoster");
    kmOriginCard = (!roster.hidden ? roster.querySelector(selector) : null) || document.querySelector(selector);
    openK(kmState.b,kmState.i,kmOriginCard);
  }
  if(persist){
    try{ localStorage.setItem(LANGUAGE_STORAGE_KEY,currentLang); }catch(e){}
    try{
      const url = new URL(location.href);
      url.searchParams.set("lang",currentLang);
      history.replaceState(null,"",url.pathname+url.search+url.hash);
    }catch(e){}
  }
}
document.querySelectorAll(".lang-seg .ls").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang,true)));

/* ================= One-page nav + scroll spy ================= */
const SECTIONS = ["about","service","artist","contact"];
const desktopStage = document.getElementById("desktopStage");
const stageSectionNo = desktopStage?.querySelector("[data-stage-no]");
const stageSectionName = desktopStage?.querySelector("[data-stage-name]");
const STAGE_SECTIONS = {
  about:["01","ABOUT"],service:["02","SERVICES"],artist:["03","CREATORS"],contact:["04","CONTACT"]
};
function setDesktopStageSection(id){
  if(!desktopStage || !STAGE_SECTIONS[id]) return;
  desktopStage.dataset.section = id;
  if(stageSectionNo) stageSectionNo.textContent = STAGE_SECTIONS[id][0];
  if(stageSectionName) stageSectionName.textContent = STAGE_SECTIONS[id][1];
}
const menuBtn = document.getElementById("menuBtn");
const mMenu = document.getElementById("mMenu");
function updateMenuButtonLabel(){
  const open = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-label",currentLang === "en"
    ? (open ? "Close menu" : "Open menu")
    : (open ? "關閉選單" : "開啟選單"));
}
function closeMenu(){
  mMenu.classList.remove("open");
  menuBtn.setAttribute("aria-expanded","false");
  updateMenuButtonLabel();
}
menuBtn.addEventListener("click",()=>{
  const open = mMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  updateMenuButtonLabel();
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeMenu(); });
document.querySelectorAll(".nav-btn[data-target]").forEach(b=>{
  b.addEventListener("click",()=>{
    closeMenu();
    document.getElementById(b.dataset.target).scrollIntoView({behavior:reduced?"auto":"smooth"});
    const url = new URL(location.href);
    url.hash = b.dataset.target;
    history.replaceState(null,"",url.pathname+url.search+url.hash);
  });
});
const spy = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll(".nav-btn[data-target]").forEach(b=>
        b.classList.toggle("active", b.dataset.target===e.target.id));
      setDesktopStageSection(e.target.id);
    }
  });
},{rootMargin:"-38% 0px -55% 0px"});
SECTIONS.forEach(id=>spy.observe(document.getElementById(id)));

/* ================= Scroll progress ================= */
const sprog = document.getElementById("sprog");
const toTop = document.getElementById("toTop");
const sectionWords = [...document.querySelectorAll(".sec-word")];
const heroSection = document.querySelector(".hero");
const siteFooter = document.querySelector(".site-footer");
function sectionWordParallax(){
  if (reduced){
    sectionWords.forEach(word=>word.style.removeProperty("--word-shift"));
    return;
  }
  const vh = innerHeight;
  sectionWords.forEach(word=>{
    const section = word.closest("section");
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.bottom < -vh || rect.top > vh*2) return;
    const progress = (vh-rect.top)/(vh+rect.height);
    const shift = Math.max(-18,Math.min(18,(progress-.5)*36));
    word.style.setProperty("--word-shift",shift.toFixed(2)+"px");
  });
}
function desktopStageMotion(){
  if(!desktopStage) return;
  const vh = innerHeight;
  const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
  const footerTop = siteFooter ? siteFooter.getBoundingClientRect().top : Infinity;
  const isWide = innerWidth >= 1320;
  desktopStage.classList.toggle("is-visible",isWide && heroBottom < vh*.24 && footerTop > vh*.78);
  if(reduced || !isWide){
    desktopStage.style.removeProperty("--stage-shift");
    desktopStage.style.removeProperty("--stage-shift-rev");
    return;
  }
  const h = document.documentElement;
  const max = h.scrollHeight-vh;
  const progress = max > 0 ? h.scrollTop/max : .5;
  const shift = Math.max(-36,Math.min(36,(progress-.5)*72));
  desktopStage.style.setProperty("--stage-shift",shift.toFixed(2)+"px");
  desktopStage.style.setProperty("--stage-shift-rev",(-shift*.72).toFixed(2)+"px");
}
toTop.addEventListener("click", () => scrollTo({top:0, behavior: reduced ? "auto" : "smooth"}));
let spTick = false;
addEventListener("scroll", () => {
  if (spTick) return; spTick = true;
  requestAnimationFrame(() => {
    const h = document.documentElement;
    const max = h.scrollHeight - innerHeight;
    sprog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", h.scrollTop > 600);
    aboutCurtain();
    sectionWordParallax();
    desktopStageMotion();
    spTick = false;
  });
}, {passive:true});

/* 關於我們:藍色底圖跟隨滾動下拉 */
const aboutSec = document.getElementById("about");
const aboutBg = document.querySelector(".about-bg");
function aboutCurtain(){
  if (reduced){ aboutBg.style.transform = "none"; aboutSec.classList.add("bg-in"); return; }
  const r = aboutSec.getBoundingClientRect();
  const vh = innerHeight;
  const p = Math.min(1, Math.max(0, (vh * 0.55 - r.top) / (vh * 0.5)));
  aboutBg.style.transform = "translateY(" + ((p - 1) * 101).toFixed(2) + "%)";
  aboutSec.classList.toggle("bg-in", p > 0.6);
}
aboutCurtain();
sectionWordParallax();
desktopStageMotion();
addEventListener("resize",()=>{sectionWordParallax();desktopStageMotion();},{passive:true});

/* ================= Reveals ================= */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}
}),{threshold:.1}) : null;
function watchReveals(root){
  (root||document).querySelectorAll("[data-rev]:not(.in)").forEach(el=>{
    if (io) io.observe(el);
    else el.classList.add("in");
  });
}

/* ================= tilt / magnetic ================= */
function bindTilt(el, max){
  if(!el || !finePointer || reduced) return;
  const m = max || 7;
  el.addEventListener("pointermove",e=>{
    const r = el.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    const depth = el.classList.contains("talent-card") ? " translateZ(8px) scale(1.018)" : "";
    el.style.transform=`perspective(900px) rotateY(${(px-.5)*2*m}deg) rotateX(${(.5-py)*2*m}deg)${depth}`;
    el.style.setProperty("--mx",(px*100)+"%");
    el.style.setProperty("--my",(py*100)+"%");
  });
  el.addEventListener("pointerleave",()=>{el.style.transform="";});
}
function bindMagnetic(el){
  if(!finePointer || reduced) return;
  el.addEventListener("pointermove",e=>{
    const r = el.getBoundingClientRect();
    el.style.transform=`translate(${(e.clientX-(r.left+r.width/2))*.12}px,${(e.clientY-(r.top+r.height/2))*.16}px)`;
  });
  el.addEventListener("pointerleave",()=>{el.style.transform="";});
}
document.querySelectorAll(".magnetic").forEach(bindMagnetic);

/* ================= Placeholder art (light) ================= */
function portraitSVG(seed, accent){
  const acc = accent || "#4197C5";
  return `
  <svg viewBox="0 0 150 205" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${currentLang === "en" ? "Portrait placeholder" : "照片"}">
    <defs>
      <linearGradient id="g${seed}" x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0" stop-color="#EEF3F6"/><stop offset="1" stop-color="#DFE7EC"/>
      </linearGradient>
      <linearGradient id="r${seed}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${acc}" stop-opacity=".35"/>
        <stop offset="1" stop-color="${acc}" stop-opacity=".04"/>
      </linearGradient>
    </defs>
    <rect width="150" height="205" fill="url(#g${seed})"/>
    <circle cx="120" cy="34" r="42" fill="url(#r${seed})" opacity=".6"/>
    <g fill="#C3CFD8">
      <circle cx="75" cy="86" r="30"/>
      <path d="M27 205 C27 150 123 150 123 205 Z"/>
    </g>
    <g fill="none" stroke="${acc}" stroke-opacity=".55" stroke-width="1.4">
      <circle cx="75" cy="86" r="30"/>
      <path d="M27 205 C27 150 123 150 123 205"/>
    </g>
  </svg>`;
}

/* ================= 合作案例：大圖＋縮圖 ================= */
const caseBrowsers = [...document.querySelectorAll("[data-case-browser]")];
const HERO_CASE_ROTATE_MS = 3300;
const CASE_ROTATE_MS = 4800;
let heroHovered = false;
let heroFocusPaused = false;
let heroTouchPaused = false;
function heroIsPaused(){
  return heroHovered || heroFocusPaused || heroTouchPaused || document.hidden;
}
function stopCaseBrowser(browser){
  clearInterval(browser._caseTimer);
  browser._caseTimer = null;
}
function startCaseBrowser(browser){
  stopCaseBrowser(browser);
  const panel = browser.closest("[data-case-panel]");
  const accordion = browser.closest(".mbar");
  const heroSlide = browser.closest(".slide");
  const isHero = browser.classList.contains("hero-case-banner");
  if (
    reduced ||
    (panel && panel.hidden) ||
    (accordion && !accordion.classList.contains("open")) ||
    (isHero && (!heroSlide?.classList.contains("active") || heroIsPaused()))
  ) return;
  browser._caseTimer = setInterval(()=>{
    const thumbs = [...browser.querySelectorAll(".case-thumb")];
    const current = Number(browser.dataset.caseIndex || 0);
    selectCase(browser, (current + 1) % thumbs.length, false);
  }, isHero ? HERO_CASE_ROTATE_MS : CASE_ROTATE_MS);
}
function selectCase(browser, index, user){
  const thumbs = [...browser.querySelectorAll(".case-thumb")];
  const thumb = thumbs[index];
  if (!thumb) return;
  const image = browser.querySelector("[data-case-main]");
  const mobileSource = browser.querySelector("[data-case-main-mobile]");
  browser.dataset.caseIndex = String(index);
  image.src = thumb.dataset.src;
  image.alt = thumb.dataset.alt || (currentLang === "en" ? "Case study" : "合作案例");
  if (mobileSource) mobileSource.srcset = thumb.dataset.mobileSrc || thumb.dataset.src;
  thumbs.forEach((item,i)=>{
    const active = i === index;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", active ? "true" : "false");
    item.tabIndex = active ? 0 : -1;
  });
  const counter = browser.querySelector("[data-case-current]");
  if (counter) counter.textContent = String(index + 1).padStart(2,"0");
  browser.classList.remove("switching");
  void browser.offsetWidth;
  browser.classList.add("switching");
  setTimeout(()=>browser.classList.remove("switching"),380);
  if (user) startCaseBrowser(browser);
}
caseBrowsers.forEach(browser=>{
  const thumbs = [...browser.querySelectorAll(".case-thumb")];
  browser.dataset.caseIndex = "0";
  thumbs.forEach((thumb,index)=>{
    thumb.tabIndex = index === 0 ? 0 : -1;
    thumb.addEventListener("click",()=>selectCase(browser,index,true));
    thumb.addEventListener("keydown",e=>{
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const next = (index + (e.key === "ArrowRight" ? 1 : -1) + thumbs.length) % thumbs.length;
      selectCase(browser,next,true);
      thumbs[next].focus();
    });
  });
  browser.addEventListener("mouseenter",()=>stopCaseBrowser(browser));
  browser.addEventListener("mouseleave",()=>startCaseBrowser(browser));
  browser.addEventListener("focusin",()=>stopCaseBrowser(browser));
  browser.addEventListener("focusout",e=>{if(!browser.contains(e.relatedTarget)) startCaseBrowser(browser);});
  startCaseBrowser(browser);
});

/* ================= 手風琴(合作案例)：桌機滑入預覽、點擊固定 ================= */
const mstrip = document.getElementById("mstrip");
const mbars = mstrip ? [...mstrip.querySelectorAll(".mbar")] : [];
let mPinned = null;
let mHover = null;
let mHoverTimer = null;
let mMobileAnchorFrame = null;
const mDesk = () => matchMedia("(min-width:821px)").matches;
function stopMobileMAnchor(){
  cancelAnimationFrame(mMobileAnchorFrame);
  mMobileAnchorFrame = null;
}
function anchorMobileMbar(bar){
  stopMobileMAnchor();
  if (!bar || mDesk()) return;
  const started = performance.now();
  const duration = reduced ? 0 : 520;
  const hold = now=>{
    if (mDesk() || !bar.classList.contains("open")){
      stopMobileMAnchor();
      return;
    }
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 68;
    const delta = bar.getBoundingClientRect().top - headerHeight - 10;
    if (Math.abs(delta) > .5) scrollBy(0,delta);
    if (now-started < duration) mMobileAnchorFrame = requestAnimationFrame(hold);
    else mMobileAnchorFrame = null;
  };
  mMobileAnchorFrame = requestAnimationFrame(hold);
}
function scheduleMHover(next,delay){
  clearTimeout(mHoverTimer);
  mHoverTimer = setTimeout(()=>{
    if (mPinned !== null) return;
    mHover = next;
    mSet();
  },delay);
}
function mSet(){
  const active = mPinned ?? mHover;
  mbars.forEach((bar,index)=>{
    const open = active === index;
    bar.classList.toggle("open",open);
    bar.classList.toggle("pinned",mPinned === index);
    bar.classList.toggle("dim",active !== null && !open);
    const head = bar.querySelector(".mb-head");
    if (head) head.setAttribute("aria-expanded",open ? "true" : "false");
    const body = bar.querySelector(".mb-body");
    if (body){
      body.inert = !open;
      body.setAttribute("aria-hidden",open ? "false" : "true");
      body.querySelectorAll("button,a,input,select,textarea,[tabindex]").forEach(control=>{
        if (open){
          if (!Object.prototype.hasOwnProperty.call(control.dataset,"mPrevTabindex")) return;
          const previous = control.dataset.mPrevTabindex;
          if (previous === "") control.removeAttribute("tabindex");
          else control.setAttribute("tabindex",previous);
          delete control.dataset.mPrevTabindex;
        }else if (!Object.prototype.hasOwnProperty.call(control.dataset,"mPrevTabindex")){
          control.dataset.mPrevTabindex = control.getAttribute("tabindex") || "";
          control.setAttribute("tabindex","-1");
        }
      });
    }
    const browser = bar.querySelector("[data-case-browser]");
    if (browser) open ? startCaseBrowser(browser) : stopCaseBrowser(browser);
  });
}
mbars.forEach((bar,index)=>{
  const head = bar.querySelector(".mb-head");
  if (!head) return;
  bar.addEventListener("mouseenter",()=>{
    if (!finePointer || reduced || !mDesk() || mPinned !== null) return;
    scheduleMHover(index,85);
  });
  bar.addEventListener("mouseleave",()=>{
    if (!finePointer || reduced || !mDesk() || mPinned !== null) return;
    scheduleMHover(null,145);
  });
  head.addEventListener("click",()=>{
    clearTimeout(mHoverTimer);
    const opening = mPinned !== index;
    if (!opening){
      mPinned = null;
      mHover = null;
    }else{
      mPinned = index;
      mHover = null;
    }
    mSet();
    if (opening) anchorMobileMbar(bar);
    else stopMobileMAnchor();
  });
});
if (mstrip){
  mstrip.addEventListener("mouseleave",()=>{
    if (mPinned !== null) return;
    scheduleMHover(null,145);
  });
}
document.addEventListener("keydown",event=>{
  if (event.key === "Escape" && (mPinned !== null || mHover !== null)){
    clearTimeout(mHoverTimer);
    mPinned = null;
    mHover = null;
    mSet();
  }
});
mSet();
/* ================= Carousel ================= */
const slides = [...document.querySelectorAll(".slide")];
const dotsWrap = document.getElementById("dots");
const carouselEl = document.getElementById("carousel");
let slideIdx = 0, timer = null, heroTransitionTimer = null;
const HERO_SLIDE_MS = 6500;
slides.forEach((slide,i)=>{
  slide.id = "hero-slide-"+(i+1);
  const d = document.createElement("button");
  d.setAttribute("aria-label",currentLang === "en" ? `Slide ${i+1} of ${slides.length}` : `第 ${i+1} 張，共 ${slides.length} 張`);
  d.addEventListener("click",()=>go(i,true));
  dotsWrap.appendChild(d);
});
function resetHeroDepth(){
  const properties = ["--hero-bg-x","--hero-bg-y","--hero-image-x","--hero-image-y","--hero-kicker-x","--hero-kicker-y","--hero-title-x","--hero-title-y","--hero-meta-x","--hero-meta-y"];
  slides.forEach(slide=>properties.forEach(name=>slide.style.removeProperty(name)));
}
function clearHeroTransition(){
  clearTimeout(heroTransitionTimer);
  heroTransitionTimer = null;
  slides.forEach(slide=>slide.classList.remove("leaving","enter-next","enter-prev"));
  carouselEl.classList.remove("transition-next","transition-prev");
}
function getHeroDirection(from,to){
  const forward = (to-from+slides.length)%slides.length;
  if (!forward) return null;
  return forward <= slides.length/2 ? "next" : "prev";
}
function paint(direction,previousIndex){
  clearHeroTransition();
  resetHeroDepth();
  slides.forEach((s,i)=>{
    const active = i === slideIdx;
    s.classList.toggle("active",active);
    s.setAttribute("aria-hidden",active ? "false" : "true");
    const browser = s.querySelector(".hero-case-banner[data-case-browser]");
    if (browser) active ? startCaseBrowser(browser) : stopCaseBrowser(browser);
  });
  if (!reduced && direction && previousIndex !== null && previousIndex !== slideIdx){
    slides[previousIndex].classList.add("leaving");
    slides[slideIdx].classList.add("enter-"+direction);
    carouselEl.classList.add("transition-"+direction);
    heroTransitionTimer = setTimeout(clearHeroTransition,780);
  }
  [...dotsWrap.children].forEach((d,i)=>{
    const active = i === slideIdx;
    d.setAttribute("aria-current",active ? "true":"false");
    d.setAttribute("aria-pressed",active ? "true":"false");
  });
  dotsWrap.style.setProperty("--slide-progress", ((slideIdx+1)/slides.length*100)+"%");
}
function go(i, user){
  const previousIndex = slideIdx;
  const nextIndex = (i+slides.length)%slides.length;
  const direction = getHeroDirection(previousIndex,nextIndex);
  slideIdx = nextIndex;
  paint(direction,previousIndex);
  if(user) restart();
}
function syncHeroPlayback(){
  clearInterval(timer);
  slides.forEach(slide=>{
    const browser = slide.querySelector(".hero-case-banner[data-case-browser]");
    if (browser) stopCaseBrowser(browser);
  });
  const paused = reduced || heroIsPaused();
  carouselEl.classList.toggle("is-paused",paused);
  if (paused) return;
  const browser = slides[slideIdx]?.querySelector(".hero-case-banner[data-case-browser]");
  if (browser) startCaseBrowser(browser);
  timer = setInterval(()=>go(slideIdx+1),HERO_SLIDE_MS);
}
function restart(){ syncHeroPlayback(); }
document.getElementById("prevSlide").addEventListener("click",()=>go(slideIdx-1,true));
document.getElementById("nextSlide").addEventListener("click",()=>go(slideIdx+1,true));
carouselEl.addEventListener("mouseenter",()=>{
  heroHovered = true;
  syncHeroPlayback();
});
carouselEl.addEventListener("mouseleave",()=>{
  heroHovered = false;
  resetHeroDepth();
  syncHeroPlayback();
});
carouselEl.addEventListener("focusin",()=>{
  heroFocusPaused = true;
  syncHeroPlayback();
});
carouselEl.addEventListener("focusout",event=>{
  if (carouselEl.contains(event.relatedTarget)) return;
  heroFocusPaused = false;
  syncHeroPlayback();
});
carouselEl.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") go(slideIdx-1,true);
  if(e.key==="ArrowRight") go(slideIdx+1,true);
});
let heroTouch=null;
carouselEl.addEventListener("touchstart",e=>{
  if(e.touches.length!==1) return;
  heroTouchPaused = true;
  syncHeroPlayback();
  heroTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
carouselEl.addEventListener("touchend",e=>{
  if(!heroTouch || e.changedTouches.length!==1){
    heroTouch=null;
    heroTouchPaused=false;
    syncHeroPlayback();
    return;
  }
  const dx = e.changedTouches[0].clientX - heroTouch.x;
  const dy = e.changedTouches[0].clientY - heroTouch.y;
  if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.2) go(slideIdx+(dx<0?1:-1),true);
  heroTouch=null;
  heroTouchPaused=false;
  syncHeroPlayback();
},{passive:true});
carouselEl.addEventListener("touchcancel",()=>{
  heroTouch=null;
  heroTouchPaused=false;
  syncHeroPlayback();
},{passive:true});

if (finePointer && !reduced){
  let depthFrame = null;
  let depthRect = null;
  let depthX = 0;
  let depthY = 0;
  carouselEl.addEventListener("pointerenter",()=>{ depthRect = carouselEl.getBoundingClientRect(); });
  carouselEl.addEventListener("pointermove",event=>{
    depthRect ||= carouselEl.getBoundingClientRect();
    depthX = Math.max(-1,Math.min(1,(event.clientX-depthRect.left)/depthRect.width*2-1));
    depthY = Math.max(-1,Math.min(1,(event.clientY-depthRect.top)/depthRect.height*2-1));
    if (depthFrame !== null) return;
    depthFrame = requestAnimationFrame(()=>{
      depthFrame = null;
      const slide = slides[slideIdx];
      slide.style.setProperty("--hero-bg-x",(-depthX*4).toFixed(2)+"px");
      slide.style.setProperty("--hero-bg-y",(-depthY*3).toFixed(2)+"px");
      slide.style.setProperty("--hero-image-x",(depthX*7).toFixed(2)+"px");
      slide.style.setProperty("--hero-image-y",(depthY*5).toFixed(2)+"px");
      slide.style.setProperty("--hero-kicker-x",(depthX*6).toFixed(2)+"px");
      slide.style.setProperty("--hero-kicker-y",(depthY*4).toFixed(2)+"px");
      slide.style.setProperty("--hero-title-x",(depthX*11).toFixed(2)+"px");
      slide.style.setProperty("--hero-title-y",(depthY*7).toFixed(2)+"px");
      slide.style.setProperty("--hero-meta-x",(-depthX*5).toFixed(2)+"px");
      slide.style.setProperty("--hero-meta-y",(-depthY*3).toFixed(2)+"px");
    });
  });
  addEventListener("resize",()=>{ depthRect=null; },{passive:true});
}
document.addEventListener("visibilitychange",()=>{
  if (document.hidden){
    resetHeroDepth();
    caseBrowsers.forEach(stopCaseBrowser);
  }else{
    mSet();
  }
  syncHeroPlayback();
});
paint(); restart();

/* ================= Brand wall & rosters ================= */
let activeBrand = null;
function renderBrands(){
  const g = document.getElementById("brandGrid");
  g.innerHTML = BRANDS.map(b=>{
    const localizedName = brandName(b);
    let inner;
    if(b.logoB){
      inner = `<span class="brand-logo">
        <img class="lb${b.logoC?"":" only"}" src="${b.logoB}" alt="${localizedName}">
        ${b.logoC?`<img class="lc" src="${b.logoC}" alt="" aria-hidden="true">`:""}
      </span>`;
    } else {
      const primary = localizedName;
      const secondary = currentLang === "zh" && b.en ? b.en : "";
      inner = `<span class="brand-word">
        <span class="w-zh">${primary}</span>
        ${secondary ? `<span class="w-en">${secondary}</span>` : ""}
      </span>`;
    }
    return `<button class="brand-tile" style="--tile:${b.color}" data-brand="${b.id}" aria-label="${localizedName}">
      ${inner}${b.logoB && b.en ? `<span class="brand-name">${b.en}</span>` : ""}
    </button>`;
  }).join("");
  g.querySelectorAll("[data-brand]").forEach(t=>{
    bindTilt(t,4);
    t.addEventListener("click",()=>openRoster(BRANDS.find(x=>x.id===t.dataset.brand)));
  });
}
function openRoster(brand, keep){
  activeBrand = brand;
  document.getElementById("brandIndex").hidden = true;
  document.getElementById("brandRoster").hidden = false;
  const hero = document.getElementById("rosterHero");
  hero.style.setProperty("--bc", brand.color);
  const logo = brand.logoC || brand.logoB;
  const localizedBrandName = brandName(brand);
  document.getElementById("rhLogo").innerHTML = logo
    ? `<img src="${logo}" class="${brand.lightLogo ? "logo-inv" : ""}" alt="${localizedBrandName}">`
    : `<span class="rh-word">${localizedBrandName}</span>`;
  const rhEn = document.getElementById("rhEn");
  rhEn.textContent = currentLang === "en" ? "CREATOR NETWORK" : brand.en;
  rhEn.hidden = currentLang === "zh" && !brand.en;
  document.getElementById("rhZh").textContent = localizedBrandName;
  const n = FLOW_COUNTS[brand.id] || 0;
  document.getElementById("rhCount").innerHTML = `<b>${n}</b> CREATORS`;
  const grid = document.getElementById("rosterGrid");
  const real = KOL_DATA[brand.id];
  grid.innerHTML = Array.from({length:n},(_,i)=>{
    const k = real && real[i] ? real[i] : null;
    const label = k ? kolName(k) : (currentLang === "en" ? "Creator" : "KOL");
    const media = k && k.img ? `<img src="${k.img}" alt="${label}" loading="lazy">` : portraitSVG(i+20,brand.color);
    return `<div class="kol-card talent-card" tabindex="0" role="button" style="--fc:${brand.color}" data-kb="${brand.id}" data-ki="${i}" aria-label="${label}">${media}
      <span class="card-tech" aria-hidden="true"></span><span class="card-scan" aria-hidden="true"></span>
      <span class="card-open" aria-hidden="true">↗</span>
      <div class="k-name">${label}</div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".kol-card").forEach(c=>bindTilt(c,5));
  if(!keep) document.getElementById("brandRoster").scrollIntoView({behavior:reduced?"auto":"smooth"});
}
function closeRoster(){
  activeBrand = null;
  document.getElementById("brandIndex").hidden = false;
  document.getElementById("brandRoster").hidden = true;
  document.getElementById("brandIndex").scrollIntoView({behavior:reduced?"auto":"smooth"});
}
document.getElementById("rosterBack").addEventListener("click",closeRoster);

/* ================= KOL modal ================= */
const SOC = {
  tw:{n:"Twitch", c:"#9146FF", s:'<svg viewBox="0 0 24 24"><path d="M4.3 2 2.6 6v13.3h4.6V22h2.6l2.7-2.7h4l5-5V2H4.3zm15.4 11.4-2.9 2.9h-4.6l-2.7 2.7v-2.7H5.7V3.7h14v9.7zM16.9 6.5h-1.7v5.1h1.7V6.5zm-4.6 0h-1.7v5.1h1.7V6.5z"/></svg>'},
  yt:{n:"YouTube", c:"#FF0000", s:'<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.2C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 0 0 1 7.2 32 32 0 0 0 .5 12 32 32 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1A32 32 0 0 0 23.5 12 32 32 0 0 0 23 7.2zM9.7 15.3V8.7l6 3.3-6 3.3z"/></svg>'},
  fb:{n:"Facebook", c:"#1877F2", s:'<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.7-1.6h1.6V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.6H7.6V14h2.8v8h3.1z"/></svg>'},
  ig:{n:"Instagram", c:"#E1306C", s:'<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.8-.3 1.9-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.8.3 1.9.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.8.3-1.9.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.9a2 2 0 0 0-.7-1.1 2 2 0 0 0-1.1-.7c-.4-.1-.8-.3-1.9-.3-1.3-.1-1.7-.1-4.8-.1zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>'},
  tk:{n:"TikTok", c:"#010101", s:'<svg viewBox="0 0 24 24"><path d="M16.6 3c.4 2 1.7 3.3 3.9 3.5v2.9c-1.4 0-2.7-.4-3.9-1.2v5.6c0 4.1-2.9 6.4-6 6.4A5.5 5.5 0 0 1 5 14.7c0-3.2 2.6-5.6 6-5.4v3a2.7 2.7 0 0 0-3 2.6 2.6 2.6 0 0 0 2.7 2.6c1.6 0 2.9-1.2 2.9-3.3V3h3z"/></svg>'},
  x:{n:"X", c:"#000000", s:'<svg viewBox="0 0 24 24"><path d="M17.7 3H21l-7.3 8.3L22.2 21h-6.7l-5.2-6.2L4.4 21H1l7.8-8.9L1.5 3h6.9l4.7 5.7L17.7 3zm-1.2 16h1.9L7.1 4.9H5.1L16.5 19z"/></svg>'}
};
const kModal = document.getElementById("kModal");
const kmCard = kModal.querySelector(".km-card");
let kmState = null;
let kmOriginCard = null;
let kmCloseTimer = null;
let kmReturnMotion = null;
function openK(brandId, idx, sourceCard){
  const opening = kModal.hidden;
  clearTimeout(kmCloseTimer);
  kmState = {b: brandId, i: idx};
  const b = brandById(brandId);
  const real = KOL_DATA[brandId];
  const k = real && real[idx] ? real[idx] : null;
  const label = k ? kolName(k) : (currentLang === "en" ? "Creator " : "KOL ") + pad2(idx+1);
  kmCard.style.setProperty("--kc",b.color);
  document.getElementById("kmMedia").innerHTML =
    (k && k.img ? `<img src="${k.img}" alt="${label}">` : portraitSVG("m"+idx, b.color))+
    '<span class="km-media-tech" aria-hidden="true"></span>';
  document.getElementById("kmTeam").textContent = currentLang === "en" ? brandName(b) : "【" + brandName(b) + "】";
  document.getElementById("kmName").textContent = label;
  const tags = k ? kolTags(k) : [];
  document.getElementById("kmTags").innerHTML =
    tags.map(t => `<span>${t}</span>`).join("");
  const intro = document.getElementById("kmIntro");
  const localizedIntro = k ? kolIntro(k) : "";
  intro.textContent = localizedIntro;
  intro.hidden = !localizedIntro;
  const soc = document.getElementById("kmSoc");
  let socHtml = "";
  if (k && k.links){
    socHtml = Object.keys(k.links).map(p => {
      const m = SOC[p]; if (!m) return "";
      const url = k.links[p];
      return url
        ? `<a class="soc" href="${url}" target="_blank" rel="noopener" aria-label="${m.n}" style="--sc:${m.c}">${m.s}</a>`
        : `<span class="soc off" title="${m.n}${currentLang === "en" ? " link coming soon" : "（連結籌備中）"}">${m.s}</span>`;
    }).join("");
  }
  soc.innerHTML = socHtml; soc.hidden = !socHtml;
  const link = document.getElementById("kmLink");
  const chan = k ? (k.link || (k.links && (k.links.tw || k.links.yt)) || null) : null;
  if (chan){ link.href = chan; link.hidden = false; } else link.hidden = true;
  if(opening){
    kModal.classList.remove("open","from-card","closing-to-card");
    kModal.hidden = false;
    document.body.classList.add("km-lock");
    kmOriginCard = sourceCard && sourceCard.isConnected ? sourceCard : null;
    if(kmOriginCard && Element.prototype.animate && !reduced){
      kModal.classList.add("preparing");
      const from = kmOriginCard.getBoundingClientRect();
      const to = kmCard.getBoundingClientRect();
      kmCard.style.setProperty("--km-from-x",(from.left+from.width/2-to.left-to.width/2)+"px");
      kmCard.style.setProperty("--km-from-y",(from.top+from.height/2-to.top-to.height/2)+"px");
      kmCard.style.setProperty("--km-from-sx",Math.max(.08,from.width/to.width));
      kmCard.style.setProperty("--km-from-sy",Math.max(.08,from.height/to.height));
      kModal.classList.remove("preparing");
      kModal.classList.add("from-card");
    }
  }
  requestAnimationFrame(()=>kModal.classList.add("open"));
}
function finishKClose(){
  clearTimeout(kmCloseTimer);
  if(kmReturnMotion){
    const motion = kmReturnMotion;
    kmReturnMotion = null;
    motion.onfinish = null;
    motion.oncancel = null;
    motion.cancel();
  }
  kModal.classList.remove("open","from-card","preparing","closing-to-card");
  kModal.hidden = true;
  document.body.classList.remove("km-lock");
}
function closeK(){
  if(kModal.hidden) return;
  const candidate = kmOriginCard && kmOriginCard.isConnected ? kmOriginCard : null;
  const candidateRect = candidate ? candidate.getBoundingClientRect() : null;
  const origin = candidateRect && candidateRect.right > 0 && candidateRect.left < innerWidth &&
    candidateRect.bottom > 0 && candidateRect.top < innerHeight ? candidate : null;
  kmOriginCard = null;
  if(origin && Element.prototype.animate && !reduced){
    const from = kmCard.getBoundingClientRect();
    const to = origin.getBoundingClientRect();
    const dx = to.left+to.width/2-from.left-from.width/2;
    const dy = to.top+to.height/2-from.top-from.height/2;
    kModal.classList.add("closing-to-card");
    kmReturnMotion = kmCard.animate([
      {opacity:1,transform:"translate3d(0,0,0) scale(1)",filter:"blur(0)"},
      {opacity:.72,transform:`translate3d(${dx*.55}px,${dy*.55}px,0) scale(${Math.max(.3,to.width/from.width*1.55)},${Math.max(.3,to.height/from.height*1.25)})`,filter:"blur(.2px)",offset:.58},
      {opacity:0,transform:`translate3d(${dx}px,${dy}px,0) scale(${to.width/from.width},${to.height/from.height})`,filter:"blur(1px)"}
    ],{duration:480,easing:"cubic-bezier(.5,0,.2,1)",fill:"forwards"});
    kmReturnMotion.onfinish = finishKClose;
    kmReturnMotion.oncancel = finishKClose;
    kmCloseTimer = setTimeout(finishKClose,540);
  }else{
    kModal.classList.remove("open");
    kmCloseTimer = setTimeout(finishKClose,340);
  }
}
function kmStep(dir){
  if (!kmState) return;
  const n = FLOW_COUNTS[kmState.b] || 1;
  const card = kmCard;
  const motionClass = dir > 0 ? "km-next" : "km-prev";
  kmOriginCard = null;
  kModal.classList.remove("from-card");
  card.classList.remove("km-next", "km-prev");
  openK(kmState.b, (kmState.i + dir + n) % n);
  if (!reduced){
    void card.offsetWidth;
    card.classList.add(motionClass);
    setTimeout(()=>card.classList.remove(motionClass), 360);
  }
}

/* 手機藝人詳細卡：保留上下捲動，只有明確的水平手勢才切換人物 */
let kmTouch = null;
if (kmCard){
  kmCard.addEventListener("touchstart", e => {
    if (!matchMedia("(max-width:640px)").matches || e.touches.length !== 1) return;
    if (e.target.closest("a,button")) return;
    const t = e.touches[0];
    kmTouch = {x:t.clientX, y:t.clientY, at:performance.now()};
  }, {passive:true});
  kmCard.addEventListener("touchend", e => {
    if (!kmTouch || e.changedTouches.length !== 1){ kmTouch = null; return; }
    const t = e.changedTouches[0];
    const dx = t.clientX - kmTouch.x;
    const dy = t.clientY - kmTouch.y;
    const elapsed = performance.now() - kmTouch.at;
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.25;
    const deliberate = Math.abs(dx) > 52 || (Math.abs(dx) > 34 && elapsed < 280);
    if (horizontal && deliberate){
      kModal.classList.add("swipe-used");
      kmStep(dx < 0 ? 1 : -1);
    }
    kmTouch = null;
  }, {passive:true});
  kmCard.addEventListener("touchcancel", ()=>{ kmTouch = null; }, {passive:true});
}
document.addEventListener("click", e => {
  const nav = e.target.closest("[data-knav]");
  if (nav){ kmStep(+nav.dataset.knav); return; }
  if (e.target.closest("[data-kclose]")) { closeK(); return; }
  const c = e.target.closest("[data-kb]");
  if (c) openK(c.dataset.kb, +c.dataset.ki, c);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !kModal.hidden) closeK();
  if (!kModal.hidden && e.key === "ArrowLeft") kmStep(-1);
  if (!kModal.hidden && e.key === "ArrowRight") kmStep(1);
  if (e.key === "Enter"){
    const c = document.activeElement && document.activeElement.closest ? document.activeElement.closest("[data-kb]") : null;
    if (c) openK(c.dataset.kb, +c.dataset.ki, c);
  }
});

/* ================= Contact form ================= */
const codeEl = document.getElementById("captchaCode");
function newCaptcha(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  codeEl.textContent = Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}
newCaptcha();
document.getElementById("captchaRefresh").addEventListener("click",newCaptcha);
const form = document.getElementById("contactForm");
const msg = document.getElementById("formMsg");
const submitButton = document.getElementById("submitInquiry");
const resetButton = form.querySelector('[type="reset"]');
/* 測試完成後只需更換這一行的收件信箱。 */
const CONTACT_RECIPIENT = "bella182399@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_RECIPIENT}`;
form.action = `https://formsubmit.co/${CONTACT_RECIPIENT}`;
const FORM_MESSAGES = {
  incorrectCode:{zh:"驗證碼不正確",en:"Incorrect verification code."},
  required:{zh:"請填寫必填欄位",en:"Please complete all required fields."},
  sending:{zh:"正在安全送出您的洽詢…",en:"Sending your inquiry…"},
  sent:{zh:"已成功送出，我們會盡快與您聯繫。",en:"Your inquiry has been sent. We’ll be in touch soon."},
  sendFailed:{zh:"目前無法送出，請稍後再試，或直接寄信至 team@rayterent.com。",en:"We couldn’t send your inquiry. Please try again later or email team@rayterent.com."}
};
function setFormMessage(key){
  const copy = FORM_MESSAGES[key];
  if(!copy) return;
  msg.dataset.messageKey = key;
  msg.textContent = copy[currentLang];
}
function setFormBusy(busy){
  form.setAttribute("aria-busy",busy ? "true" : "false");
  submitButton.disabled = busy;
  resetButton.disabled = busy;
  submitButton.querySelector(".submit-default").hidden = busy;
  submitButton.querySelector(".submit-busy").hidden = !busy;
}
form.addEventListener("reset",()=>{msg.className="form-msg";delete msg.dataset.messageKey;msg.textContent="";newCaptcha();
  form.querySelectorAll(".err").forEach(x=>x.classList.remove("err"));});
form.addEventListener("submit",async e=>{
  e.preventDefault();
  if(submitButton.disabled) return;
  form.querySelectorAll(".err").forEach(x=>x.classList.remove("err"));
  const name = form.fName.value.trim();
  const email = form.fEmail.value.trim();
  const body = form.fMsg.value.trim();
  const cap = document.getElementById("fCaptcha").value.trim().toUpperCase();
  let bad = [];
  if(!name) bad.push(form.fName);
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(form.fEmail);
  if(!body) bad.push(form.fMsg);
  if(cap !== codeEl.textContent) bad.push(document.getElementById("fCaptcha"));
  if(bad.length){
    bad.forEach(x=>x.classList.add("err"));
    msg.className = "form-msg bad";
    setFormMessage(cap !== codeEl.textContent && bad.length===1 ? "incorrectCode" : "required");
    bad[0].focus();
    return;
  }
  const payload = new FormData(form);
  payload.set("_subject",currentLang === "zh" ? "【網站合作洽詢】"+name : "[Website Inquiry] "+name);
  payload.set("_replyto",email);
  payload.set("language",currentLang === "en" ? "English" : "Traditional Chinese");
  payload.set("page",location.href);
  setFormBusy(true);
  msg.className = "form-msg pending";
  setFormMessage("sending");
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),15000);
  try{
    const response = await fetch(FORM_ENDPOINT,{
      method:"POST",
      body:payload,
      headers:{Accept:"application/json"},
      signal:controller.signal
    });
    let result = null;
    try{ result = await response.json(); }catch(e){}
    if(!response.ok || result?.success === false || result?.success === "false") throw new Error("Submission failed");
    form.reset();
    msg.className = "form-msg ok";
    setFormMessage("sent");
  }catch(e){
    msg.className = "form-msg bad";
    setFormMessage("sendFailed");
  }finally{
    clearTimeout(timeout);
    setFormBusy(false);
  }
});

/* ================= Creator flow ================= */
const FLOW_COUNTS = {xd:13, pinkie:11, south:8, green:6, aster:3, zmn:2}; /* 共 43 */
const FLOW = [];
BRANDS.forEach(b=>{
  const real = KOL_DATA[b.id];
  const n = FLOW_COUNTS[b.id] || 0;
  for(let i=1;i<=n;i++){
    const k = real && real[i-1] ? real[i-1] : null;
    FLOW.push({brand:b, num:i, kol:k, img:k?k.img:null});
  }
});
function pad2(n){ return String(n).padStart(2,"0"); }
function brandById(id){ return BRANDS.find(x => x.id === id); }
function flowCardHTML(item, seed, clone){
  const b = item.brand;
  const label = item.kol ? kolName(item.kol) : (currentLang === "en" ? "Creator " : "KOL ")+pad2(item.num);
  const media = item.img ? `<img src="${item.img}" alt="${label}" loading="lazy" decoding="async">` : portraitSVG(seed, b.color);
  return `<figure class="flow-card talent-card" style="--fc:${b.color}" tabindex="0" role="button"${clone?' data-flow-clone="true"':''}
    data-kb="${b.id}" data-ki="${item.num-1}" aria-label="${label}">
    ${media}
    <span class="card-tech" aria-hidden="true"></span><span class="card-scan" aria-hidden="true"></span>
    <span class="card-open" aria-hidden="true">↗</span>
    <figcaption class="fc-tag">${label}｜${brandName(b)}</figcaption>
  </figure>`;
}

let mobileFlowCleanup = null;
function flowCardPosition(row, card){
  const padding = parseFloat(getComputedStyle(row).paddingLeft) || 0;
  return row.scrollLeft + card.getBoundingClientRect().left - row.getBoundingClientRect().left - padding;
}
function setupMobileFlow(row, track){
  const cards = Array.from(track.children);
  const realCount = cards.length - 2;
  if(realCount < 1) return ()=>{};

  let autoplayTimer = null;
  let settleTimer = null;
  let resumeTimer = null;
  let jumping = false;
  let touching = false;
  let visible = true;

  const nearestIndex = ()=>{
    let best = 0;
    let distance = Infinity;
    cards.forEach((card,index)=>{
      const delta = Math.abs(flowCardPosition(row,card) - row.scrollLeft);
      if(delta < distance){ distance = delta; best = index; }
    });
    return best;
  };
  const jumpTo = index=>{
    jumping = true;
    row.scrollTo({left:flowCardPosition(row,cards[index]),behavior:"auto"});
    requestAnimationFrame(()=>{ jumping = false; });
  };
  const normalize = ()=>{
    if(jumping || touching) return;
    const index = nearestIndex();
    if(index === 0) jumpTo(realCount);
    else if(index === realCount + 1) jumpTo(1);
  };
  const schedule = (delay=2800)=>{
    clearTimeout(autoplayTimer);
    if(reduced) return;
    autoplayTimer = setTimeout(function advance(){
      if(!touching && visible && document.visibilityState !== "hidden" && kModal.hidden){
        normalize();
        const index = nearestIndex();
        row.scrollTo({left:flowCardPosition(row,cards[Math.min(index+1,realCount+1)]),behavior:"smooth"});
      }
      autoplayTimer = setTimeout(advance,2800);
    },delay);
  };
  const onScroll = ()=>{
    if(jumping) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(normalize,150);
  };
  const onTouchStart = ()=>{
    touching = true;
    clearTimeout(autoplayTimer);
    clearTimeout(resumeTimer);
  };
  const resume = ()=>{
    touching = false;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(normalize,180);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(()=>schedule(1800),350);
  };

  row.addEventListener("scroll",onScroll,{passive:true});
  row.addEventListener("touchstart",onTouchStart,{passive:true});
  row.addEventListener("touchend",resume,{passive:true});
  row.addEventListener("touchcancel",resume,{passive:true});

  let observer = null;
  if("IntersectionObserver" in window){
    observer = new IntersectionObserver(entries=>{
      visible = !!entries[0]?.isIntersecting;
    },{threshold:.08});
    observer.observe(row);
  }

  requestAnimationFrame(()=>{
    jumpTo(1);
    schedule(2300);
  });

  return ()=>{
    clearTimeout(autoplayTimer);
    clearTimeout(settleTimer);
    clearTimeout(resumeTimer);
    observer?.disconnect();
    row.removeEventListener("scroll",onScroll);
    row.removeEventListener("touchstart",onTouchStart);
    row.removeEventListener("touchend",resume);
    row.removeEventListener("touchcancel",resume);
  };
}
function renderFlows(){
  if(mobileFlowCleanup){ mobileFlowCleanup(); mobileFlowCleanup = null; }
  const rows = [
    ["flowA1", FLOW]
  ];
  rows.forEach(([id, list])=>{
    const el = document.getElementById(id);
    if(!el) return;
    const cards = list.map((it,i)=>flowCardHTML(it, id+i)).join("");
    if(matchMedia("(max-width:640px)").matches){
      const first = flowCardHTML(list[0],id+"-first-clone",true);
      const last = flowCardHTML(list[list.length-1],id+"-last-clone",true);
      el.innerHTML = last + cards + first;
      mobileFlowCleanup = setupMobileFlow(el.parentElement,el);
    }else{
      el.innerHTML = cards + cards;
    }
    el.querySelectorAll(".flow-card").forEach(card=>bindTilt(card,4));
  });
}
const flowMobileQuery = matchMedia("(max-width:640px)");
if(flowMobileQuery.addEventListener) flowMobileQuery.addEventListener("change", renderFlows);

/* ================= Init ================= */
setupProductionPlayers();
applyLang(currentLang,false);
watchReveals(document);
if(location.hash && SECTIONS.includes(location.hash.slice(1))){
  setTimeout(()=>document.getElementById(location.hash.slice(1)).scrollIntoView(),100);
}
