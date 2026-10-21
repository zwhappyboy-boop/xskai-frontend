/* ============ 学士库 · 首页逻辑（index.html 专用） ============ */
/* 共享能力（ls/apiBase/callWorker/renderAI/卡密弹窗/额度）由 js/nav.js 提供 */
/* 数据与常量（KB/FREQ/TRACKS/TRACK_CN/TRACK_HINT）由 js/kb-data.js 提供 */

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

/* ---------- 关于/协议弹窗 ---------- */
var ABOUT_TXT={
about:{t:"关于我们",b:"学士库是一个考研数学备考学习站，提供水平诊断、每日计划、名师讲堂、历年真题、公式速查、知识汇总与 AI 解题等功能，帮助考生高效复习。<br><br>联系邮箱：<a href=\"mailto:zwhappyboy@gmail.com\" style=\"color:var(--chsi)\">zwhappyboy@gmail.com</a>"},
privacy:{t:"隐私政策",b:"我们重视您的隐私。本站不会收集您的姓名、电话、身份证等个人身份信息。AI 功能调用仅传输您输入的题目内容，用于生成解答，不会用于其他用途。卡密仅用于次数管理，不关联个人身份。"},
terms:{t:"用户协议",b:"1. 本站内容（考点讲解、AI 生成题目与解析）仅供学习参考，不构成考试承诺。<br>2. 请勿将本站内容用于商业售卖或批量搬运。<br>3. AI 生成内容可能存在错误，请以权威教材和真题为准。<br>4. 使用本站即表示同意以上条款。"},
disclaimer:{t:"免责声明",b:"本站所有内容仅供考研复习参考，不保证与真实考试一致。招生政策、考试时间、报名流程等请以研招网（yz.chsi.com.cn）及各院校官方通知为准。AI 生成的题目与解析为原创模拟题，可能存在错误，使用前请自行判断。"}
};
function showAbout(k){var d=ABOUT_TXT[k];if(!d)return;document.getElementById('aboutTitle').textContent=d.t;document.getElementById('aboutBody').innerHTML=d.b;document.getElementById('aboutModal').style.display='flex';}

/* ---------- 首页区块切换（规划/院校/FAQ） ---------- */
function switchTab(name){
["home","schools","plan","faq"].forEach(function(t){
var el=document.getElementById("tab-"+t); if(!el) return;
el.style.display = t===name? "" : "none";
});
window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------- AI 解题 ---------- */
var SERVED_NAME={gemini:"Gemini",qwen:"千问",deepseek:"DeepSeek","gemini-vision":"Gemini 视觉","qwen-vl":"千问 VL"};
function sysSolve(){ return "你是考研数学（数"+TRACK_CN[curTrack()]+"）解题助手。"+TRACKS[curTrack()].scope+"请按以下四部分作答：一句话点出关键方法；分步写出完整过程，每步注明所用定理或公式；心算验算关键计算步骤，确认无误后再输出最终答案；指出最容易错的地方。所有数学公式必须用 LaTeX 表示（行内公式用 $...$，独立公式用 $$...$$），不要用纯文本近似。矩阵必须用 \\begin{pmatrix}...\\end{pmatrix} 环境（元素间用 & 分隔，行间用 \\\\ 换行），向量、行列式同理用 pmatrix/bmatrix/determinant 环境。控制在 500 字以内。";}
function setTrack(t){
ls("xsk_track",String(t));
var th=document.getElementById("trackHint"); if(th&&TRACK_HINT[t]) th.innerHTML="<b>"+TRACK_HINT[t][0]+"适用</b>："+TRACK_HINT[t][1];
document.querySelectorAll(".track-btn").forEach(function(b){ b.classList.toggle("active",parseInt(b.dataset.tr,10)===t);});
}
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

/* ---------- 图片解题（两步式：先识题再解题，避开 30 秒限制） ---------- */
function compressImage(dataUrl, cb){
var img = new Image();
img.onload = function(){
var MAX=1500, w=img.width, h=img.height, scale=1;
if(!w||!h){ cb(dataUrl); return; }
if(w>MAX||h>MAX){ scale = w>=h ? MAX/w : MAX/h; w=Math.round(w*scale); h=Math.round(h*scale); }
var c=document.createElement("canvas"); c.width=w; c.height=h;
var ctx=c.getContext("2d");
ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
ctx.drawImage(img,0,0,w,h);
var out = c.toDataURL("image/jpeg", 0.85);
if(out.length > 7000000){ out = c.toDataURL("image/jpeg", 0.5); } // 兜底再压
cb(out);
};
img.onerror = function(){ cb(dataUrl); };
img.src = dataUrl;
}
function solveImage(input){
var f = input.files && input.files[0];
if(!f) return;
if(!f.type.startsWith("image/")){ alert("请选择图片文件"); return; }
var reader = new FileReader();
reader.onload = function(){
compressImage(reader.result, function(dataUrl){
// 预览
document.getElementById("imgPrev").innerHTML =
'<img src="'+dataUrl+'" style="max-width:100%;max-height:240px;border-radius:8px;border:1px solid var(--line)">';
if(solving){ input.value=""; return; }
// 图片题入对话区（与文字题同一套聊天流）
var uEl = addMsg("user");
uEl.innerHTML = '<div style="font-size:12.5px;color:var(--muted);margin-bottom:4px">📷 图片题目</div><img src="'+dataUrl+'" style="max-width:100%;max-height:220px;border-radius:8px;border:1px solid var(--line)">';
var aiEl = addMsg("ai"); aiEl.classList.add("loading"); aiEl.textContent="识别图片中的题目…";
solving=true; var btn=document.getElementById("solveBtn"); if(btn) btn.disabled=true;
var base = apiBase().replace(/\/+$/,"");
var userPushed=false;
// 第一步：视觉模型快速提取题目文本（短输出，稳定在 30 秒内）
fetchWorker(base+"/ocr-extract",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:dataUrl,track:curTrack()})})
.then(function(r){
if(!r.ok){ throw {code:r.status,msg:"图片识别失败（"+r.status+"），请重试"}; }
return r.json();
})
.then(function(oc){
var questionText = (oc.text||"").trim();
if(!questionText || questionText.indexOf("未识别到题目")>=0){ throw {code:922,msg:"图片中没有识别到题目，请拍清晰一点再试"}; }
aiEl.textContent="题目已识别，AI 解题中…";
// 第二步：题目文本走文字链解题（快且稳），扣次
solveHistory.push({role:"user",content:"📷 图片题目：\n"+questionText});
userPushed=true;
var msgs=[{role:"system",content:sysSolve()}].concat(solveHistory.slice(-6));
var useQuota=!ls("xsk_code");
return callWorker(msgs,2000).then(function(res){
var text=extractText(res.data);
aiEl.classList.remove("loading");
renderAI(aiEl,text);
var s=document.createElement("div");
s.className="served";
s.textContent="由 "+(SERVED_NAME[res.servedBy]||"AI")+" 作答";
aiEl.appendChild(s);
solveHistory.push({role:"assistant",content:text});
if(useQuota) bumpFree();
});
})
.catch(function(e){
aiEl.classList.remove("loading");
aiEl.textContent=(e&&e.msg)?e.msg:"网络异常，请重试";
if(userPushed && solveHistory.length && solveHistory[solveHistory.length-1].role==="user") solveHistory.pop();
if(e&&e.code===402||e&&e.code===403) setTimeout(openCodeModal,600);
})
.finally(function(){
solving=false; if(btn) btn.disabled=false;
});
input.value="";
});
};
reader.readAsDataURL(f);
}

