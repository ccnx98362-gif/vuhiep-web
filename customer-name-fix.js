const fs=require('fs');
const p='index.html';
let s=fs.readFileSync(p,'utf8');
const old1="let db=JSON.parse(localStorage.getItem(K)||'null')||structuredClone(seed), syncBusy=false;";
const new1="let db=JSON.parse(localStorage.getItem(K)||'null')||structuredClone(seed), syncBusy=false;\nconst deviceDb=(()=>{try{return JSON.parse(JSON.stringify(db))}catch(e){return null}})();\nfunction saleName(x){return String(x?.name||x?.customerName||x?.customer_name||x?.tenKhach||x?.ten_khach||'').trim()}\nfunction saleMatchKey(x){return [x?.date||'',x?.phone||'',x?.cat||'',x?.index||'',x?.rsph||'',x?.rcyl||'',x?.lsph||'',x?.lcyl||''].join('|')}\nfunction recoverLegacyCustomerNames(){let sources=[];try{if(deviceDb?.sales)sources.push(...deviceDb.sales)}catch(e){}try{let v7=JSON.parse(localStorage.getItem('vuhiep_v7')||'null');if(v7?.sales)sources.push(...v7.sales)}catch(e){}let changed=false;db.sales.forEach(x=>{let n=saleName(x);if(n){if(x.name!==n){x.name=n;changed=true}return}let hit=sources.find(y=>saleName(y)&&((x.id&&y.id===x.id)||(x.phone&&y.phone===x.phone&&x.date===y.date)||(saleMatchKey(x)===saleMatchKey(y))));if(hit){x.name=saleName(hit);changed=true}});return changed}";
if(!s.includes('function recoverLegacyCustomerNames()')){
  if(!s.includes(old1)) throw new Error('startup marker not found');
  s=s.replace(old1,new1);
}
const old2="if(a[0]?.data&&initial){db=a[0].data;normalize();localStorage.setItem(K,JSON.stringify(db));render(active);restoreImportForm()}setSync('Đã đồng bộ')";
const new2="if(a[0]?.data&&initial){db=a[0].data;normalize();let recovered=recoverLegacyCustomerNames();localStorage.setItem(K,JSON.stringify(db));render(active);restoreImportForm();if(recovered){let snap=JSON.parse(JSON.stringify(db));cloudSave(snap)}}setSync('Đã đồng bộ')";
if(s.includes(old2)) s=s.replace(old2,new2);
else if(!s.includes('let recovered=recoverLegacyCustomerNames()')) throw new Error('cloudLoad marker not found');
fs.writeFileSync(p,s);
console.log('customer-name recovery patch applied');
