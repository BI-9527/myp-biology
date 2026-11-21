/* =====================================================================
   Shared classroom kit (configured per lesson by assets/conf.js)
   Header + session nav, team points scoreboard (kept across all pages on the
   board computer), Stand-up/Sit-down quiz, team Quiz Battles, role-play
   cards, big timer, random team picker, drag-and-drop sorters, ordering,
   equation builders, answer reveals, sounds and confetti.
   Everything is stored in this browser only (localStorage); the pages
   still work when storage is blocked.
   ===================================================================== */
(function(){
"use strict";
var CONF=window.KITCONF||{};
var SESS=CONF.sessions||[["index.html","Hub","⌂"]];
var PTS=CONF.points||"pts";
var KP=CONF.key||"his.kit";var K={teams:KP+".teams",done:KP+".done",mute:KP+".mute",theme:"fbl.theme"};
var TEAMC=["#F2361C","#D4A800","#00A6D6","#0068B0"];
var DEF=["Team Red","Team Gold","Team Sky","Team Blue"];
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function get(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function data(id){var n=document.getElementById(id);if(!n)return null;try{return JSON.parse(n.textContent)}catch(e){console.error("Bad JSON in #"+id,e);return null}}
function h(tag,attrs,html){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==="style")e.style.cssText=attrs[k];else e.setAttribute(k,attrs[k])}if(html!=null)e.innerHTML=html;return e}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
var section=+(document.body.getAttribute("data-section")||0);
var LOGO="assets/his-logo.png";

/* ---------------- theme (key shared with the rest of the site) ---------------- */
(function(){var t=get(K.theme,null);if(typeof t!=="string"){try{t=localStorage.getItem(K.theme)}catch(e){t=null}}
  if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);
  else if(matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.setAttribute("data-theme","dark");})();
function toggleTheme(){var c=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",c);try{localStorage.setItem(K.theme,c)}catch(e){}
  document.dispatchEvent(new CustomEvent("themechange"))}

/* ---------------- sound ---------------- */
var AC=null,muted=!!get(K.mute,false);
function ac(){if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==="suspended")AC.resume();return AC}
function tone(f,d,type,vol,when){if(muted)return;var a=ac();if(!a)return;var t=a.currentTime+(when||0);var o=a.createOscillator(),g=a.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.18,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}
var SFX={
  good:function(){tone(660,.14,"triangle");tone(880,.16,"triangle",.18,.12);tone(1320,.25,"triangle",.14,.24)},
  bad:function(){tone(180,.3,"sawtooth",.12);tone(140,.35,"sawtooth",.1,.12)},
  tick:function(){tone(1000,.06,"square",.06)},
  go:function(){tone(523,.12,"square",.1);tone(784,.3,"square",.1,.12)},
  coin:function(){tone(988,.08,"square",.1);tone(1319,.22,"square",.1,.08)},
  end:function(){for(var i=0;i<3;i++)tone(440,.25,"sawtooth",.14,i*.32)},
  whoosh:function(){tone(300,.25,"sine",.08);tone(600,.2,"sine",.06,.08)}};

/* ---------------- confetti ---------------- */
function confetti(x,y,n){if(reduce)return;x=x==null?innerWidth/2:x;y=y==null?innerHeight/3:y;n=n||70;var cols=TEAMC.concat(["#2E8B47","#fff"]);
  for(var i=0;i<n;i++){(function(){var c=h("i",{class:"cf"});c.style.background=cols[i%cols.length];c.style.left=x+"px";c.style.top=y+"px";document.body.appendChild(c);
    var a=Math.random()*Math.PI*2,v=6+Math.random()*10,vx=Math.cos(a)*v,vy=Math.sin(a)*v-8,px=0,py=0,r=Math.random()*360,vr=(Math.random()-.5)*30,life=0;
    (function step(){life++;vy+=.38;vx*=.985;px+=vx;py+=vy;r+=vr;c.style.transform="translate("+px+"px,"+py+"px) rotate("+r+"deg)";c.style.opacity=Math.max(0,1-life/110);if(life<110)requestAnimationFrame(step);else c.remove()})()})()}}

