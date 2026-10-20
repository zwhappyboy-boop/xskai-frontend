/* KaTeX 备用 CDN：主 CDN 加载失败时自动切换并重渲染公式 */
(function(){
if(window.katex && window.renderMathInElement) return;
var css=document.createElement("link");
css.rel="stylesheet";
css.href="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.css";
document.head.appendChild(css);
function renderAll(){
if(!window.renderMathInElement) return;
renderMathInElement(document.body,{delimiters:[
{left:"$$",right:"$$",display:true},
{left:"$",right:"$",display:false}
],throwOnError:false});
}
var s1=document.createElement("script");
s1.src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/katex.min.js";
s1.onload=function(){
var s2=document.createElement("script");
s2.src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.11/contrib/auto-render.min.js";
s2.onload=renderAll;
document.head.appendChild(s2);
};
document.head.appendChild(s1);
})();
function showAbout(k){var d=ABOUT_TXT[k];if(!d)return;document.getElementById('aboutTitle').textContent=d.t;document.getElementById('aboutBody').innerHTML=d.b;document.getElementById('aboutModal').style.display='flex';}
// DEFAULT_WORKER / FREE_DAILY 由 index.html 统一定义，这里不再重复声明（避免缓存新旧不一致时旧值覆盖新值）
function curTrack(){ return parseInt(ls("xsk_track")||"1",10);}
function sysSolve(){ return "你是考研数学（数"+TRACK_CN[curTrack()]+"）解题助手。"+TRACKS[curTrack()].scope+"请按以下四部分作答：一句话点出关键方法；分步写出完整过程，每步注明所用定理或公式；心算验算关键计算步骤，确认无误后再输出最终答案；指出最容易错的地方。所有数学公式必须用 LaTeX 表示（行内公式用 $...$，独立公式用 $$...$$），不要用纯文本近似。矩阵必须用 \\begin{pmatrix}...\\end{pmatrix} 环境（元素间用 & 分隔，行间用 \\\\ 换行），向量、行列式同理用 pmatrix/bmatrix/determinant 环境。控制在 500 字以内。";}
function sysQuiz(){
var t=curTrack();
var highs=[],mids=[];
FREQ.forEach(function(r){
if((r.t||[1,2,3]).indexOf(t)<0) return;
if(r.f==="high") highs.push(r.ch); else mids.push(r.ch);
});
var freqTxt="\\n【考频权重】按以下真实考试频率分配 22 道题：\\n";
freqTxt+="高频章节（多出题，选择+填空优先覆盖）："+highs.join("、")+"\\n";
if(mids.length) freqTxt+="中频章节（少量覆盖）："+mids.join("、")+"\\n";
freqTxt+="解答题 6 道中至少 4 道出自高频章节，压轴题从高频章节出。\\n";
var ban="";
if(t===2) ban="\\n【严禁超纲】数二绝对不许出：向量代数与空间解析几何、三重积分、曲线积分、曲面积分、无穷级数（含敛散性判别、幂级数）。多元函数积分学只出二重积分。\\n";
if(t===3) ban="\\n【严禁超纲】数三绝对不许出：向量代数与空间解析几何、三重积分、曲线积分、曲面积分。无穷级数只出常数项级数敛散性判别与幂级数（不考傅里叶级数）。\\n";
return "你是考研数学（数"+TRACK_CN[t]+"）命题助手。"+TRACKS[t].scope+ban+"出一整套真题风格的模拟试卷，结构对标 2021 年后考研数学：\\n一、选择题：10 小题，每小题 5 分，共 50 分\\n二、填空题：6 小题，每小题 5 分，共 30 分\\n三、解答题：6 小题，共 70 分\\n"+freqTxt+"难度分层（对标近5年真题）：选择前6基础后4中等偏难（含易错陷阱）；填空前3基础后3中等；解答1-2道中等、3-5道偏难（2知识点交叉）、第6道压轴（3知识点综合）。不考偏题怪题，不出计算量爆炸的题。公式用 LaTeX（$...$ / $$...$$）。只输出题干，不要给答案和解析。";}
function itemShown(item,chT){ var t=item.t||chT||[1,2,3]; return t.indexOf(curTrack())>=0;}
function visChapters(){ return KB.filter(function(sec){ return sec.items.some(function(it){ return itemShown(it,sec.t);});});}
function trackStats(t){
var nCh=0,nIt=0;
KB.forEach(function(sec){ var c=0; sec.items.forEach(function(it){ var tt=it.t||sec.t||[1,2,3]; if(tt.indexOf(t)>=0) c++;}); if(c>0){ nCh++; nIt+=c;}});
return {ch:nCh,it:nIt};
}
function updateTabLabel(){
var t=curTrack(), tcn="数"+TRACK_CN[t];
var kb=document.getElementById("tabKb"); if(kb) kb.textContent=tcn+"·知识点";
var zt=document.getElementById("tabZt"); if(zt) zt.textContent=tcn+"·真题";
var qt=document.getElementById("quizTrack"); if(qt) qt.textContent="（"+tcn+"）";
}
function setTrack(t){
ls("xsk_track",String(t));
var th=document.getElementById("trackHint"); if(th&&TRACK_HINT[t]) th.innerHTML="<b>"+TRACK_HINT[t][0]+"适用</b>："+TRACK_HINT[t][1];
document.querySelectorAll(".track-btn").forEach(function(b){ b.classList.toggle("active",parseInt(b.dataset.tr,10)===t);});
activeCh=0; switchSub("study","kb");
var tcn="数"+TRACK_CN[t];
var kb=document.getElementById("tabKb"); if(kb) kb.textContent=tcn+"·知识点";
var zt=document.getElementById("tabZt"); if(zt) zt.textContent=tcn+"·真题";
var qt=document.getElementById("quizTrack"); if(qt) qt.textContent="（"+tcn+"）";
renderChNav(); renderKb(); renderFreq(); renderScope(); renderHome();
}
function renderScope(){
var nCh=0,nIt=0;
visChapters().forEach(function(sec){ nCh++; sec.items.forEach(function(it){ if(itemShown(it,sec.t)) nIt++;});});
var ex=TRACKS[curTrack()].excl;
var _sn=document.getElementById("scopeNote"); if(_sn) _sn.textContent="当前：数"+TRACK_CN[curTrack()]+" · "+nCh+" 章 "+nIt+" 考点"+(ex?" · "+ex:" · 覆盖全部 "+KB.length+" 章");
var _bs=document.getElementById("bannerScope"); if(_bs) _bs.textContent="数"+TRACK_CN[curTrack()]+(ex?" · "+ex:"覆盖全部 "+KB.length+" 章")+" · 先啃高频，再补中频";
var _a=document.getElementById("stCh"); if(_a) _a.textContent=nCh;
var _b=document.getElementById("stIt"); if(_b) _b.textContent=nIt;
}

