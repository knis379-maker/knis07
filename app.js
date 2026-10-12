const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const KEY='knis-garage-v1';let data=load();let currentFilter='all';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{vehicle:{},entries:[]}}catch{return{vehicle:{},entries:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function euro(n){return new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(Number(n)||0)}
function dateFmt(s){if(!s)return '';const d=new Date(s+'T12:00:00');return d.toLocaleDateString('de-AT')}
function kindName(t){return ({fuel:'Tankvorgang',expense:'Ausgabe',service:'Wartung'})[t]||'Eintrag'}
function icon(t){return ({fuel:'⛽',expense:'€',service:'🔧'})[t]||'•'}
function render(){const v=data.vehicle||{};$('#heroName').textContent=v.name||'Mein Auto';$('#heroMeta').textContent=[v.make,v.model,v.year,v.plate].filter(Boolean).join(' · ')||'Fahrzeugdaten hinzufügen';$('#heroKm').textContent=v.km?Number(v.km).toLocaleString('de-AT')+' km':'—';
const sum=t=>data.entries.filter(e=>!t||e.type===t).reduce((a,e)=>a+Number(e.cost||0),0);
$('#totalCost').textContent=euro(sum());$('#fuelCost').textContent=euro(sum('fuel'));$('#serviceCost').textContent=euro(sum('service'));$('#fuelCount').textContent=data.entries.filter(e=>e.type==='fuel').length+' Tankvorgänge';
const sorted=[...data.entries].sort((a,b)=>b.date.localeCompare(a.date));$('#recentList').innerHTML=sorted.length?sorted.slice(0,4).map(entryHTML).join(''):'Noch keine Einträge. Füge deinen ersten Tankvorgang hinzu.';
const list=sorted.filter(e=>currentFilter==='all'||e.type===currentFilter);$('#allList').innerHTML=list.length?list.map(entryHTML).join(''):'Keine passenden Einträge.';
$('#vName').value=v.name||'';$('#vMake').value=v.make||'';$('#vModel').value=v.model||'';$('#vYear').value=v.year||'';$('#vPlate').value=v.plate||'';$('#vKm').value=v.km||''}
function entryHTML(e){return `<article class="entry"><div class="entry-icon">${icon(e.type)}</div><div class="entry-main"><strong>${esc(e.title||kindName(e.type))}</strong><small>${dateFmt(e.date)} · ${kindName(e.type)}${e.km?' · '+Number(e.km).toLocaleString('de-AT')+' km':''}${e.litres?' · '+e.litres+' l':''}</small>${e.note?`<small>${esc(e.note)}</small>`:''}</div><div class="entry-amount">${euro(e.cost)}</div></article>`}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showView(name){$$('.view').forEach(x=>x.hidden=x.id!=='view-'+name);$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===name))}
function openEntry(type){$('#entryType').value=type;$('#dialogTitle').textContent=kindName(type);$('#eTitle').value=type==='fuel'?'Tankvorgang':type==='service'?'Wartung':'Ausgabe';$('#eDate').value=new Date().toISOString().slice(0,10);$('#eCost').value='';$('#eKm').value='';$('#eLitres').value='';$('#eNote').value='';$('#litresWrap').hidden=type!=='fuel';$('#entryDialog').showModal()}
$$('.tab').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
$$('[data-add]').forEach(b=>b.addEventListener('click',()=>openEntry(b.dataset.add)));
$('#closeDialog').addEventListener('click',()=>$('#entryDialog').close());
$('#vehicleForm').addEventListener('submit',e=>{e.preventDefault();data.vehicle={name:$('#vName').value.trim(),make:$('#vMake').value.trim(),model:$('#vModel').value.trim(),year:$('#vYear').value,plate:$('#vPlate').value.trim(),km:$('#vKm').value};save();showView('overview')});
$('#entryForm').addEventListener('submit',e=>{e.preventDefault();const type=$('#entryType').value;data.entries.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type,title:$('#eTitle').value.trim(),date:$('#eDate').value,cost:Number($('#eCost').value),km:$('#eKm').value,litres:type==='fuel'?$('#eLitres').value:'',note:$('#eNote').value.trim()});if($('#eKm').value&&Number($('#eKm').value)>Number(data.vehicle.km||0))data.vehicle.km=$('#eKm').value;$('#entryDialog').close();save()});
$$('.filter').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));render()}));
$('#exportBtn').addEventListener('click',()=>{const payload={app:'KNIS Garage',exportedAt:new Date().toISOString(),vehicle:data.vehicle,entries:data.entries};download('knis-garage-export.json',JSON.stringify(payload,null,2),'application/json')});
function download(name,content,type){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('#clearBtn').addEventListener('click',()=>{if(confirm('Wirklich alle Einträge löschen? Diese Aktion kann nicht rückgängig gemacht werden.')){data.entries=[];save()}});
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});$('#installBtn').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();