/* ---------- 招生政策时间轴 ---------- */
var ZS_TIMELINE=[
{t:"研招咨询活动", d:"2026年9月26日–29日，所有招生单位在线答疑", s:"2026-09-26", e:"2026-09-29"},
{t:"预报名", d:"2026年10月9日–12日，每日 9:00–22:00", s:"2026-10-09", e:"2026-10-12"},
{t:"正式报名", d:"2026年10月15日–24日，每日 9:00–22:00，逾期不得补办", s:"2026-10-15", e:"2026-10-24"},
{t:"网上确认", d:"2026年10月底起各省陆续开始，具体时间以报考点公告为准，逾期不予补办", s:"2026-10-26", e:"2026-11-10"},
{t:"准考证下载", d:"考前十天左右开放（预计12月9日前后），凭网报用户名和密码登录研招网自行下载打印", s:"2026-12-09", e:"2026-12-21"},
{t:"初试", d:"2026年12月19日–20日；19日上午政治/管理类综合、下午外国语，20日业务课一、业务课二", s:"2026-12-19", e:"2026-12-20"}
];
function renderZs(){
var box=document.getElementById("homeTimeline"); if(!box) return; box.innerHTML="";
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
}

/* ---------- 倒计时 ---------- */
function renderCountdown(){
var hd=document.getElementById("heroDays");
var hs=document.getElementById("heroSub");
var d0=new Date(); d0.setHours(0,0,0,0);
var dE=Math.round((new Date(2026,11,19)-d0)/864e5), dR=Math.round((new Date(2026,9,24)-d0)/864e5);
if(hd) hd.textContent=dE>0?dE:(dE>=-1?"冲刺":"考完");
if(hs) hs.textContent=(dE>0?"距 2027 研考初试（12.19）还有 "+dE+" 天":(dE>=-1?"2027 研考初试进行中，加油！":"2027 研考初试已结束"))+" · "+(dR>0?"正式报名 "+dR+" 天后截止（10.24 22:00）":(dR===0?"正式报名今日 22:00 截止":"正式报名已结束"));
}

/* ---------- 初始化 ---------- */
setTrack(curTrack());
renderZs();
renderCountdown();