/* ---------------- header ---------------- */
function buildHeader(){
  var done=get(K.done,[]);
  var nav=SESS.map(function(s,i){var cls=(i===section?"on ":"")+(done.indexOf(i)>-1?"done":"");
    return '<a class="'+cls+'" href="'+s[0]+'"'+(i===section?' aria-current="page"':'')+'><span class="n">'+(done.indexOf(i)>-1&&i!==section?"✓":s[2])+'</span>'+s[1]+'</a>'}).join("");
  var top=h("header",{class:"top"},
    '<div class="stripe"></div><div class="top-in">'+
    '<a class="brand" href="index.html" title="Mission hub"><img src="'+LOGO+'" alt="Al-Hayat International School logo"><div><b>'+(CONF.title||'')+'</b><span>'+(CONF.sub||'')+'</span></div></a>'+
    '<nav class="sessions" aria-label="Sessions">'+nav+'</nav>'+
    '<div class="tools">'+
      '<button class="ib" data-tool="teams" title="Show or hide the team scoreboard">🏆</button>'+
      '<button class="ib" data-tool="timer" title="Big classroom timer">⏱</button>'+
      '<button class="ib" data-tool="pick" title="Pick a random team">🎲</button>'+
      '<button class="ib" data-tool="mute" title="Sound on or off">'+(muted?"🔇":"🔊")+'</button>'+
      '<button class="ib" data-tool="board" title="Bigger text for the active board">A+</button>'+
      '<button class="ib" data-tool="fs" title="Full screen">⛶</button>'+
      '<button class="ib" data-tool="theme" title="Light or dark">🌓</button>'+
    '</div></div>');
  document.body.insertBefore(top,document.body.firstChild);
  var on=$("nav.sessions a.on",top);if(on&&on.scrollIntoView)setTimeout(function(){try{on.scrollIntoView({inline:"center",block:"nearest"})}catch(e){}},50);
  $$("[data-tool]",top).forEach(function(b){b.addEventListener("click",function(){ac();var t=b.getAttribute("data-tool");
    if(t==="teams")dock.classList.toggle("hidden");
    else if(t==="timer")openTimer(60,"Timer");
    else if(t==="pick")openPicker();
    else if(t==="mute"){muted=!muted;put(K.mute,muted);b.textContent=muted?"🔇":"🔊";if(!muted)SFX.coin()}
    else if(t==="board"){document.documentElement.classList.toggle("board");b.classList.toggle("on")}
    else if(t==="fs"){if(!document.fullscreenElement){var d=document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)}else document.exitFullscreen()}
    else if(t==="theme")toggleTheme()})});
}

/* ---------------- teams + dock ---------------- */
var dock,teams;
function loadTeams(){var t=get(K.teams,null);if(!t||!t.length||t.length!==4)t=DEF.map(function(n){return{name:n,score:0}});
  t.forEach(function(x,i){x.color=TEAMC[i];x.score=+x.score||0;x.name=x.name||DEF[i]});return t}
