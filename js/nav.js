/* ============ 学士库 · 子页面共享库 ============ */
/* 提供：本地存储 / 卡密弹窗 / 额度显示 / 真题下载拦截 / AI 调用 / 公式渲染 */
/* 依赖 kb-data.js 的常量与数据；未引入 kb-data.js 的页面按下方兜底值独立运行 */

if(typeof DEFAULT_WORKER==="undefined"){ var DEFAULT_WORKER="https://api.xskai.com/"; }
if(typeof FREE_DAILY==="undefined"){ var FREE_DAILY=5; }
if(typeof TRACK_CN==="undefined"){ var TRACK_CN={1:"一",2:"二",3:"三"}; }

function todayKey(){ var d=new Date(); return "xsk_free_"+d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function ls(k,v){ if(v===undefined) return localStorage.getItem(k)||""; if(v) localStorage.setItem(k,v); else localStorage.removeItem(k); }
function apiBase(){ return ls("xsk_worker")||DEFAULT_WORKER; }
function curTrack(){ return parseInt(ls("xsk_track")||"1",10); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function freeLeft(){ return Math.max(0, FREE_DAILY-parseInt(localStorage.getItem(todayKey())||"0",10)); }
function bumpFree(){ var k=todayKey(); localStorage.setItem(k,String(parseInt(localStorage.getItem(k)||"0",10)+1)); renderQuota(); }
function bumpCode(){ var l=parseInt(ls("xsk_code_left")||"0",10); if(l>0) ls("xsk_code_left",String(l-1)); renderQuota(); }

/* ---- 卡密弹窗（动态注入，样式在 css/nav.css） ---- */
(function(){
  if(document.getElementById("codeMask")) return;
  var html = '<div class="code-mask" id="codeMask">'
    + '<div class="code-card">'
    + '<h3>输入卡密</h3><p class="sub">免费次数用完后，输入卡密可继续使用。</p>'
    + '<input id="codeInput" placeholder="请输入卡密">'
    + '<div class="code-msg" id="codeMsg"></div>'
    + '<div class="row"><button class="code-cancel" onclick="closeCodeModal()">取消</button>'
    + '<button class="code-ok" onclick="saveCode()">验证并使用</button></div>'
    + '<div style="margin-top:10px;font-size:13px;text-align:center"><a href="pricing.html" style="color:var(--chsi)">没有卡密？去购买 →</a></div>'
    + '</div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
})();
function openCodeModal(){ document.getElementById("codeInput").value=ls("xsk_code"); document.getElementById("codeMask").classList.add("show"); }
function closeCodeModal(){ document.getElementById("codeMask").classList.remove("show"); }
function saveCode(){
  var code=document.getElementById("codeInput").value.trim().toUpperCase();
  var msg=document.getElementById("codeMsg");
  if(!code){ msg.textContent="请输入卡密"; return; }
  msg.textContent="验证中…"; msg.style.color="#6b7280";
  fetch(apiBase()+"verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:code})})
  .then(function(r){ return r.json(); }).then(function(d){
    if(d.valid){ ls("xsk_code",code); ls("xsk_code_left",String(d.left)); msg.textContent="验证成功，剩余 "+d.left+" 次"; msg.style.color="#059669";
      setTimeout(function(){ closeCodeModal(); renderQuota(); },900);
    }else{ msg.textContent=d.reason||"验证失败"; msg.style.color="#dc2626"; }
  }).catch(function(){ msg.textContent="网络错误，请检查后端地址后重试"; msg.style.color="#dc2626"; });
}
function clearCode(){ ls("xsk_code",""); ls("xsk_code_left",""); renderQuota(); }

/* ---- 顶部额度显示 ---- */
function renderQuota(){
  var code=ls("xsk_code"), left=ls("xsk_code_left");
  var el=document.getElementById("quota");
  if(!el) return;
  if(!code){ el.textContent="今日免费 "+freeLeft()+" 次"; return; }
  if(left){ el.textContent="卡密剩余 "+left+" 次"; return; }
  el.textContent="卡密剩余 … 次";
  fetch(apiBase()+"verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:code})})
  .then(function(r){ return r.json(); }).then(function(d){
    if(d.valid && ls("xsk_code")===code){ ls("xsk_code_left",String(d.left)); el.textContent="卡密剩余 "+d.left+" 次"; }
    else if(d && d.reason){ el.textContent="卡密失效"; }
  }).catch(function(){ el.textContent="卡密剩余 ? 次"; });
}

/* ---- 真题下载统一拦截（扣次：卡密 1 次 / 免费 5 次） ---- */
(function(){
  if(window.__ztHooked) return; window.__ztHooked=true;
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href*="/zhenti/"]') : null;
    if(!a) return;
    e.preventDefault();
    var href = a.getAttribute("href");
    var file = decodeURIComponent(href.split("/").pop());
    var name = file.replace(/^math([123])-(\d{4})(-ans)?\.pdf$/, function(m,r,y,ans){
      return "考研" + (r==="1"?"数学一":r==="2"?"数学二":r==="3"?"数学三":"数学") + y + "年" + (ans?"真题解答":"真题") + ".pdf";
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
      var dl = document.createElement("a");
      dl.href = url; dl.download = name;
      document.body.appendChild(dl); dl.click(); dl.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      if(code) bumpCode(); else bumpFree();
    }).catch(function(err){
      if(err && err.msg) alert(err.msg); else alert("下载失败，请稍后再试");
    }).finally(function(){
      a.textContent = oldTxt;
    });
  });
})();

/* ---- AI 调用（带一次网络重试） ---- */
function fetchWorker(url, opts){
  return fetch(url, opts).catch(function(){
    return new Promise(function(resolve, reject){
      setTimeout(function(){ fetch(url, opts).then(resolve, reject); }, 1500);
    });
  });
}
function callWorker(messages, maxTokens){
  var headers={"Content-Type":"application/json"};
  var code=ls("xsk_code");
  if(code) headers["X-Access-Code"]=code;
  return fetchWorker(apiBase(),{method:"POST",headers:headers,body:JSON.stringify({messages:messages,max_tokens:maxTokens||1500})})
  .then(function(r){
    var servedBy=r.headers.get("X-Served-By")||"";
    if(r.status===402) throw {code:402,msg:"今日免费次数已用完，输入卡密可继续使用"};
    if(r.status===403){ clearCode(); throw {code:403,msg:"卡密无效或次数已用完，请重新输入"};}
    if(!r.ok) throw {code:r.status,msg:"后端服务暂时不可用（"+r.status+"），请稍后再试"};
    return r.json().then(function(d){
      if(code) bumpCode();
      return {data:d,servedBy:servedBy};
    });
  });
}
function extractText(data){
  return (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"抱歉，没有拿到有效回答。";
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
    renderMathInElement(el,{delimiters:[{left:"$",right:"$",display:false}],throwOnError:false});
  }
}

/* ---- 导航当前页高亮（按文件名自动） ---- */
(function(){
  var page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".mainnav .nav-btn").forEach(function(a){
    var href = a.getAttribute("href")||"";
    if(href === page) a.classList.add("active");
  });
  document.addEventListener("DOMContentLoaded", renderQuota);
  renderQuota();
})();