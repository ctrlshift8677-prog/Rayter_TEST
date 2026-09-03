/* ============================================================
   雷特娛樂官網 main.js — 邏輯檔(依檔內順序)
   開場 Intro → 游標 → 語言切換 applyLang → 捲動進度/回頂/藍色底圖 aboutCurtain
   → Reveal 進場 → 磁吸手風琴 mstrip → 首屏輪播 → 廠牌牆/名單 openRoster
   → KOL 資訊卡 openK(SOC 社群 icon 定義)→ 人像流 FLOW_COUNTS+renderFlows
   → 表單 → 行動選單 → Init
   ============================================================ */

let currentLang = "zh";
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
    intro.innerHTML = '<img class="intro-static-logo" src="assets/rayter-logo.svg" alt="雷特娛樂 Rayter Entertainment">';
    introEndTimer = setTimeout(()=>startIntroExit(true, false), 1700);
    return;
  }

  intro.setAttribute("aria-label", "雷特娛樂開場動畫，點擊可略過");
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
    <button class="intro-skip" type="button" aria-label="略過開場動畫">SKIP</button>`;

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
function applyLang(lang){
  currentLang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-zh]").forEach(el=>{
    const t = el.getAttribute("data-"+lang);
    if(t !== null && !el.querySelector("a")) el.textContent = t;
  });
  document.querySelectorAll(".lang-seg .ls").forEach(function(b){ b.classList.toggle("on", b.dataset.lang===lang); });
  renderBrands();
  renderFlows();
  if(!document.getElementById("brandRoster").hidden && activeBrand) openRoster(activeBrand, true);
}
document.querySelectorAll(".lang-seg .ls").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang)));

/* ================= One-page nav + scroll spy ================= */
const SECTIONS = ["about","service","artist","contact"];
const menuBtn = document.getElementById("menuBtn");
const mMenu = document.getElementById("mMenu");
function closeMenu(){ mMenu.classList.remove("open"); menuBtn.setAttribute("aria-expanded","false"); }
menuBtn.addEventListener("click",()=>{
  const open = mMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeMenu(); });
document.querySelectorAll(".nav-btn[data-target]").forEach(b=>{
  b.addEventListener("click",()=>{
    closeMenu();
    document.getElementById(b.dataset.target).scrollIntoView({behavior:reduced?"auto":"smooth"});
    history.replaceState(null,"","#"+b.dataset.target);
  });
});
const spy = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll(".nav-btn[data-target]").forEach(b=>
        b.classList.toggle("active", b.dataset.target===e.target.id));
    }
  });
},{rootMargin:"-38% 0px -55% 0px"});
SECTIONS.forEach(id=>spy.observe(document.getElementById(id)));

/* ================= Scroll progress ================= */
const sprog = document.getElementById("sprog");
const toTop = document.getElementById("toTop");
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

/* ================= Reveals ================= */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}
}),{threshold:.1});
function watchReveals(root){(root||document).querySelectorAll("[data-rev]:not(.in)").forEach(el=>io.observe(el));}

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
  <svg viewBox="0 0 150 205" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="照片">
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

/* ================= 磁吸手風琴(合作案例) ================= */
const mstrip = document.getElementById("mstrip");
const mbars = Array.from(mstrip.querySelectorAll(".mbar"));
let mOpen = null;
const mDesk = () => matchMedia("(min-width:821px)").matches;
function mClearFlex(){ mbars.forEach(b => b.style.flexGrow = ""); }
function mSet(){
  mbars.forEach((b,i)=>{
    b.classList.toggle("open", mOpen === i);
    b.classList.toggle("dim", mOpen !== null && mOpen !== i);
    b.setAttribute("aria-expanded", mOpen === i);
  });
}
mbars.forEach((b,i)=>{
  b.addEventListener("click", ()=>{
    mOpen = (mOpen === i) ? null : i;
    if (mOpen !== null) mClearFlex();
    mSet();
  });
});
if (finePointer && !reduced){
  mstrip.addEventListener("mousemove", e => {
    if (mOpen !== null || !mDesk()) return;
    mbars.forEach(b => {
      const r = b.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width/2));
      const f = Math.max(0, 1 - d / 280);
      b.style.flexGrow = (1 + f * 1.2).toFixed(3);
    });
  });
  mstrip.addEventListener("mouseleave", mClearFlex);
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && mOpen !== null){ mOpen = null; mClearFlex(); mSet(); }
});
document.querySelectorAll("[data-goto]").forEach(b=>
  b.addEventListener("click",()=>document.getElementById(b.dataset.goto)
    .scrollIntoView({behavior:reduced?"auto":"smooth"})));

/* ================= Carousel ================= */
const slides = [...document.querySelectorAll(".slide")];
const dotsWrap = document.getElementById("dots");
let slideIdx = 0, timer = null;
slides.forEach((_,i)=>{
  const d = document.createElement("button");
  d.setAttribute("aria-label","第 "+(i+1)+" 張");
  d.addEventListener("click",()=>go(i,true));
  dotsWrap.appendChild(d);
});
function paint(){
  slides.forEach((s,i)=>s.classList.toggle("active", i===slideIdx));
  [...dotsWrap.children].forEach((d,i)=>d.setAttribute("aria-current", i===slideIdx ? "true":"false"));
  dotsWrap.style.setProperty("--slide-progress", ((slideIdx+1)/slides.length*100)+"%");
}
function go(i, user){
  slideIdx = (i+slides.length)%slides.length;
  paint();
  if(user) restart();
}
function restart(){clearInterval(timer);if(!reduced) timer=setInterval(()=>go(slideIdx+1),6000);}
document.getElementById("prevSlide").addEventListener("click",()=>go(slideIdx-1,true));
document.getElementById("nextSlide").addEventListener("click",()=>go(slideIdx+1,true));
const carouselEl = document.getElementById("carousel");
carouselEl.addEventListener("mouseenter",()=>clearInterval(timer));
carouselEl.addEventListener("mouseleave",restart);
carouselEl.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") go(slideIdx-1,true);
  if(e.key==="ArrowRight") go(slideIdx+1,true);
});
let heroTouch=null;
carouselEl.addEventListener("touchstart",e=>{
  if(e.touches.length!==1) return;
  clearInterval(timer);
  heroTouch={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
carouselEl.addEventListener("touchend",e=>{
  if(!heroTouch || e.changedTouches.length!==1){heroTouch=null;restart();return;}
  const dx = e.changedTouches[0].clientX - heroTouch.x;
  const dy = e.changedTouches[0].clientY - heroTouch.y;
  if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.2) go(slideIdx+(dx<0?1:-1),true);
  else restart();
  heroTouch=null;
},{passive:true});
carouselEl.addEventListener("touchcancel",()=>{heroTouch=null;restart();},{passive:true});
paint(); restart();

/* ================= Brand wall & rosters ================= */
let activeBrand = null;
function renderBrands(){
  const g = document.getElementById("brandGrid");
  g.innerHTML = BRANDS.map(b=>{
    let inner;
    if(b.logoB){
      inner = `<span class="brand-logo">
        <img class="lb${b.logoC?"":" only"}" src="${b.logoB}" alt="${b.zh}">
        ${b.logoC?`<img class="lc" src="${b.logoC}" alt="" aria-hidden="true">`:""}
      </span>`;
    } else {
      inner = `<span class="brand-word">
        <span class="w-zh">${currentLang==="zh"?b.zh:b.en}</span>
        <span class="w-en">${currentLang==="zh"?b.en:b.zh}</span>
      </span>`;
    }
    return `<button class="brand-tile" style="--tile:${b.color}" data-brand="${b.id}" aria-label="${b.zh} ${b.en}">
      ${inner}<span class="brand-name">${b.en}</span>
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
  document.getElementById("rhLogo").innerHTML = logo
    ? `<img src="${logo}" class="${brand.lightLogo ? "logo-inv" : ""}" alt="${brand.zh}">`
    : `<span class="rh-word">${brand.en}</span>`;
  document.getElementById("rhEn").textContent = brand.en;
  document.getElementById("rhZh").textContent = brand.zh;
  const n = FLOW_COUNTS[brand.id] || 0;
  document.getElementById("rhCount").innerHTML = `<b>${n}</b> CREATORS`;
  const mail = document.getElementById("rhMail");
  if (brand.email){
    mail.href = "mailto:" + brand.email;
    mail.querySelector("span").textContent = brand.email;
    mail.hidden = false;
  } else mail.hidden = true;
  const grid = document.getElementById("rosterGrid");
  const real = KOL_DATA[brand.id];
  grid.innerHTML = Array.from({length:n},(_,i)=>{
    const k = real && real[i] ? real[i] : null;
    const media = k && k.img ? `<img src="${k.img}" alt="${k.n}" loading="lazy">` : portraitSVG(i+20,brand.color);
    const label = k ? k.n : "KOL";
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
  const label = k ? k.n : "KOL " + pad2(idx+1);
  kmCard.style.setProperty("--kc",b.color);
  document.getElementById("kmMedia").innerHTML =
    (k && k.img ? `<img src="${k.img}" alt="${label}">` : portraitSVG("m"+idx, b.color))+
    '<span class="km-media-tech" aria-hidden="true"></span>';
  document.getElementById("kmTeam").textContent = "【" + (currentLang==="zh" ? b.zh : b.en) + "】";
  document.getElementById("kmName").textContent = label;
  document.getElementById("kmTags").innerHTML =
    k && k.tags ? k.tags.map(t => `<span>${t}</span>`).join("") : "";
  const intro = document.getElementById("kmIntro");
  intro.textContent = k && k.intro ? k.intro : "";
  intro.hidden = !(k && k.intro);
  const soc = document.getElementById("kmSoc");
  let socHtml = "";
  if (k && k.links){
    socHtml = Object.keys(k.links).map(p => {
      const m = SOC[p]; if (!m) return "";
      const url = k.links[p];
      return url
        ? `<a class="soc" href="${url}" target="_blank" rel="noopener" aria-label="${m.n}" style="--sc:${m.c}">${m.s}</a>`
        : `<span class="soc off" title="${m.n}(連結籌備中)">${m.s}</span>`;
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
form.addEventListener("reset",()=>{msg.className="form-msg";newCaptcha();
  form.querySelectorAll(".err").forEach(x=>x.classList.remove("err"));});
form.addEventListener("submit",e=>{
  e.preventDefault();
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
    msg.textContent = currentLang==="zh"
      ? (cap !== codeEl.textContent && bad.length===1 ? "驗證碼不正確" : "請填寫必填欄位")
      : (cap !== codeEl.textContent && bad.length===1 ? "Captcha doesn't match" : "Fill in the required fields");
    bad[0].focus();
    return;
  }
  const subject = encodeURIComponent(currentLang==="zh" ? "【合作洽詢】"+name : "[Inquiry] "+name);
  const lines = [
    (currentLang==="zh"?"客戶名稱:":"Name: ")+name,
    (currentLang==="zh"?"聯絡電話:":"Phone: ")+(form.fTel.value.trim()||"—"),
    (currentLang==="zh"?"手機:":"Mobile: ")+(form.fMobile.value.trim()||"—"),
    (currentLang==="zh"?"信箱:":"Email: ")+email,
    "", body
  ];
  window.location.href = "mailto:rayterz78@gmail.com?subject="+subject+"&body="+encodeURIComponent(lines.join("\n"));
  msg.className = "form-msg ok";
  msg.textContent = currentLang==="zh" ? "已開啟郵件程式" : "Mail app opened";
});

/* ================= Creator flow ================= */
const FLOW_COUNTS = {xd:13, pinkie:10, south:8, green:6, aster:3, zmn:2}; /* 共 42 */
const FLOW = [];
BRANDS.forEach(b=>{
  const real = KOL_DATA[b.id];
  const n = FLOW_COUNTS[b.id] || 0;
  for(let i=1;i<=n;i++){
    const k = real && real[i-1] ? real[i-1] : null;
    FLOW.push({brand:b, num:i, name:k?k.n:null, img:k?k.img:null});
  }
});
function pad2(n){ return String(n).padStart(2,"0"); }
function brandById(id){ return BRANDS.find(x => x.id === id); }
function flowCardHTML(item, seed, clone){
  const b = item.brand;
  const media = item.img ? `<img src="${item.img}" alt="${item.name||"KOL"}" loading="lazy" decoding="async">` : portraitSVG(seed, b.color);
  const label = item.name ? item.name : "KOL "+pad2(item.num);
  return `<figure class="flow-card talent-card" style="--fc:${b.color}" tabindex="0" role="button"${clone?' data-flow-clone="true"':''}
    data-kb="${b.id}" data-ki="${item.num-1}" aria-label="${label}">
    ${media}
    <span class="card-tech" aria-hidden="true"></span><span class="card-scan" aria-hidden="true"></span>
    <span class="card-open" aria-hidden="true">↗</span>
    <figcaption class="fc-tag">${label}｜${currentLang==="zh"?b.zh:b.en}</figcaption>
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
renderFlows();
renderBrands();
watchReveals(document);
if(location.hash && SECTIONS.includes(location.hash.slice(1))){
  setTimeout(()=>document.getElementById(location.hash.slice(1)).scrollIntoView(),100);
}