function saveTeams(){put(K.teams,teams.map(function(t){return{name:t.name,score:t.score}}))}
function buildDock(){teams=loadTeams();
  dock=h("div",{class:"dock",role:"region","aria-label":"Team scoreboard"});
  var inner='<div class="dock-in"><span class="lbl">Team<br>points</span>';
  teams.forEach(function(t,i){inner+='<div class="team" data-team="'+i+'" style="--tc:'+t.color+'"><span class="tn">'+esc(t.name)+'</span><span class="ts"><span class="v">'+t.score+'</span> <small>'+PTS+'</small></span>'+
    '<button class="minus" aria-label="Take one point from '+esc(t.name)+'">−</button><button class="plus" aria-label="Give one point to '+esc(t.name)+'">+</button></div>'});
  inner+='</div>';dock.innerHTML=inner;document.body.appendChild(dock);
  if(innerWidth<700)dock.classList.add("hidden");
  $$(".team",dock).forEach(function(el){var i=+el.getAttribute("data-team");
    $(".plus",el).onclick=function(){award(i,1,el)};$(".minus",el).onclick=function(){award(i,-1,el)}});
  paintDock()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function paintDock(){var max=Math.max.apply(null,teams.map(function(t){return t.score}));
  $$(".team",dock).forEach(function(el,i){$(".v",el).textContent=teams[i].score;$(".tn",el).textContent=teams[i].name;el.classList.toggle("lead",max>0&&teams[i].score===max)})}
function award(i,n,fromEl){teams[i].score=Math.max(0,teams[i].score+n);saveTeams();paintDock();
  var el=$$(".team",dock)[i];el.classList.remove("bump");void el.offsetWidth;el.classList.add("bump");
  if(n>0){SFX.coin();
    var src=(fromEl&&fromEl.getBoundingClientRect)?fromEl.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};
    var dst=el.getBoundingClientRect();var f=h("div",{class:"floater"},"+"+n+" "+PTS);f.style.background=teams[i].color;
    f.style.left=(src.left+src.width/2-40)+"px";f.style.top=(src.top+src.height/2-20)+"px";document.body.appendChild(f);
    requestAnimationFrame(function(){requestAnimationFrame(function(){f.style.transform="translate("+(dst.left+dst.width/2-src.left-src.width/2)+"px,"+(dst.top-src.top-src.height/2)+"px) scale(.8)";f.style.opacity=".2"})});
    setTimeout(function(){f.remove()},950)}
  document.dispatchEvent(new CustomEvent("scores"))}

/* ---------------- overlays ---------------- */
var ov;
function buildOverlay(){ov=h("div",{class:"ov",role:"dialog","aria-modal":"true"});document.body.appendChild(ov);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&ov.classList.contains("open"))closeOv()})}
var ovCleanup=null;
function openOv(tag,body){if(ovCleanup){ovCleanup();ovCleanup=null}
  ov.innerHTML='<div class="ov-top"><span class="tag">'+tag+'</span><span class="grow"></span><div class="mini-scores" style="display:flex;gap:8px;flex-wrap:wrap"></div><button class="ov-x">✕ Close</button></div><div class="ov-body"></div>';
  $(".ov-body",ov).appendChild(body);$(".ov-x",ov).onclick=closeOv;ov.classList.add("open");document.body.style.overflow="hidden";miniScores()}
function miniScores(){var m=$(".mini-scores",ov);if(!m)return;m.innerHTML=teams.map(function(t){return '<span style="font:900 18px/1 var(--sans);padding:8px 12px;border-radius:10px;background:'+t.color+';color:#fff">'+esc(t.name)+': '+t.score+'</span>'}).join("")}
document.addEventListener("scores",function(){if(ov&&ov.classList.contains("open"))miniScores()});
function closeOv(){if(ovCleanup){ovCleanup();ovCleanup=null}ov.classList.remove("open");ov.innerHTML="";document.body.style.overflow=""}

/* countdown ring helper */
function ring(seconds,onTick,onEnd){var wrap=h("div",{class:"countdown"},'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="8"/><circle class="rg" cx="50" cy="50" r="44" fill="none" stroke="#F8D000" stroke-width="8" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"/></svg><div class="num">'+seconds+'</div>');
  var t0=performance.now(),last=seconds,stop=false;
  (function f(now){if(stop)return;var el=(now-t0)/1000,left=Math.max(0,seconds-el);$(".rg",wrap).setAttribute("stroke-dashoffset",276.5*(1-left/seconds));
    var s=Math.ceil(left);if(s!==last){last=s;$(".num",wrap).textContent=s;if(onTick)onTick(s)}
    if(left<=0){onEnd&&onEnd();return}requestAnimationFrame(f)})(t0);
  wrap.cancel=function(){stop=true};return wrap}