function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function ls(k,v){
if(v===undefined) return localStorage.getItem(k)||"";
if(v) localStorage.setItem(k,v); else localStorage.removeItem(k);
}
function renderAI(el,text){
var pieces=String(text).split(/\$\$([\s\S]+?)\$\$/), html="";
for(var i=0;i<pieces.length;i++){
if(i%2===1){
var block="";
try{ if(window.katex) block=katex.renderToString(pieces[i],{displayMode:true,throwOnError:false}); }catch(e){ block=""; }
html += block? '<div class="ai-block">'+block+"</div>" : "<p>"+esc("$$"+pieces[i]+"$$")+"</p>";
}else{
html += "<p>"+esc(pieces[i]).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n{2,}/g,"</p><p>").replace(/\n/g,"<br>")+"</p>";
}
}
el.innerHTML = html;
if(window.renderMathInElement){
renderMathInElement(el,{delimiters:[
{left:"$",right:"$",display:false}
],throwOnError:false});
}
}
function switchTab(name){
["home","study","schools","plan","faq"].forEach(function(t){
document.getElementById("tab-"+t).style.display = t===name? "": "none";
});
document.querySelectorAll("nav.mainnav button").forEach(function(b){
b.classList.toggle("active", b.dataset.tab===name);
});
window.scrollTo({top:0,behavior:"smooth"});
}
function switchSub(group,name){
document.querySelectorAll("#"+group+"Subnav button").forEach(function(b){
b.classList.toggle("active", b.dataset.sub===name);
});
document.querySelectorAll('.subsec[data-group="'+group+'"]').forEach(function(s){
s.style.display = s.dataset.sub===name? "": "none";
});
if(group==="study"){ var sb=document.getElementById("aiSolveBtn"); if(sb) sb.classList.toggle("active", name==="solve"); var st=document.getElementById("tab-study"); if(st) st.classList.toggle("solve-mode", name==="solve"); }
}
function goStudy(sub){ switchTab("study"); switchSub("study",sub);}

