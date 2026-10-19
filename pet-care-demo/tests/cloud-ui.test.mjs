import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/cloud-app.js',import.meta.url),'utf8');
async function run({stored='',fragment='',storageFails=false,authenticated=false}={}){
 const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',className:'',textContent:'',addEventListener(){},querySelectorAll(){return []}});return elements.get(id)};
 const storage=new Map(stored?[['paw-note-cloud-invite',stored]]:[]),requests=[],history=[];
 const context={URLSearchParams,Map,Date,crypto,URL,console,setInterval(){},location:{hash:fragment,pathname:'/index.html',search:'',origin:'https://care.test'},history:{replaceState(...args){history.push(args)}},sessionStorage:{setItem(k,v){if(storageFails)throw Error();storage.set(k,v)},getItem(k){if(storageFails)throw Error();return storage.get(k)}},document:{querySelector:el,addEventListener(){}},fetch:async(path,opts)=>{requests.push({path,opts});return path==='/api/session'?{ok:true,json:async()=>({authenticated,isOwner:false,sharingEnabled:false})}:{ok:false,status:403,json:async()=>({error:'请使用获邀账号登录。'})}}};
 vm.runInNewContext(source,context);await new Promise(r=>setImmediate(r));return {elements,storage,requests,history};
}
test('logged-out email invitation renders top-level sign-in and keeps token out of redirects',async()=>{const token='X'.repeat(43),r=await run({fragment:'#invite='+token});assert.equal(r.storage.get('paw-note-cloud-invite'),token);assert.equal(r.history[0][2],'/index.html');const html=r.elements.get('#card-content').innerHTML;assert.match(html,/使用获邀账号登录/);assert.match(html,/target="_top" href="\/signin-with-chatgpt\?return_to=%2Findex.html"/);assert.ok(!html.includes(token));assert.equal(r.requests[1].opts.headers.Authorization,'Bearer '+token)});
test('return from sign-in restores token from session and offers account correction when needed',async()=>{const token='Y'.repeat(43),r=await run({stored:token,authenticated:true});assert.equal(r.requests[1].opts.headers.Authorization,'Bearer '+token);assert.match(r.elements.get('#card-content').innerHTML,/退出当前账号/)});
test('unavailable session storage gives explicit original-link recovery path',async()=>{const r=await run({fragment:'#invite='+'Z'.repeat(43),storageFails:true});assert.match(r.elements.get('#card-content').innerHTML,/重新打开主人发来的原邀请链接/);assert.match(r.elements.get('#card-content').innerHTML,/使用获邀账号登录/)});
test('first-use guidance states sharing is disabled and local data stays separate',async()=>{const r=await run();const html=r.elements.get('#cloud-app').innerHTML;assert.match(html,/第一次用/);assert.match(html,/当前尚未开放对外邀请/);assert.match(html,/安心动态/);assert.match(html,/旧演示资料与照片不会自动迁移/)});
test('cloud HTML limits scripts and connections to same-origin',()=>{const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/Content-Security-Policy/);assert.match(html,/script-src 'self'/);assert.match(html,/connect-src 'self'/);assert.ok(!/https?:\/\//.test(html));});