/* ---------------- Stand up / Sit down ---------------- */
function openStandup(items,title){var i=0;var body=h("div",{style:"display:contents"});var cancel=null;
  function show(){if(cancel)cancel();var it=items[i];body.innerHTML="";
    var dots=h("div",{class:"progress-dots"},items.map(function(_,k){return '<i class="'+(k<=i?"on":"")+'"></i>'}).join(""));
    var st=h("div",{class:"statement"},it[0]);
    var ins=h("div",{class:"instr"},'<b class="t">STAND UP</b> if it is TRUE &nbsp;·&nbsp; <b class="f">SIT DOWN</b> if it is FALSE');
    body.appendChild(dots);body.appendChild(st);body.appendChild(ins);
    var go=h("button",{class:"btn gold big"},"▶ Start the countdown");body.appendChild(go);
    go.onclick=function(){go.remove();SFX.go();var r=ring(5,function(s){if(s>0)SFX.tick()},reveal);cancel=r.cancel;body.appendChild(r)}
    function reveal(){var c=$(".countdown",body);if(c)c.remove();var t=!!it[1];(t?SFX.good:SFX.bad)();
      var v=h("div",{class:"verdict "+(t?"t":"f")},t?"TRUE — stand!":"FALSE — sit!");body.insertBefore(v,ins);ins.remove();
      if(it[2])body.appendChild(h("div",{class:"explain"},it[2]));
      var row=h("div",{class:"row",style:"justify-content:center"});
      if(i<items.length-1){var nx=h("button",{class:"btn big"},"Next statement ▶");nx.onclick=function(){i++;show()};row.appendChild(nx)}
      else{var fin=h("button",{class:"btn green big"},"✓ Finished");fin.onclick=closeOv;row.appendChild(fin);confetti()}
      body.appendChild(row)}}
  openOv("🧍 Stand up · Sit down"+(title?" — "+title:""),body);ovCleanup=function(){if(cancel)cancel()};show()}

/* ---------------- Quiz Battle ---------------- */
var SH=["▲","◆","●","■"];
function openBattle(cfg){var qs=cfg.qs,i=0,secs=cfg.seconds||20,pts=cfg.points||2,cancel=null;var body=h("div",{style:"display:contents"});
  function show(){if(cancel)cancel();var q0=qs[i];var perm=shuffle([0,1,2,3].slice(0,q0.o.length));var q={q:q0.q,why:q0.why,double:q0.double,o:perm.map(function(k){return q0.o[k]}),a:perm.indexOf(q0.a)};body.innerHTML="";var p=(q.double?pts*2:pts);
    body.appendChild(h("div",{class:"progress-dots"},qs.map(function(_,k){return '<i class="'+(k<=i?"on":"")+'"></i>'}).join("")));
    body.appendChild(h("div",{class:"instr"},(q.double?"⚡ DOUBLE POINTS ROUND · ":"")+"Round "+(i+1)+" of "+qs.length+" · worth "+p+" "+PTS));
    body.appendChild(h("div",{class:"statement",style:"max-width:36ch"},q.q));
    var opts=h("div",{class:"opts"});q.o.forEach(function(o,k){opts.appendChild(h("div",{class:"opt o"+k},'<span class="sh">'+SH[k]+'</span><span>'+o+'</span>'))});body.appendChild(opts);
    var ins=h("div",{class:"instr"},"Teams: agree quietly, then hold up <b style='color:#F8D000'>1, 2, 3 or 4 fingers</b> when the time is up!");body.appendChild(ins);
    var row=h("div",{class:"row",style:"justify-content:center;align-items:center"});body.appendChild(row);
    var go=h("button",{class:"btn gold big"},"▶ Start "+secs+" s");var skip=h("button",{class:"btn ghost big"},"Reveal now");row.appendChild(go);row.appendChild(skip);
    go.onclick=function(){go.remove();SFX.go();var r=ring(secs,function(s){if(s<=5&&s>0)SFX.tick()},function(){SFX.end();ins.innerHTML="⏰ Time! <b style='color:#F8D000'>Fingers up NOW!</b>"});cancel=r.cancel;row.insertBefore(r,skip)};
    skip.onclick=function(){if(cancel)cancel();reveal()};
    function reveal(){row.innerHTML="";SFX.good();$$(".opt",opts).forEach(function(el,k){el.classList.add(k===q.a?"right":"dim")});
      ins.innerHTML=q.why?q.why:"";ins.className="explain";
      var aw=h("div",{class:"award"});var picked={};teams.forEach(function(t,ti){var b=h("button",{style:"--tc:"+t.color},"✓ "+esc(t.name));b.onclick=function(){picked[ti]=!picked[ti];b.classList.toggle("on")};aw.appendChild(b)});
      body.appendChild(h("div",{class:"instr",style:"font-size:20px"},"Tap every team that showed <b style='color:#F8D000'>"+(q.a+1)+" finger"+(q.a?"s":"")+"</b>, then award:"));
      body.appendChild(aw);
      var r2=h("div",{class:"row",style:"justify-content:center"});var give=h("button",{class:"btn green big"},"🏆 Award +"+p+" "+PTS);
      give.onclick=function(){var any=false;Object.keys(picked).forEach(function(k){if(picked[k]){award(+k,p,aw.children[+k]);any=true}});give.disabled=true;give.textContent=any?"Awarded ✓":"No team this time";if(any)confetti(innerWidth/2,innerHeight*.7,50)};
      r2.appendChild(give);
      if(i<qs.length-1){var nx=h("button",{class:"btn big"},"Next round ▶");nx.onclick=function(){i++;show()};r2.appendChild(nx)}
      else{var fin=h("button",{class:"btn gold big"},"🏁 See the scores");fin.onclick=finish;r2.appendChild(fin)}
      body.appendChild(r2)}}
  function finish(){body.innerHTML="";var srt=teams.map(function(t,k){return[t,k]}).sort(function(a,b){return b[0].score-a[0].score});
    body.appendChild(h("div",{class:"statement"},"🏆 Battle over!"));
    srt.forEach(function(x,r){body.appendChild(h("div",{class:"slot",style:"--tc:"+x[0].color+";font-size:clamp(28px,4vw,52px);min-width:min(700px,90vw)"},(r===0?"👑 ":(r+1)+". ")+esc(x[0].name)+" — "+x[0].score+" "+PTS))});
    confetti();SFX.good();var c=h("button",{class:"btn green big"},"✓ Close");c.onclick=closeOv;body.appendChild(c)}
  openOv("⚔️ Quiz Battle"+(cfg.title?" — "+cfg.title:""),body);ovCleanup=function(){if(cancel)cancel()};show()}