/* ---------- 免费次数 ---------- */
function todayKey(){
var d=new Date();
return "xsk_free_"+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}
function freeLeft(){ return Math.max(0, FREE_DAILY-parseInt(localStorage.getItem(todayKey())||"0",10));}
function bumpFree(){
var k=todayKey();
localStorage.setItem(k,String(parseInt(localStorage.getItem(k)||"0",10)+1));
renderQuota();
}
// 卡密调用成功后：本地剩余减一并刷新显示（后端为准，此处仅用于显示）
function bumpCode(){
var l=parseInt(ls("xsk_code_left")||"0",10);
if(l>0) ls("xsk_code_left",String(l-1));
renderQuota();
}
function renderQuota(){
var code=ls("xsk_code"), left=ls("xsk_code_left");
var el=document.getElementById("quota");
if(!el) return;
if(!code){ el.textContent="今日免费 "+freeLeft()+" 次"; return; }
if(left){ el.textContent="卡密剩余 "+left+" 次"; return; }
// 有卡密但本地没存剩余数（旧版输入/验证失败）：实时向后端查一次
el.textContent="卡密剩余 … 次";
fetchWorker(apiBase()+"verify",{
method:"POST", headers:{"Content-Type":"application/json"},
body:JSON.stringify({code:code})
}).then(function(r){ return r.json(); }).then(function(d){
if(d.valid && ls("xsk_code")===code){
ls("xsk_code_left",String(d.left));
el.textContent="卡密剩余 "+d.left+" 次";
}else if(d && d.reason){
el.textContent="卡密失效";
}
}).catch(function(){ el.textContent="卡密剩余 ? 次"; });
}
// 验证卡密（调用后端 /verify，不扣次数）
function saveCode(){
var code=document.getElementById("codeInput").value.trim().toUpperCase();
var msg=document.getElementById("codeMsg");
if(!code){ msg.textContent="请输入卡密"; msg.style.color="#dc2626"; return; }
msg.textContent="验证中…"; msg.style.color="#6b7280";
fetchWorker(apiBase()+"verify",{
method:"POST", headers:{"Content-Type":"application/json"},
body:JSON.stringify({code:code})
}).then(function(r){ return r.json(); }).then(function(d){
if(d.valid){
ls("xsk_code",code); ls("xsk_code_left",String(d.left));
msg.textContent="验证成功，剩余 "+d.left+" 次"; msg.style.color="#059669";
setTimeout(function(){ closeCodeModal(); renderQuota(); },900);
}else{
msg.textContent=d.reason||"验证失败"; msg.style.color="#dc2626";
}
}).catch(function(){
msg.textContent="网络错误，请检查后端地址后重试"; msg.style.color="#dc2626";
});
}
// 清除卡密
function clearCode(){ ls("xsk_code",""); ls("xsk_code_left",""); renderQuota(); }

