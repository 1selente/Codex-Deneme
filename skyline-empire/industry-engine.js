(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./industry-data.js'):null);
const E=root.AIR_ENGINE||(typeof require!=='undefined'?require('./mega-engine.js')&&root.AIR_ENGINE:null);
const X=E.expansion;
const r=(n,p=3)=>Math.round((n+Number.EPSILON)*10**p)/10**p;
const cap=(n,a,b)=>Math.min(b,Math.max(a,n));
const get=(k,id)=>D[k].find(z=>z.id===id);
const map=x=>x&&typeof x==='object'&&!Array.isArray(x);
const valid=(key,id)=>typeof id==='string'&&!!get(key,id);
const active=(z,w)=>!!z&&z.until>=w;
const log=(s,name,detail)=>{s.logs.unshift({id:s.nextId++,title:name,detail,week:s.week,type:'good'});s.logs=s.logs.slice(0,70)};
function ensure(s){if(!s||!Array.isArray(s.planes)||!Array.isArray(s.routes))return s;
 if(!map(s.industry))s.industry={};const i=s.industry;
 const ids=(value,key,max)=>[...new Set(Array.isArray(value)?value:[])].filter(id=>valid(key,id)).slice(0,max);
 i.slots=ids(i.slots,'IND_SLOTS',24);i.ancillary=ids(i.ancillary,'IND_ANCILLARY',8);
 i.safety=Array.isArray(i.safety)?i.safety.filter(z=>map(z)&&valid('IND_SAFETY',z.id)&&Number.isSafeInteger(z.until)&&z.until>=0).slice(0,20):[];
 i.safety=i.safety.filter((z,k,a)=>a.findIndex(v=>v.id===z.id)===k);
 i.corporate=Array.isArray(i.corporate)?i.corporate.filter(z=>map(z)&&valid('IND_CORPORATE',z.id)&&Number.isSafeInteger(z.until)&&z.until>=0).slice(0,3):[];
 i.corporate=i.corporate.filter((z,k,a)=>a.findIndex(v=>v.id===z.id)===k);
 i.waves=map(i.waves)?i.waves:{};for(const [hub,id] of Object.entries(i.waves))if(!s.hubs.includes(hub)||!valid('IND_WAVES',id))delete i.waves[hub];
 i.vendors=map(i.vendors)?i.vendors:{};for(const [key,id] of Object.entries(i.vendors))if(!/^(?:[0-9])$/.test(key)||!valid('IND_VENDORS',id)||String(get('IND_VENDORS',id).category)!==key)delete i.vendors[key];
 i.orders=Array.isArray(i.orders)?i.orders.filter(z=>map(z)&&valid('IND_ORDERS',z.id)&&Number.isSafeInteger(z.due)&&z.due>=0&&Number.isFinite(z.balance)&&z.balance>=0).slice(0,3):[];
 i.tactic=map(i.tactic)&&valid('IND_TACTICS',i.tactic.id)&&Number.isSafeInteger(i.tactic.until)?i.tactic:null;
 i.labor=map(i.labor)?i.labor:{};for(const [key,z] of Object.entries(i.labor))if(!/^[0-3]$/.test(key)||!map(z)||!valid('IND_LABOR',z.id)||get('IND_LABOR',z.id).unit!==Number(key)||!Number.isSafeInteger(z.until))delete i.labor[key];
 i.contingency=map(i.contingency)?i.contingency:{};for(const [key,id] of Object.entries(i.contingency))if(!/^[0-3]$/.test(key)||!valid('IND_CONTINGENCY',id)||get('IND_CONTINGENCY',id).threat!==Number(key))delete i.contingency[key];
 i.treasury=Array.isArray(i.treasury)?i.treasury.filter(z=>map(z)&&valid('IND_TREASURY',z.id)&&Number.isSafeInteger(z.due)&&z.due>=0&&Number.isFinite(z.principal)&&z.principal>0).slice(0,3):[];
 i.treasury=i.treasury.filter((z,k,a)=>a.findIndex(v=>v.id===z.id)===k);
 i.weekly=Array.isArray(i.weekly)?i.weekly.filter(z=>map(z)&&Number.isSafeInteger(z.week)).slice(-120):[];
 i.delivered=Number.isSafeInteger(i.delivered)?cap(i.delivered,0,10000):0;
 i.completed=Number.isSafeInteger(i.completed)?cap(i.completed,0,10000):0;
 return s;
}
function pay(s,cost){return Number.isFinite(cost)&&cost>=0&&s.cash>=cost;}
function commit(s,cost,title,detail){s.cash=r(s.cash-cost);log(s,title,detail);return {ok:true,cost}}
function slot(s,id){ensure(s);const p=get('IND_SLOTS',id);if(!p)return {ok:false,error:'Geçersiz slot izni.'};if(s.industry.slots.includes(id))return {ok:false,error:'Bu slot zaten satın alındı.'};if(!s.hubs.includes(p.airport)&&!s.routes.some(z=>z.to===p.airport||z.from===p.airport))return {ok:false,error:'Önce bu havalimanında rota veya merkez aç.'};if(s.level<p.level)return {ok:false,error:`Şirket seviyesi ${p.level} gerekli.`};if(!pay(s,p.cost))return {ok:false,error:'Slot bedeli için nakit yetersiz.'};s.industry.slots.push(id);return commit(s,p.cost,'Öncelikli slot tahsisi',p.name)}
function corporate(s,id){ensure(s);const p=get('IND_CORPORATE',id),i=s.industry;if(!p)return {ok:false,error:'Kurumsal müşteri bulunamadı.'};if(i.corporate.some(z=>z.id===id&&active(z,s.week)))return {ok:false,error:'Anlaşma hâlâ geçerli.'};if(i.corporate.filter(z=>active(z,s.week)).length>=3)return {ok:false,error:'En fazla üç kurumsal yolcu anlaşması.'};if(s.rep<p.rep)return {ok:false,error:`İtibar ${p.rep} gerekli.`};if(!s.routes.some(z=>{const c=D.CITIES.find(c=>c.id===z.to);return z.active&&c?.region===p.region}))return {ok:false,error:'Hedef bölgede aktif rota aç.'};if(!pay(s,p.fee))return {ok:false,error:'Anlaşma başlangıç bedeli yetersiz.'};i.corporate=i.corporate.filter(z=>z.id!==id&&active(z,s.week));i.corporate.push({id,until:s.week+p.duration-1});return commit(s,p.fee,'Kurumsal yolcu ağı',p.name)}
function wave(s,hub,id){ensure(s);const p=get('IND_WAVES',id);if(!p||!s.hubs.includes(hub))return {ok:false,error:'Merkez veya aktarma sistemi bulunamadı.'};if(s.industry.waves[hub]===id)return {ok:false,error:'Bu aktarma dalgası seçili.'};if(s.routes.filter(z=>z.from===hub&&z.active).length<p.minRoutes)return {ok:false,error:`Bu program için ${p.minRoutes} aktif kalkış rotası gerek.`};const cost=.08;if(!pay(s,cost))return {ok:false,error:'Planlama maliyeti karşılanamıyor.'};s.industry.waves[hub]=id;return commit(s,cost,'Aktarma programı',`${hub}: ${p.name}`)}
function vendor(s,id){ensure(s);const p=get('IND_VENDORS',id);if(!p)return {ok:false,error:'Tedarikçi bulunamadı.'};if(s.industry.vendors[p.category]===id)return {ok:false,error:'Zaten bu tedarikçiyle çalışıyorsun.'};const cost=r(.12+p.fee,3);if(!pay(s,cost))return {ok:false,error:'Tedarikçi geçiş maliyeti karşılanamıyor.'};s.industry.vendors[p.category]=id;return commit(s,cost,'Yeni tedarik anlaşması',p.name)}
function order(s,id){ensure(s);const p=get('IND_ORDERS',id);if(!p)return {ok:false,error:'Sipariş teklifi geçersiz.'};if(s.level<p.level)return {ok:false,error:`Uçak için seviye ${p.level} gerekli.`};if(s.industry.orders.length>=3)return {ok:false,error:'Aynı anda en fazla üç uçak sipariş edebilirsin.'};if(s.industry.orders.some(z=>z.id===id))return {ok:false,error:'Bu model için zaten sipariş var.'};const model=D.AIRCRAFT.find(z=>z.id===p.model),total=r(model.price*p.discount),deposit=r(total*p.deposit),balance=r(total-deposit);if(!pay(s,deposit))return {ok:false,error:'Ön ödeme için yeterli nakit yok.'};s.industry.orders.push({id,due:s.week+p.lead,balance,deposit});return commit(s,deposit,'Uçak fabrikası siparişi',`${model.name} · ${p.lead} hafta · Bakiye ${balance} M$`)}
function tactic(s,id){ensure(s);const p=get('IND_TACTICS',id);if(!p)return {ok:false,error:'Rekabet hamlesi geçersiz.'};if(active(s.industry.tactic,s.week))return {ok:false,error:'Aktif bir rakip stratejisi var.'};if(s.rep<p.rep)return {ok:false,error:`İtibar ${p.rep} gerekli.`};if(!pay(s,p.cost))return {ok:false,error:'Rekabet operasyonu için nakit yetersiz.'};s.industry.tactic={id,until:s.week+p.duration-1};return commit(s,p.cost,'Rekabet hamlesi',`${p.name} · ${p.duration} hafta`)}
function safety(s,id){ensure(s);const p=get('IND_SAFETY',id);if(!p)return {ok:false,error:'Emniyet programı bulunamadı.'};if(s.rep<p.rep)return {ok:false,error:`İtibar ${p.rep} gerekli.`};if(s.industry.safety.filter(z=>active(z,s.week)).length>=8)return {ok:false,error:'Aynı anda en fazla sekiz akreditasyon.'};if(s.industry.safety.some(z=>z.id===id&&active(z,s.week)))return {ok:false,error:'Sertifikan geçerli, yenileme zamanı gelmedi.'};if(!pay(s,p.cost))return {ok:false,error:'Denetim bütçesi yetersiz.'};s.industry.safety=s.industry.safety.filter(z=>z.id!==id&&active(z,s.week));s.industry.safety.push({id,until:s.week+p.duration-1});return commit(s,p.cost,'Emniyet sertifikası',`${p.name} · ${p.duration} hafta geçerli`)}
function labor(s,id){ensure(s);const p=get('IND_LABOR',id);if(!p)return {ok:false,error:'Toplu sözleşme bulunamadı.'};if(active(s.industry.labor[p.unit],s.week))return {ok:false,error:'Bu personel grubunun sözleşmesi devam ediyor.'};if(!pay(s,p.signing))return {ok:false,error:'Sözleşme ödeneği yetersiz.'};s.industry.labor[p.unit]={id,until:s.week+p.term-1};return commit(s,p.signing,'Toplu iş sözleşmesi',`${p.name} · ${p.term} hafta`)}
function contingency(s,id){ensure(s);const p=get('IND_CONTINGENCY',id);if(!p)return {ok:false,error:'Kriz önleme planı bulunamadı.'};if(s.industry.contingency[p.threat]===id)return {ok:false,error:'Plan zaten etkin.'};if(!pay(s,p.setup))return {ok:false,error:'Kriz planı için bütçe yetersiz.'};s.industry.contingency[p.threat]=id;return commit(s,p.setup,'İş sürekliliği protokolü',p.name)}
function ancillary(s,id){ensure(s);const p=get('IND_ANCILLARY',id);if(!p)return {ok:false,error:'Yan hizmet bulunamadı.'};if(s.industry.ancillary.includes(id))return {ok:false,error:'Yan hizmet zaten kurulmuş.'};if(s.industry.ancillary.length>=8)return {ok:false,error:'Bir anda en fazla sekiz yan hizmet çalışabilir.'};if(s.level<p.level)return {ok:false,error:`Şirket seviyesi ${p.level} gerekli.`};if(!pay(s,p.capital))return {ok:false,error:'Kurulum maliyeti için nakit yetersiz.'};s.industry.ancillary.push(id);return commit(s,p.capital,'Yeni yan gelir hattı',p.name)}
function bond(s,id){ensure(s);const p=get('IND_TREASURY',id);if(!p)return {ok:false,error:'Hazine ürünü bulunamadı.'};if(s.industry.treasury.some(z=>z.id===id))return {ok:false,error:'Bu vadeli ürün zaten açık.'};if(s.industry.treasury.length>=3)return {ok:false,error:'En fazla üç hazine pozisyonu tutabilirsin.'};const principal=r(p.min*2,2);if(s.cash-principal<2)return {ok:false,error:'Bu yatırım için en az 2 M$ serbest nakit bırakmalısın.'};s.industry.treasury.push({id,due:s.week+p.term,principal});return commit(s,principal,'Hazine yatırım hesabı',`${p.name} · ${principal} M$`)}
function activeItems(s,key){return s.industry[key].filter(z=>active(z,s.week))}
function threatIndex(week,type,region){return cap(.38+.28*Math.sin(week*(.17+type*.024)+region*.83+type)+.13*Math.cos(week*.051+type*1.4),0,1)}
function modifier(s,rr,b){ensure(s);if(!b)return b;const i=s.industry,to=D.CITIES.find(z=>z.id===rr.to),from=D.CITIES.find(z=>z.id===rr.from),slot=i.slots.map(id=>get('IND_SLOTS',id)).find(z=>z.airport===rr.to||z.airport===rr.from);
 const routeCount=s.routes.filter(z=>z.from===rr.from&&z.active).length;const wave=id=>get('IND_WAVES',id);const bank=wave(i.waves[rr.from]);
 const relevant=activeItems(s,'corporate').map(z=>get('IND_CORPORATE',z.id)).filter(z=>z.region===to.region);
 const vendors=Object.values(i.vendors).map(id=>get('IND_VENDORS',id));const certs=activeItems(s,'safety').map(z=>get('IND_SAFETY',z.id));const tactics=active(i.tactic,s.week)?get('IND_TACTICS',i.tactic.id):null;
 const union=Object.values(i.labor).filter(z=>active(z,s.week)).map(z=>get('IND_LABOR',z.id));
 const disruptions=[0,1,2,3].map(t=>{const p=get('IND_CONTINGENCY',i.contingency[t]);return threatIndex(s.week,t,to.region)*(.015+t*.004)*(1-(p?.protection||0))});
 const vendorRisk=vendors.reduce((a,p)=>a+p.risk,0)*.21;
 const disruption=disruptions.reduce((a,b)=>a+b,0)+vendorRisk;
 const safetyScore=certs.reduce((a,p)=>a+p.safety,0);
 const vendorQuality=vendors.reduce((a,p)=>a+p.quality,0);
 const staffing=union.reduce((a,p)=>a+p.morale,0);
 const fatigue=union.reduce((a,p)=>a+p.fatigue,0);
 const transit=bank&&routeCount>=bank.minRoutes?bank.lift*(1+.12*(routeCount-1)):0;
 const congestion=bank?bank.congestion*Math.max(0,routeCount-1):0;
 const help=slot?.delay||0;
 const punctuality=cap((b.punctuality||.9)+help+safetyScore+vendorQuality*.11+staffing*.0008+vendors.filter(z=>[0,4,5,8].includes(z.category)).reduce((a,z)=>a+z.quality*.11,0)-fatigue*.15-disruption-congestion*.23,.5,.999);
 const counter=tactics?tactics.counter*(.5+.5*Math.sin(s.week*.37+to.region)):0;
 const boost=cap(1+(slot?.demand||0)+relevant.reduce((a,p)=>a+p.demand,0)+transit+(tactics?.lift||0)+vendorQuality*.26+vendors.filter(z=>[2,6,9].includes(z.category)).reduce((a,z)=>a+z.quality*.18,0)-(disruption+congestion)*.35-counter*.3,.66,1.44);
 const passengers=cap(Math.round(b.passengers*boost),0,b.seats);
 const fareBonus=1+vendors.filter(z=>[2,3,9].includes(z.category)).reduce((a,z)=>a+z.quality*.3,0);
 const fareIncome=(b.income-b.freight)*(passengers/Math.max(1,b.passengers))*fareBonus;
 const baseCost=b.expense;
 const fuelVendorSaving=vendors.filter(z=>z.category===1).reduce((a,z)=>a+z.quality*.7,0)*(b.fuel||0);
 const partsVendorSaving=vendors.filter(z=>z.category===7).reduce((a,z)=>a+z.quality*.6,0)*baseCost;
 const cost=cap(baseCost*(1+(congestion+disruption)*.36+vendors.reduce((a,z)=>a+z.cost*.025,0)-safetyScore*.13)+(slot?slot.upkeep*.7:0)+counter*(b.income||0)*.08-fuelVendorSaving-partsVendorSaving,0,1e9);
 return {...b,passengers,load:r(passengers/Math.max(1,b.seats),4),income:r(fareIncome+b.freight),expense:r(cost),profit:r(fareIncome+b.freight-cost),punctuality:r(punctuality,4),disruption:r(disruption,5),transferDemand:r(transit,4),slotBoost:r(slot?.demand||0,4)};
}
function overhead(s,weekly,base){ensure(s);const i=s.industry,pax=weekly.reduce((a,z)=>a+z.passengers,0),flights=weekly.reduce((a,z)=>a+z.trips*2,0);
 const slotFees=i.slots.reduce((a,id)=>a+get('IND_SLOTS',id).upkeep,0);
 const vendorFees=Object.values(i.vendors).reduce((a,id)=>a+get('IND_VENDORS',id).fee,0);
 const safetyFees=activeItems(s,'safety').reduce((a,z)=>a+get('IND_SAFETY',z.id).fee,0);
 const laborFees=Object.values(i.labor).filter(z=>active(z,s.week)).reduce((a,z)=>a+get('IND_LABOR',z.id).wage,0);
 const continuityFees=Object.values(i.contingency).reduce((a,id)=>a+get('IND_CONTINGENCY',id).fee,0);
 const transferFees=Object.values(i.waves).reduce((a,id)=>a+get('IND_WAVES',id).cost,0);
 let corporateRevenue=0,corporatePenalty=0,corporateFulfilled=0;
 for(const deal of activeItems(s,'corporate')){const p=get('IND_CORPORATE',deal.id),segments=weekly.filter(z=>D.CITIES.find(c=>c.id===s.routes.find(rr=>rr.id===z.id)?.to)?.region===p.region);
 const localPax=segments.reduce((a,z)=>a+z.passengers,0),punct=segments.length?segments.reduce((a,z)=>a+(z.punctuality||.9)*z.passengers,0)/Math.max(1,localPax):0;
 if(localPax>=p.paxGoal&&punct>=p.punctuality){corporateRevenue+=p.bonus;corporateFulfilled++}else corporatePenalty+=p.penalty;
 }
 const anc=i.ancillary.map(id=>get('IND_ANCILLARY',id));const ancillaryRevenue=anc.reduce((a,z)=>a+z.perPax*pax,0),ancillaryExpense=anc.reduce((a,z)=>a+z.upkeep,0);
 const treasuryIncome=i.treasury.filter(z=>z.due===s.week).reduce((a,z)=>a+z.principal*get('IND_TREASURY',z.id).rate,0);
 const industryIncome=r(corporateRevenue+ancillaryRevenue+treasuryIncome);
 const industryExpense=r(slotFees+vendorFees+safetyFees+laborFees+continuityFees+transferFees+ancillaryExpense+corporatePenalty);
 return {...base,income:r(base.income+industryIncome),expense:r(base.expense+industryExpense),industryIncome,industryExpense,corporateNet:r(corporateRevenue-corporatePenalty),corporateFulfilled,ancillaryNet:r(ancillaryRevenue-ancillaryExpense),treasuryIncome:r(treasuryIncome),industryPassengers:pax,industryFlights:flights};
}
function valuation(s,base){ensure(s);const i=s.industry;
 const locked=i.treasury.reduce((a,z)=>a+z.principal,0);
 const orderDeposits=i.orders.reduce((a,z)=>a+z.deposit,0);
 const assets=i.ancillary.reduce((a,id)=>a+get('IND_ANCILLARY',id).capital*.6,0)+i.slots.reduce((a,id)=>a+get('IND_SLOTS',id).cost*.33,0);
 return r(base+locked+orderDeposits+assets,2);
}
function postTick(s,weekly,extra){ensure(s);const i=s.industry,completed=s.week-1;
 const matured=i.treasury.filter(z=>z.due<=completed);if(matured.length){s.cash=r(s.cash+matured.reduce((a,z)=>a+z.principal,0));i.treasury=i.treasury.filter(z=>z.due>completed);for(const z of matured)log(s,'Vadeli yatırım vadesi',`${get('IND_TREASURY',z.id).name}: ana para ${z.principal} M$ serbest kaldı.`)}
 for(const o of [...i.orders]){if(o.due>completed)continue;
  const m=get('IND_ORDERS',o.id),plane=D.AIRCRAFT.find(z=>z.id===m.model);
  if(s.cash<o.balance){if((completed-o.due)%4===0)log(s,'Fabrika siparişi bekliyor',`${plane.name} teslimatı için ${o.balance} M$ gerekiyor.`);continue;}
  s.cash=r(s.cash-o.balance);s.planes.push({id:s.nextId++,model:m.model,name:plane.name+' · Fabrika '+(i.delivered+1),wear:0,leased:false,route:null});i.delivered++;i.orders.splice(i.orders.indexOf(o),1);log(s,'Yeni uçak teslim edildi',plane.name+' filona katıldı.');
 }
 const departed=i.corporate.filter(z=>z.until===completed);i.corporate=i.corporate.filter(z=>z.until>completed);for(const z of departed)log(s,'Kurumsal anlaşma sona erdi',get('IND_CORPORATE',z.id).name);
 const expired=i.safety.filter(z=>z.until===completed);i.safety=i.safety.filter(z=>z.until>completed);for(const z of expired)log(s,'Sertifika yenileme zamanı',get('IND_SAFETY',z.id).name);
 for(const [key,z] of Object.entries(i.labor))if(z.until<=completed){delete i.labor[key];log(s,'Personel mutabakatı yenilenecek',get('IND_LABOR',z.id).name)}
 if(i.tactic&&i.tactic.until<=completed){const t=get('IND_TACTICS',i.tactic.id);s.rep=r(cap(s.rep-t.repRisk,0,100));i.tactic=null;log(s,'Rekabet kampanyası kapandı',t.name)}
 const morale=Object.values(i.labor).reduce((a,z)=>a+get('IND_LABOR',z.id).morale*.045,0);
 s.expansion.morale=r(cap(s.expansion.morale+morale-.04,0,100),2);
 const trust=i.ancillary.reduce((a,id)=>a+get('IND_ANCILLARY',id).trust,0);
 const vendorCare=Object.values(i.vendors).map(id=>get('IND_VENDORS',id)).filter(z=>[3,9].includes(z.category)).reduce((a,z)=>a+z.quality*.1,0);
 s.expansion.satisfaction=r(cap(s.expansion.satisfaction+trust*.8+vendorCare,15,100),2);
 const partsQuality=Object.values(i.vendors).map(id=>get('IND_VENDORS',id)).filter(z=>z.category===7).reduce((a,z)=>a+z.quality,0);
 if(partsQuality)for(const p of s.planes)if(p.route!==null){const rr=s.routes.find(z=>z.id===p.route);if(rr?.active)p.wear=r(cap(p.wear-partsQuality*rr.trips*.04,0,100),2)}
 if(i.tactic&&active(i.tactic,completed)){
  const t=get('IND_TACTICS',i.tactic.id);
  for(const rival of s.rivals)rival.share=r(cap(rival.share-t.lift*.24+t.counter*.08,5,31),3);
 }
 i.completed+=extra.corporateFulfilled||0;
 i.weekly.push({week:completed,corporateNet:extra.corporateNet||0,ancillaryNet:extra.ancillaryNet||0,industryIncome:extra.industryIncome||0,industryExpense:extra.industryExpense||0,treasuryIncome:extra.treasuryIncome||0,passengers:extra.industryPassengers||0,orders:i.orders.length});i.weekly=i.weekly.slice(-120);
}
const original={ensure:X.ensure,route:X.route,overhead:X.overhead,valuation:X.valuation,postTick:X.postTick};
X.ensure=function(s){return ensure(original.ensure(s))};
X.route=function(s,rr,b){return modifier(s,rr,original.route(s,rr,b))};
X.overhead=function(s,weekly){return overhead(s,weekly,original.overhead(s,weekly))};
X.valuation=function(s){return valuation(s,original.valuation(s))};
X.postTick=function(s,weekly,extra){original.postTick(s,weekly,extra);postTick(s,weekly,extra)};
const oldNew=E.newGame,oldVal=E.validateSave,oldRemove=E.removeRoute,oldSell=E.sellPlane;
E.newGame=function(opts){const s=oldNew(opts);ensure(s);return s};
E.validateSave=function(s){if(!oldVal(s))return false;const i=s.industry;if(i===undefined)return true;if(!map(i))return false;
 const ids=(arr,key,max)=>arr===undefined||(Array.isArray(arr)&&arr.length<=max&&arr.every(x=>valid(key,x))&&new Set(arr).size===arr.length);
 const entries=(arr,key,max)=>arr===undefined||(Array.isArray(arr)&&arr.length<=max&&arr.every(z=>map(z)&&valid(key,z.id)&&Number.isSafeInteger(z.until)&&z.until>=0)&&new Set(arr.map(z=>z.id)).size===arr.length);
 if(!ids(i.slots,'IND_SLOTS',24)||!ids(i.ancillary,'IND_ANCILLARY',8)||!entries(i.corporate,'IND_CORPORATE',3)||!entries(i.safety,'IND_SAFETY',20))return false;
 if(i.orders!==undefined&&(!Array.isArray(i.orders)||i.orders.length>3||i.orders.some(z=>!map(z)||!valid('IND_ORDERS',z.id)||!Number.isSafeInteger(z.due)||z.due<0||!Number.isFinite(z.balance)||z.balance<0||!Number.isFinite(z.deposit)||z.deposit<0)))return false;
 if(i.treasury!==undefined&&(!Array.isArray(i.treasury)||i.treasury.length>3||i.treasury.some(z=>!map(z)||!valid('IND_TREASURY',z.id)||!Number.isSafeInteger(z.due)||z.due<0||!Number.isFinite(z.principal)||z.principal<=0)))return false;
 const chk=(o,cat,criterion,max)=>o===undefined||(map(o)&&Object.keys(o).length<=max&&Object.entries(o).every(([k,id])=>criterion(k,id,cat)));
 if(!chk(i.waves,'IND_WAVES',(k,id)=>s.hubs.includes(k)&&valid('IND_WAVES',id),20)||!chk(i.vendors,'IND_VENDORS',(k,id)=>/^[0-9]$/.test(k)&&valid('IND_VENDORS',id)&&String(get('IND_VENDORS',id).category)===k,10)||!chk(i.contingency,'IND_CONTINGENCY',(k,id)=>/^[0-3]$/.test(k)&&valid('IND_CONTINGENCY',id)&&String(get('IND_CONTINGENCY',id).threat)===k,4))return false;
 if(i.labor!==undefined&&(!map(i.labor)||Object.keys(i.labor).length>4||Object.entries(i.labor).some(([k,z])=>!/^[0-3]$/.test(k)||!map(z)||!valid('IND_LABOR',z.id)||String(get('IND_LABOR',z.id).unit)!==k||!Number.isSafeInteger(z.until)||z.until<0)))return false;
 if(i.tactic!==null&&i.tactic!==undefined&&(!map(i.tactic)||!valid('IND_TACTICS',i.tactic.id)||!Number.isSafeInteger(i.tactic.until)||i.tactic.until<0))return false;
 if(i.weekly!==undefined&&(!Array.isArray(i.weekly)||i.weekly.length>120||i.weekly.some(z=>!map(z)||!Number.isSafeInteger(z.week))))return false;
 return true};
E.removeRoute=function(s,id){const out=oldRemove(s,id);if(out.ok&&s.industry){const waveActive=s.routes.some(z=>z.active&&z.from===s.hub);if(!waveActive)delete s.industry.waves[s.hub]}return out};
E.sellPlane=function(s,id){return oldSell(s,id)};
const API={ensure,slot,corporate,wave,vendor,order,tactic,safety,labor,contingency,ancillary,bond,threatIndex,modifiers:modifier,overhead,valuation,postTick};
E.industry=API;root.AIR_INDUSTRY=API;
if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