/* ---------------- Role play ---------------- */
function openRoles(cfg){var body=h("div",{style:"display:contents"});
  body.appendChild(h("div",{class:"statement",style:"max-width:40ch"},cfg.title));
  if(cfg.intro)body.appendChild(h("div",{class:"explain"},cfg.intro));
  var g=h("div",{class:"roles"});cfg.roles.forEach(function(r){g.appendChild(h("div",{class:"rolecard",style:"--rc:"+(r[2]||"#fff")},"<b>"+r[0]+"</b><span>"+r[1]+"</span>"))});body.appendChild(g);
  if(cfg.steps){var ol=h("ol",{style:"text-align:left;font:700 clamp(19px,1.9vw,26px)/1.45 var(--sans);max-width:60ch;margin:0"},cfg.steps.map(function(s){return "<li>"+s+"</li>"}).join(""));body.appendChild(ol)}
  var row=h("div",{class:"row",style:"justify-content:center"});
  if(cfg.seconds){var t=h("button",{class:"btn gold big"},"⏱ Start "+(cfg.seconds>=60?(cfg.seconds/60)+" min":cfg.seconds+" s")+" timer");t.onclick=function(){openTimer(cfg.seconds,cfg.title)};row.appendChild(t)}
  var pk=h("button",{class:"btn ghost big"},"🎲 Pick a team to perform");pk.onclick=function(){openPicker()};row.appendChild(pk);
  body.appendChild(row);openOv("🎭 Act it out",body)}