/* ---------- 后端调用（Key 在 Worker 环境变量，前端无 Key） ---------- */
function apiBase(){ return ls("xsk_worker")||DEFAULT_WORKER;}
// 带自动重试的请求：网络层失败（连不上/断流）时隔 1.5 秒静默重试一次，应对间歇性网络抖动
function fetchWorker(url, opts){
  return fetch(url, opts).catch(function(e){
    return new Promise(function(resolve, reject){
      setTimeout(function(){ fetch(url, opts).then(resolve, reject); }, 1500);
    });
  });
}
function callWorker(messages,maxTokens){
var headers={"Content-Type":"application/json"};
var code=ls("xsk_code");
if(code) headers["X-Access-Code"]=code;
return fetchWorker(apiBase(),{
method:"POST", headers:headers,
body:JSON.stringify({messages:messages,max_tokens:maxTokens||1500})
}).then(function(r){
var servedBy=r.headers.get("X-Served-By")||"";
if(r.status===402) throw {code:402,msg:"今日免费次数已用完，输入卡密可继续使用"};
if(r.status===403){ clearCode(); throw {code:403,msg:"卡密无效或次数已用完，请重新输入"};}
if(!r.ok) throw {code:r.status,msg:"后端服务暂时不可用（"+r.status+"），请稍后再试"};
return r.json().then(function(d){
// 卡密调用成功，本地剩余额度减一（后端为准，此处仅用于显示）
if(code){ var l=parseInt(ls("xsk_code_left")||"0",10); if(l>0) ls("xsk_code_left",String(l-1)); renderQuota(); }
return {data:d,servedBy:servedBy};});
});
}
function extractText(data){
return (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"抱歉，没有拿到有效回答。";
}
/* ---------- 数据 ---------- */
/* ---------- 首页 ---------- */
function shortChName(full){
var s=full.split(" · ");
s=s.length>1?s[1]:s[0];
return s.split("（")[0];
}
function renderHome(){
var grid=document.getElementById("svcGrid"); if(!grid) return; grid.innerHTML="";
var cards=[
{title:"高数学习",desc:"知识点 · 真题 · AI 解题",go:function(){ goStudy("kb");}},
{title:"高数水平诊断",desc:"15 分钟测出你的高数薄弱点 · 专属提分报告",go:function(){ location.href="diagnose.html";}},
{title:"招生政策",desc:"政策通知 · 关键时间",go:function(){ switchTab("policy");}},
{title:"目标院校",desc:"一本及以上 · 按地区找学校",go:function(){ switchTab("schools"); }},
{title:"备考规划",desc:"基础 → 强化 → 冲刺三阶段",go:function(){ switchTab("plan");}},
{title:"常见问题",desc:"数一二三区别 · 试卷结构 · 真题用法",go:function(){ switchTab("faq");}},
{title:"2027研考时间",desc:"正式报名进行中 · 12月19–20日初试",go:function(){ switchTab("policy");}}
];
cards.forEach(function(c){
var d=document.createElement("div");
d.className="svc";
d.innerHTML='<div class="st">'+esc(c.title)+'</div><div class="sd">'+esc(c.desc)+'</div><div class="go">进入 →</div>';
d.onclick=c.go;
grid.appendChild(d);
});
}

/* ---------- 知识点渲染 ---------- */
var activeCh=0;
function renderChNav(){
var nav=document.getElementById("chNav"); nav.innerHTML="";
var secs=visChapters();
if(activeCh>=secs.length) activeCh=0;
secs.forEach(function(sec,i){
var b=document.createElement("button");
b.textContent=sec.ch.split(" · ")[0];
b.title=sec.ch;
b.className=i===activeCh?"active":"";
b.onclick=function(){ activeCh=i; renderChNav(); renderKb();};
nav.appendChild(b);
});
}
function renderKb(){
var box=document.getElementById("kbContent"); box.innerHTML="";
var secs=visChapters();
if(activeCh>=secs.length) activeCh=0;
var sec=secs[activeCh];
if(!sec) return;
sec.items.forEach(function(item){
if(!itemShown(item,sec.t)) return;
var d=document.createElement("div");
d.className="kb-item";
d.innerHTML='<div class="kb-head"><div class="kb-q">'+esc(item.q)+'</div>'+
'<span class="badge '+(item.f==="high"?"high":"mid")+'">'+(item.f==="high"?"高频":"中频")+'</span></div>'+
'<div class="kb-a"><p><span class="lbl">核心：</span>'+esc(item.core)+'</p>'+
'<p><span class="lbl">易错：</span>'+esc(item.pit)+'</p>'+
'<p><span class="lbl">口诀：</span>'+esc(item.tip)+'</p>'+
(item.ex?'<p class="ex"><span class="lbl">例题：</span>'+esc(item.ex)+'<br><span class="lbl">解析：</span>'+esc(item.exa)+'</p>':'')+
(item.z?'<p class="zhen"><span class="lbl">真题：</span><b>'+esc(item.z.y)+'</b> '+esc(item.z.q)+'<br><span class="lbl">思路：</span>'+esc(item.z.a)+'</p>':'')+
(item.v?'<p class="vid"><button class="vid-btn" data-bv="'+esc(item.v)+'" onclick="playVid(event,this)">▶ 视频讲解</button>'+(item.vt?'<span class="vid-meta">'+esc(item.vt)+'</span>':'')+'</p>':'<p class="vid"><a href="https://search.bilibili.com/all?keyword='+encodeURIComponent(item.q+' 考研数学')+'" target="_blank" rel="noopener">视频讲解 →</a></p>')+'</div>';
d.onclick=function(e){
d.classList.toggle("open");
};
box.appendChild(d);
});
if(window.renderMathInElement){
renderMathInElement(box,{delimiters:[
{left:"$$",right:"$$",display:true},
{left:"$",right:"$",display:false}
],throwOnError:false});
}
}
function playVid(e,btn){
e.stopPropagation();
var raw=btn.getAttribute("data-bv"), bv=raw, p="";
var qi=raw.indexOf("?p=");
if(qi>=0){ bv=raw.slice(0,qi); p=raw.slice(qi+3); }
var url="https://player.bilibili.com/player.html?bvid="+encodeURIComponent(bv);
if(p) url+="&p="+encodeURIComponent(p);
btn.parentNode.innerHTML='<iframe src="'+url+'" width="100%" height="320" frameborder="0" allowfullscreen="true" style="border-radius:8px;background:#000"></iframe>';
}

/* ---------- AI 解题 ---------- */
var solveHistory=[], solving=false;
function addMsg(role){
var chat=document.getElementById("chat");
var tip=chat.querySelector(".empty-tip"); if(tip) tip.remove();
var d=document.createElement("div");
d.className="msg "+role;
chat.appendChild(d);
d.scrollIntoView({behavior:"smooth",block:"nearest"});
return d;
}
function solve(){
if(solving) return;
var ta=document.getElementById("prob");
var question=ta.value.trim();
if(!question){ ta.focus(); return;}
var uEl=addMsg("user"); uEl.textContent=question;
var aiEl=addMsg("ai"); aiEl.classList.add("loading"); aiEl.textContent="解题中…";
solving=true; document.getElementById("solveBtn").disabled=true;
solveHistory.push({role:"user",content:question});
var msgs=[{role:"system",content:sysSolve()}].concat(solveHistory.slice(-6));
var useQuota=!ls("xsk_code");
callWorker(msgs,2000).then(function(res){
var text=extractText(res.data);
aiEl.classList.remove("loading");
renderAI(aiEl,text);
var s=document.createElement("div");
s.className="served";
s.textContent="由 "+(SERVED_NAME[res.servedBy]||"AI")+" 作答";
aiEl.appendChild(s);
solveHistory.push({role:"assistant",content:text});
if(useQuota) bumpFree();
}).catch(function(e){
aiEl.classList.remove("loading");
aiEl.textContent=e.msg||"网络异常，请重试";
solveHistory.pop();
if(e.code===402||e.code===403) setTimeout(openCodeModal,600);
}).finally(function(){
solving=false; document.getElementById("solveBtn").disabled=false;
});
}

/* ---------- 真题 ---------- */
function renderFreq(){
renderZt();
}
function renderZt(){
var t=curTrack();
document.querySelectorAll(".zt-year span[data-t]").forEach(function(sp){
sp.style.display = (parseInt(sp.getAttribute("data-t"),10)===t) ? "" : "none";
});
document.querySelectorAll(".zt-year").forEach(function(yr){
var vis=yr.querySelector('span[data-t]:not([style*="none"])');
yr.style.display = vis ? "" : "none";
});
renderZtAnalysis();
}
/* ---------- 真题考点分析 + 智能组卷 ---------- */
function renderZtAnalysis(){
var t=curTrack();
var lbl=document.getElementById("ztTrackLabel"); if(lbl) lbl.textContent="数"+TRACK_CN[t];
var box=document.getElementById("ztFreqBox"); if(!box) return;
var rows=FREQ.filter(function(r){ return (r.t||[1,2,3]).indexOf(t)>=0; });
var highs=rows.filter(function(r){return r.f==="high";}).length;
var html=rows.map(function(r,i){
var high=r.f==="high";
var w=high?92:58;
return '<div class="zt-freq"><div class="fname">'+esc(r.ch)+'</div><div class="fbar"><i style="width:'+w+'%"></i></div><div class="flv" style="color:'+(high?"#dc2626":"#d97706")+'">'+(high?"高频":"中频")+'</div></div>';
}).join("");
box.innerHTML=html+'<div style="font-size:12px;color:var(--muted);margin-top:10px">高频 '+highs+' 章（条形长度示意考频强度）· 高频章节覆盖历年约 70% 分值，优先吃透</div>';
renderZpChapters();
}
var zpSel=[];
function renderZpChapters(){
var box=document.getElementById("zpChapters"); if(!box) return;
var t=curTrack();
var chapters=FREQ.filter(function(r){ return (r.t||[1,2,3]).indexOf(t)>=0; }).map(function(r){return r.ch;});
box.innerHTML="";
chapters.forEach(function(ch){
var b=document.createElement("span");
b.className="zpc"+(zpSel.indexOf(ch)>=0?" on":"");
b.textContent=ch;
b.onclick=function(){
var i=zpSel.indexOf(ch);
if(i>=0) zpSel.splice(i,1); else zpSel.push(ch);
renderZpChapters();
};
box.appendChild(b);
});
}
function genSmartPaper(){
var out=document.getElementById("zpOut");
var btn=document.getElementById("zpBtn");
var chapters=zpSel.slice();
var years=document.getElementById("zpYears").value;
var diff=document.getElementById("zpDiff").value;
if(quizAsking) return;
if(!chapters.length){ alert("请至少选择一个章节（点上方章节标签选中）"); return; }
quizAsking=true;
btn.disabled=true; btn.textContent="AI 组卷中…（约 30 秒）";
out.classList.add("show");
out.innerHTML="<span style='color:#9ca3af'>AI 正在按你的要求定制试卷（章节："+chapters.join("、")+"），请稍候…</span>";
var t=curTrack();
var sys="你是考研数学（数"+TRACK_CN[t]+"）命题助手。请出一套定制练习卷，要求：\n1. 只考查以下章节："+chapters.join("、")+"\n2. 难度定位："+diff+"\n3. 参考近"+years+"年真题的命题风格与计算量\n4. 题量：8~12 题（难度低就多出，难度高就少出），每题标注分值\n5. 题末用一行「考点：xxx」标注每题考查的具体知识点\n6. 不给答案，末尾提示「做完后可把答案拍照发给本站 AI 解题批改」\n7. 公式用 LaTeX（$...$ / $$...$$）";
callWorker([
{role:"system",content:sys},
{role:"user",content:"请出这套定制练习卷。"}
],3000).then(function(res){
renderAI(out,extractText(res.data));
if(window.renderMathInElement) renderMathInElement(out,{delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}],throwOnError:false});
}).catch(function(e){
out.textContent=e.msg||"组卷失败，请重试";
if(e.code===402||e.code===403) setTimeout(openCodeModal,600);
}).finally(function(){
quizAsking=false; btn.disabled=false; btn.textContent="AI 组卷 →";
});
}
function toggleDecade(btn){
var dec=btn.parentNode;
var yrs=dec.querySelector(".zt-years");
var open=dec.classList.toggle("open");
yrs.style.display=open?"":"none";
}
var quizAsking=false,lastQuizQ="";
function genPaper(){
if(quizAsking) return;
quizAsking=true;
var btn=document.getElementById("quizBtn"); btn.disabled=true; btn.textContent="出卷中…";
var qbox=document.getElementById("quizQ");
qbox.classList.add("show"); qbox.classList.remove("show-ans");
var qEl=document.getElementById("quizQText");
qEl.innerHTML="<span style='color:#9ca3af'>AI 正在出一整套试卷（22 题），请稍候…</span>";
document.getElementById("quizAns").innerHTML="";
callWorker([
{role:"system",content:sysQuiz()},
{role:"user",content:"请出一整套数"+TRACK_CN[curTrack()]+"模拟试卷。"}
],3000).then(function(res){
lastQuizQ=extractText(res.data);
lastQuizA="";
renderAI(qEl,lastQuizQ);
}).catch(function(e){
qEl.textContent=e.msg||"出题失败，请重试";
if(e.code===402||e.code===403) setTimeout(openCodeModal,600);
}).finally(function(){
quizAsking=false; btn.disabled=false; btn.textContent="出一套题";
});
}
function genPaperAns(){
if(!lastQuizQ||quizAsking) return;
// 有缓存直接显示，不消耗 AI 调用
if(lastQuizA){
  var ansEl2=document.getElementById("quizAns");
  renderAI(ansEl2,lastQuizA);
  document.getElementById("quizQ").classList.add("show-ans");
  document.getElementById("ansLabel").style.display="block";
  return;
}
quizAsking=true;
var btn=document.getElementById("quizAnsBtn"); btn.disabled=true; btn.textContent="生成中…";
var ansEl=document.getElementById("quizAns");
ansEl.innerHTML="<span style='color:#9ca3af'>正在生成答案…</span>";
document.getElementById("quizQ").classList.add("show-ans");
callWorker([
{role:"system",content:sysSolve()},
{role:"user",content:"下面是一套模拟试卷，请给出每道题的答案。格式要求：分三节，每节用【选择题答案】【填空题答案】【解答题答案】作标题；选择题每题一行如(1) B；填空题每题一行如(11) 4/5；解答题每题分段，先给关键步骤再给最终结果，每题之间空一行。公式用 LaTeX（$...$ / $$...$$）。\n"+lastQuizQ}
],3000).then(function(res){
lastQuizA=extractText(res.data);
renderAI(ansEl,lastQuizA);
document.getElementById("ansLabel").style.display="block";
}).catch(function(e){
ansEl.textContent=e.msg||"生成失败，请重试";
}).finally(function(){
quizAsking=false; btn.disabled=false; btn.textContent="看答案";
});
}

