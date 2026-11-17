// Original Hub page and original live backend only. No mocked routes or RPC.
// Optional Playwright is an existing operator test tool, not a product dependency.
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require=createRequire(import.meta.url);
const { chromium }=require('playwright');
const options=new Map();
for(let i=2;i<process.argv.length;i+=2){
  if(!['--hub-url','--output','--alias','--case'].includes(process.argv[i]) || !process.argv[i+1] || options.has(process.argv[i]))throw new Error('invalid finite browser arguments');
  options.set(process.argv[i],process.argv[i+1]);
}
const url=new URL(options.get('--hub-url'));
assert(['127.0.0.1','localhost','[::1]'].includes(url.hostname) && url.protocol==='http:' && !url.username && !url.password && !url.search && !url.hash,'only operator-owned loopback Hub');
const alias=options.get('--alias'), mode=options.get('--case')||'build';
assert(['build','disabled','denied'].includes(mode));
assert(typeof alias==='string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(alias));
const password=process.env.BUILDER_E2E_PASSWORD;
assert(password && password!=='demo','explicit local login configuration required');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../../../../');
const evidence=resolve(root,'.specify/feature/HUB-NEXT/evidence');
const output=resolve(options.get('--output')||'');
assert(output.startsWith(evidence+sep) && !existsSync(output),'new owned evidence directory required');
await mkdir(output,{recursive:true});
const report={schema:'builder-build-live-page/v1',mode,alias,result:'FAIL',browser_posts:0,original_backend:'live; no route interception',checks:[]};
let browser;
async function login(context){
  const page=await context.newPage();
  page.on('request',request=>{if(request.method()==='POST' && new URL(request.url()).pathname==='/api/builder-actions/build')report.browser_posts++;});
  await page.goto(new URL('ui/login?next=/ui/builder',url).href);
  await page.locator('select[name="user"]').selectOption('alice');
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button').click();
  await page.waitForURL('**/ui/builder');
  return page;
}
try{
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
  const context=await browser.newContext(), page=await login(context);
  if(mode==='disabled'){
    assert.equal(await page.locator('#builder-build').count(),0);report.checks.push('old page retains no build UI');
    const response=await context.request.post(new URL('api/builder-actions/build',url).href,{data:{alias},headers:{Origin:url.origin}});assert.equal(response.status(),404);
  }else if(mode==='denied'){
    await page.locator('#build-alias').selectOption(alias);
    await page.locator('#build-submit').click();
    await page.waitForFunction(()=>document.getElementById('build-status')?.textContent.includes('权限'));
    assert.equal(await page.locator('#build-detail').textContent(),'');report.checks.push('revoked response has no receipt/evidence');
  }else{
    await page.waitForFunction(()=>!document.getElementById('build-submit')?.disabled);
    await page.locator('#build-alias').selectOption(alias);await page.locator('#build-submit').click();
    await page.waitForFunction(()=>document.getElementById('build-history')?.children.length>0);
    const history=await context.request.get(new URL('api/builder-actions/builds',url).href);assert.equal(history.status(),200);
    const first=(await history.json()).intents.find(x=>x.alias===alias);assert(first?.command_id);
    await page.screenshot({path:resolve(output,'first-browser.png'),fullPage:true});
    await context.close();
    const second=await browser.newContext(), recovered=await login(second);
    await recovered.waitForFunction(()=>document.getElementById('build-history')?.children.length>0);
    const next=await second.request.get(new URL('api/builder-actions/builds',url).href);assert.equal((await next.json()).intents.find(x=>x.alias===alias)?.command_id,first.command_id);
    await recovered.locator('#build-alias').selectOption(alias);await recovered.locator('#build-submit').click();
    await recovered.waitForFunction(()=>!document.getElementById('build-submit')?.disabled);
    const final=await second.request.get(new URL('api/builder-actions/builds',url).href);assert.equal((await final.json()).intents.filter(x=>x.alias===alias).length,1);
    await recovered.screenshot({path:resolve(output,'new-browser-recovery.png'),fullPage:true});
    report.checks.push('original login and finite source submission','new browser recovers same command without browser storage','repeat submission retains one durable association');
    report.command_id=first.command_id;
    report.host_send_count='must be independently checked in original Host receipt/counters; browser POST count is not Host sends';
    await second.close();
  }
  report.result='PASS';
}catch(error){report.error=String(error);throw error;}
finally{if(browser)await browser.close();await writeFile(resolve(output,'browser-result.json'),JSON.stringify(report,null,2)+'\n');}