/* ---------------- Timer ---------------- */
function openTimer(sec,label){var total=sec,left=sec,run=false,last=0,raf=0;var body=h("div",{style:"display:contents"});
  body.appendChild(h("div",{class:"statement"},label||"Timer"));
  var big=h("div",{class:"bigtime"});body.appendChild(big);
  var row=h("div",{class:"row",style:"justify-content:center"});var sp=h("button",{class:"btn gold big"},"▶ Start");var rs=h("button",{class:"btn ghost big"},"⟲ Reset");row.appendChild(sp);row.appendChild(rs);body.appendChild(row);
  var pr=h("div",{class:"presets"});[15,30,60,120,180,300].forEach(function(s){var b=h("button",{class:"btn ghost"},s<60?s+" s":(s/60)+" min");b.onclick=function(){total=left=s;stop();paint()};pr.appendChild(b)});body.appendChild(pr);
  function fmt(s){s=Math.ceil(s);return Math.floor(s/60)+":"+("0"+s%60).slice(-2)}
  function paint(){big.textContent=fmt(left);big.classList.toggle("end",left<=0)}
  function loop(now){if(!run)return;var dt=(now-last)/1000;last=now;var before=Math.ceil(left);left=Math.max(0,left-dt);var after=Math.ceil(left);
    if(after!==before&&after<=5&&after>0)SFX.tick();paint();if(left<=0){run=false;sp.textContent="▶ Start";SFX.end();confetti();return}raf=requestAnimationFrame(loop)}
  function stop(){run=false;cancelAnimationFrame(raf);sp.textContent="▶ Start"}
  sp.onclick=function(){if(run){stop();return}if(left<=0)left=total;run=true;last=performance.now();SFX.go();sp.textContent="⏸ Pause";raf=requestAnimationFrame(loop)};
  rs.onclick=function(){stop();left=total;paint()};paint();
  openOv("⏱ Timer",body);ovCleanup=stop}

/* ---------------- Random team picker ---------------- */
function openPicker(){var body=h("div",{style:"display:contents"});body.appendChild(h("div",{class:"statement"},"Who's up?"));
  var slot=h("div",{class:"slot"},"?");body.appendChild(slot);
  var row=h("div",{class:"row",style:"justify-content:center"});var go=h("button",{class:"btn gold big"},"🎲 Spin");row.appendChild(go);body.appendChild(row);
  var num=h("div",{class:"row",style:"justify-content:center"},'<span class="instr">…or a student number from 1 to</span> <input type="number" min="2" max="40" value="25" style="font:800 24px var(--sans);width:90px;padding:8px;border-radius:10px;border:0;text-align:center"> <button class="btn ghost big">Pick a student</button>');body.appendChild(num);
  function spin(list,colors){var k=0,n=18+Math.floor(Math.random()*list.length*2),delay=50;go.disabled=true;
    (function step(){var idx=k%list.length;slot.textContent=list[idx];slot.style.setProperty("--tc",colors?colors[idx]:"#F8D000");SFX.tick();k++;
      if(k<n){delay*=1.09;setTimeout(step,delay)}else{SFX.good();confetti(innerWidth/2,innerHeight/2,40);go.disabled=false}})()}
  go.onclick=function(){var order=shuffle([0,1,2,3]);spin(order.map(function(i){return teams[i].name}),order.map(function(i){return teams[i].color}))};
  $("button",num).onclick=function(){var N=Math.max(2,Math.min(40,+$("input",num).value||25));var l=[];for(var i=1;i<=N;i++)l.push("Student #"+i);spin(shuffle(l))};
  openOv("🎲 Random pick",body)}

/* ---------------- reveal buttons ---------------- */
function wireReveals(root){$$(".reveal>button",root).forEach(function(b){if(b._w)return;b._w=1;var t=b.textContent;b.onclick=function(){var r=b.parentNode;r.classList.toggle("open");b.textContent=r.classList.contains("open")?"Hide answer":t;if(r.classList.contains("open"))SFX.whoosh()}})}

/* ---------------- say() feedback ---------------- */
function say(btn,ok,txt){var fb=btn.parentNode.querySelector(".fb");if(fb){fb.textContent=txt;fb.style.color=ok?"var(--good)":"var(--bad)"}(ok?SFX.good:SFX.bad)();if(ok){var r=btn.getBoundingClientRect();confetti(r.left+r.width/2,r.top,40)}}