/* ---------- 招生政策 ---------- */
function renderZs(){
["homeTimeline"].forEach(function(id){
var box=document.getElementById(id); if(!box) return; box.innerHTML="";
var now=new Date(); now.setHours(0,0,0,0);
ZS_TIMELINE.forEach(function(x){
var s=new Date(x.s+"T00:00:00"), e=new Date(x.e+"T23:59:59");
var st, cls;
if(now<s){ st="未开始"; cls="todo";}
else if(now>e){ st="已结束"; cls="done";}
else { st="进行中"; cls="doing";}
var li=document.createElement("li");
li.innerHTML='<span class="badge '+cls+'">'+st+'</span><span class="t">'+esc(x.t)+'</span><span class="d">'+esc(x.d)+'</span>';
box.appendChild(li);
});
});
}

/* ---------- 弹窗 ---------- */
// openCodeModal / closeCodeModal / saveCode 由 index.html 统一定义（saveCode 为带 /verify 验证的版本），此处不再重复声明
function changeApi(){
var v=prompt("后端接口地址：",apiBase());
if(v&&v.trim()){ ls("xsk_worker",v.trim().replace(/\/*$/,"/")); alert("已更新，刷新页面生效。");}
}

function renderCountdown(){
var hd=document.getElementById("heroDays");
var hs=document.getElementById("heroSub");
var d0=new Date(); d0.setHours(0,0,0,0);
var dE=Math.round((new Date(2026,11,19)-d0)/864e5), dR=Math.round((new Date(2026,9,24)-d0)/864e5);
if(hd) hd.textContent=dE>0?dE:(dE>=-1?"冲刺":"考完");
if(hs) hs.textContent=(dE>0?"距 2027 研考初试（12.19）还有 "+dE+" 天":(dE>=-1?"2027 研考初试进行中，加油！":"2027 研考初试已结束"))+" · "+(dR>0?"正式报名 "+dR+" 天后截止（10.24 22:00）":(dR===0?"正式报名今日 22:00 截止":"正式报名已结束"));
var el=document.getElementById("countdownBar"); if(!el) return;
var s1=dE>0?"距离2027年研考初试（12月19日）还有 <b>"+dE+" 天</b>":(dE>=-1?"2027年研考初试进行中，加油！":"2027年研考初试已结束");
var s2=dR>0?"正式报名进行中，<b>"+dR+" 天</b>后截止（10月24日 22:00）":(dR===0?"<b>正式报名今日 22:00 截止</b>":"正式报名已结束");
el.innerHTML="<span>"+s1+"</span><span class=\"cdot\">·</span><span>"+s2+"</span>";
}
setTrack(curTrack()); renderQuota(); renderZs(); renderCountdown();

/* ---------- 图片解题 ---------- */
function solveImage(input){
  var f = input.files && input.files[0];
  if(!f) return;
  if(!f.type.startsWith("image/")){ alert("请选择图片文件"); return; }
  var reader = new FileReader();
  reader.onload = function(){
    var dataUrl = reader.result;
    // 预览
    document.getElementById("imgPrev").innerHTML =
      '<img src="'+dataUrl+'" style="max-width:100%;max-height:240px;border-radius:8px;border:1px solid var(--line)">';
    if(solving){ input.value=""; return; }
    // 图片题入对话区（与文字题同一套聊天流）
    var uEl = addMsg("user");
    uEl.innerHTML = '<div style="font-size:12.5px;color:var(--muted);margin-bottom:4px">📷 图片题目</div><img src="'+dataUrl+'" style="max-width:100%;max-height:220px;border-radius:8px;border:1px solid var(--line)">';
    var aiEl = addMsg("ai"); aiEl.classList.add("loading"); aiEl.textContent="识别图片并解题中…";
    solving=true; var btn=document.getElementById("solveBtn"); if(btn) btn.disabled=true;
    // 图片消息写入对话历史，后续文字追问 AI 能记住图里的题目
    solveHistory.push({role:"user",content:[
      {type:"text",text:"请识别图片中的数学题目并完整解答。"},
      {type:"image_url",image_url:{url:dataUrl}}
    ]});
    var msgs=[{role:"system",content:sysSolve()}].concat(solveHistory.slice(-6));
    var useQuota=!ls("xsk_code");
    callWorker(msgs,2000).then(function(res){
      var text=extractText(res.data);
      aiEl.classList.remove("loading");
      renderAI(aiEl,text);
      var s=document.createElement("div");
      s.className="served";
      s.textContent="由 "+(SERVED_NAME[res.servedBy]||"AI")+" 作答";
      aiEl.appendChild(s);
      solveHistory.push({role:"assistant",content:text});
      if(useQuota) bumpFree();
    }).catch(function(e){
      aiEl.classList.remove("loading");
      aiEl.textContent=e.msg||"网络异常，请重试";
      solveHistory.pop();
      if(e.code===402||e.code===403) setTimeout(openCodeModal,600);
    }).finally(function(){
      solving=false; if(btn) btn.disabled=false;
    });
    input.value="";
  };
  reader.readAsDataURL(f);
}

/* ---------- 真题下载：统一拦截，扣次（卡密 1 次 / 无卡密每日免费 5 次） ---------- */
document.addEventListener("click", function(e){
  var a = e.target && e.target.closest ? e.target.closest('a[href*="/zhenti/"]') : null;
  if(!a) return;
  e.preventDefault();
  var href = a.getAttribute("href");
  var file = decodeURIComponent(href.split("/").pop());
  var name = file.replace(/^math([123])-(\d{4})(-ans)?\.pdf$/, function(m,r,y,ans){
    return "考研" + (r==="1"?"数学一":r==="2"?"数学二":"数学三") + y + "年" + (ans?"真题解答":"真题") + ".pdf";
  });
  var code = ls("xsk_code");
  var headers = {};
  if(code) headers["X-Access-Code"] = code;
  var oldTxt = a.textContent;
  a.textContent = "下载中…";
  fetch(href, { headers: headers }).then(function(r){
    if(r.status===402){ openCodeModal(); throw {msg:"今日免费下载次数已用完，输入卡密可继续下载"}; }
    if(r.status===403){ clearCode(); openCodeModal(); throw {msg:"卡密无效或次数已用完，请重新输入"}; }
    if(!r.ok){ throw {msg:"下载失败（"+r.status+"），请稍后再试"}; }
    return r.blob();
  }).then(function(blob){
    var url = URL.createObjectURL(blob);
    var tmp = document.createElement("a");
    tmp.href = url; tmp.download = name;
    document.body.appendChild(tmp); tmp.click();
    setTimeout(function(){ document.body.removeChild(tmp); URL.revokeObjectURL(url); }, 2000);
    if(code){ var l=parseInt(ls("xsk_code_left")||"0",10); if(l>0) ls("xsk_code_left",String(l-1)); renderQuota(); }
  }).catch(function(e){
    alert((e && e.msg) ? e.msg : "下载失败，请稍后再试");
  }).finally(function(){ a.textContent = oldTxt; });
});
updateTabLabel();