/* ---------------- ordering ---------------- */
function wireOrders(){$$("ol.order[data-src]").forEach(function(ol){var steps=data(ol.getAttribute("data-src"));if(!steps)return;var picks=[];
  function build(){picks=[];ol.innerHTML="";var idx=steps.map(function(_,i){return i});do{idx=shuffle(idx)}while(idx.every(function(v,i){return v===i}));
    idx.forEach(function(i){var li=h("li",{tabindex:"0","data-i":i},'<span class="n"></span><span>'+steps[i]+'</span>');
      var act=function(){var p=picks.indexOf(i);if(p>-1)picks.splice(p,1);else picks.push(i);paint()};
      li.onclick=act;li.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();act()}};ol.appendChild(li)});
    var fb=ol.parentNode.querySelector(".fb");if(fb)fb.textContent=""}
  function paint(){$$("li",ol).forEach(function(li){var p=picks.indexOf(+li.getAttribute("data-i"));li.classList.toggle("picked",p>-1);li.classList.remove("ok","no");$(".n",li).textContent=p>-1?p+1:""})}
  var row=h("div",{class:"row"},'<button class="btn">Check order</button><button class="btn ghost">Shuffle</button><span class="fb"></span>');ol.parentNode.insertBefore(row,ol.nextSibling);
  var bs=$$("button",row);bs[1].onclick=build;
  bs[0].onclick=function(){var n=steps.length;if(picks.length<n){say(bs[0],false,"Number all "+n+" steps first.");return}var c=0;
    $$("li",ol).forEach(function(li){var i=+li.getAttribute("data-i"),ok=picks.indexOf(i)===i;if(ok)c++;li.classList.add(ok?"ok":"no")});say(bs[0],c===n,c===n?"Perfect order!":c+" / "+n+" in the right place")};
  build()})}

/* ---------------- equation builders ---------------- */
function wireEqs(){$$("[data-check-eq]").forEach(function(b){b.onclick=function(){var box=document.getElementById(b.getAttribute("data-check-eq")),s=$$("select",box),c=0;
  s.forEach(function(x){var ok=x.value===x.getAttribute("data-ans");x.classList.remove("ok","no");x.classList.add(ok?"ok":"no");if(ok)c++});
  say(b,c===s.length,c===s.length?"Balanced and correct!":c+" / "+s.length+" correct")}})}

/* ---------------- drag-and-drop sorters ---------------- */
var selected=null;
function wireIO(){$$(".io[data-src]").forEach(function(box){var cfg=data(box.getAttribute("data-src"));if(!cfg)return;
  var bins=cfg.bins||[["in","Inputs"],["out","Outputs"]];
  var html='<div class="tray" aria-label="Molecules to sort"></div>';
  if(bins.length===2&&cfg.core){html+='<div class="machine"><div class="bin" data-bin="'+bins[0][0]+'"><h4>'+bins[0][1]+'</h4></div><div class="core" style="color:'+cfg.color+';border-color:'+cfg.color+';background:color-mix(in srgb,'+cfg.color+' 10%,var(--panel))">'+cfg.core+'</div><div class="bin" data-bin="'+bins[1][0]+'"><h4>'+bins[1][1]+'</h4></div></div>'}
  else{html+='<div class="machine multi">'+bins.map(function(b){return '<div class="bin" data-bin="'+b[0]+'"><h4>'+b[1]+'</h4></div>'}).join("")+'</div>'}
  html+='<div class="row" style="margin-top:12px"><button class="btn">Check</button><button class="btn ghost">Reset</button><span class="fb"></span></div>';
  box.innerHTML=html;var tray=$(".tray",box),mach=$(".machine",box);
  function setup(){tray.innerHTML="";$$(".bin",mach).forEach(function(b){$$(".pill",b).forEach(function(p){p.remove()});b.classList.remove("win")});
    shuffle(cfg.items).forEach(function(it){var p=h("span",{class:"pill "+it[1],tabindex:"0","data-ans":it[2]},it[0]);drag(p);tray.appendChild(p)});var fb=$(".fb",box);fb.textContent=""}
  function drag(p){p.addEventListener("pointerdown",function(e){if(e.button>0)return;e.preventDefault();var sx=e.clientX,sy=e.clientY,moved=false;try{p.setPointerCapture(e.pointerId)}catch(_){}
      function mv(ev){var dx=ev.clientX-sx,dy=ev.clientY-sy;if(!moved&&Math.hypot(dx,dy)>6){moved=true;p.classList.add("dragging")}
        if(moved){p.style.transform="translate("+dx+"px,"+dy+"px) scale(1.08)";$$(".bin",mach).forEach(function(b){var r=b.getBoundingClientRect();b.classList.toggle("over",ev.clientX>r.left&&ev.clientX<r.right&&ev.clientY>r.top&&ev.clientY<r.bottom)})}}
      function up(){p.removeEventListener("pointermove",mv);p.removeEventListener("pointerup",up);p.removeEventListener("pointercancel",up);p.classList.remove("dragging");p.style.transform="";
        var t=null;$$(".bin",mach).forEach(function(b){if(b.classList.contains("over"))t=b;b.classList.remove("over")});
        if(moved){if(t)drop(p,t)}else sel(p)}
      p.addEventListener("pointermove",mv);p.addEventListener("pointerup",up);p.addEventListener("pointercancel",up)});
    p.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();sel(p)}})}
  function sel(p){if(selected)selected.classList.remove("sel");selected=(selected===p)?null:p;if(selected)selected.classList.add("sel")}
  function drop(p,b){p.classList.remove("ok","no","sel");b.appendChild(p);selected=null;SFX.tick()}
  $$(".bin",mach).forEach(function(b){b.addEventListener("click",function(){if(selected&&box.contains(selected))drop(selected,b)})});
  var bs=$$(".row button",box);
  bs[0].onclick=function(){var c=0,n=cfg.items.length;$$(".bin",mach).forEach(function(b){$$(".pill",b).forEach(function(p){var ok=p.getAttribute("data-ans")===b.getAttribute("data-bin");p.classList.remove("ok","no");void p.offsetWidth;p.classList.add(ok?"ok":"no");if(ok)c++})});
    if(c===n)$$(".bin",mach).forEach(function(b){b.classList.add("win")});say(bs[0],c===n,c===n?"All correct!":c+" / "+n+" correct"+(tray.children.length?" (some still waiting in the tray)":""))};
  bs[1].onclick=setup;setup()})}

/* ---------------- activity launchers ---------------- */
function wireLaunchers(){
  $$("[data-standup]").forEach(function(b){b.addEventListener("click",function(){ac();var d=data(b.getAttribute("data-standup"));if(d)openStandup(d.items||d,d.title)})});
  $$("[data-battle]").forEach(function(b){b.addEventListener("click",function(){ac();var d=data(b.getAttribute("data-battle"));if(d)openBattle(d)})});
  $$("[data-roles]").forEach(function(b){b.addEventListener("click",function(){ac();var d=data(b.getAttribute("data-roles"));if(d)openRoles(d)})});
  $$("[data-timer]").forEach(function(b){b.addEventListener("click",function(){ac();openTimer(+b.getAttribute("data-timer"),b.getAttribute("data-timer-label")||"Timer")})});
}

/* ---------------- mission complete ---------------- */
function wireMission(){$$(".mission-end").forEach(function(m){var sec=+m.getAttribute("data-section");var done=get(K.done,[]);if(done.indexOf(sec)>-1)m.classList.add("done");
  var b=$("[data-complete]",m);if(b)b.onclick=function(){var d=get(K.done,[]);if(d.indexOf(sec)<0)d.push(sec);put(K.done,d);m.classList.add("done");SFX.good();confetti(innerWidth/2,innerHeight/2,120);
    var a=$$("nav.sessions a")[sec];if(a){a.classList.add("done")}}})}

/* ---------------- boot ---------------- */
function boot(){buildHeader();buildDock();buildOverlay();wireReveals();wireOrders();wireEqs();wireIO();wireLaunchers();wireMission();
  document.addEventListener("pointerdown",function once(){ac();document.removeEventListener("pointerdown",once)},{once:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();

window.KIT={award:award,confetti:confetti,sfx:SFX,say:say,teams:function(){return teams},openTimer:openTimer,openPicker:openPicker,
  setTeamNames:function(names){names.forEach(function(n,i){if(n)teams[i].name=n});saveTeams();paintDock()},
  resetScores:function(){teams.forEach(function(t){t.score=0});saveTeams();paintDock();document.dispatchEvent(new CustomEvent("scores"))},
  resetProgress:function(){put(K.done,[]);},done:function(){return get(K.done,[])},data:data};
})();
