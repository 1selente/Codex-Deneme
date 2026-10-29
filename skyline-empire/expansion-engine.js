(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./expansion-data.js'):null);
const E=root.AIR_ENGINE||(typeof require!=='undefined'?require('./engine.js'):null);
const r=(x,n=3)=>Math.round((x+Number.EPSILON)*10**n)/10**n;
const cap=(x,a,b)=>Math.max(a,Math.min(b,x));
const find=(arr,id)=>arr.find(x=>x.id===id);
const valid=s=>s&&typeof s==='object'&&Array.isArray(s.routes)&&Array.isArray(s.planes);
const baseStaff=()=>({operations:2,cabin:2,sales:1,logistics:1});
function ensure(s){if(!valid(s))return s;if(!s.expansion||typeof s.expansion!=='object'||Array.isArray(s.expansion))s.expansion={};const x=s.expansion;
if(!x.staff||typeof x.staff!=='object')x.staff=baseStaff();
for(const d of D.DEPARTMENTS)if(!Number.isInteger(x.staff[d.id])||x.staff[d.id]<1||x.staff[d.id]>30)x.staff[d.id]=d.id==='operations'||d.id==='cabin'?2:1;
if(!D.POLICIES.some(p=>p.id===x.service))x.service='balanced';
if(!D.MAINTENANCE.some(p=>p.id===x.maintenance))x.maintenance='standard';
if(!D.ALLIANCES.some(p=>p.id===x.alliance))x.alliance='none';
if(!Number.isFinite(x.green))x.green=48;
x.green=cap(x.green,0,100);
if(!Number.isFinite(x.morale))x.morale=72;
x.morale=cap(x.morale,0,100);
if(!x.hubs||typeof x.hubs!=='object'||Array.isArray(x.hubs))x.hubs={};
for(const id of s.hubs)if(!Number.isInteger(x.hubs[id])||x.hubs[id]<1||x.hubs[id]>3)x.hubs[id]=1;
if(!Array.isArray(x.contracts))x.contracts=[];
x.contracts=x.contracts.filter(z=>find(D.CARGO_CONTRACTS,z.id)&&Number.isInteger(z.weeks)&&z.weeks>0&&z.weeks<=60);
if(!Array.isArray(x.campaigns))x.campaigns=[];
x.campaigns=x.campaigns.filter(z=>find(D.CAMPAIGNS,z.id)&&Number.isInteger(z.until)&&z.until>0);
if(!x.hedge||typeof x.hedge!=='object')x.hedge={until:0,multiplier:1};
if(!Number.isInteger(x.hedge.until))x.hedge.until=0;
if(!Number.isFinite(x.hedge.multiplier)||x.hedge.multiplier<=0)x.hedge.multiplier=1;
if(!Number.isFinite(x.totalCargo))x.totalCargo=0;
if(!Number.isFinite(x.totalEmissions))x.totalEmissions=0;
if(!Array.isArray(x.weeklyStats))x.weeklyStats=[];
if(!Number.isFinite(x.satisfaction))x.satisfaction=65;
for(const route of s.routes){if(!find(D.CARGO,route.cargo))route.cargo='none';if(!find(D.TARIFFS,route.tariff))route.tariff='standard';}
return s}
function policy(s){return find(D.POLICIES,s.expansion.service)}
function maintenance(s){return find(D.MAINTENANCE,s.expansion.maintenance)}
function alliance(s){return find(D.ALLIANCES,s.expansion.alliance)}
function activeCampaign(s){return s.expansion.campaigns.filter(c=>c.until>=s.week).map(c=>find(D.CAMPAIGNS,c.id));}
function totalCargo(s){return E.forecast(s).routes.reduce((a,q)=>a+(q.cargoTons||0),0)}
function workload(s){const active=s.routes.filter(q=>q.active).length;return r(active/(s.expansion.staff.operations*3.2)*(s.upgrades.includes('crewops')?.83:1),2)}
function route(s,rr,b){ensure(s);const x=s.expansion,pl=s.planes.find(p=>p.id===rr.plane),model=find(D.AIRCRAFT,pl.model),tariff=find(D.TARIFFS,rr.tariff),cargo=find(D.CARGO,rr.cargo),pol=policy(s),maint=maintenance(s),all=alliance(s);const hubLevel=x.hubs[rr.from]||1;
const demandMod=pol.demand*tariff.demand*(1+Math.max(0,x.staff.sales-1)*.011)*(1+Math.max(0,x.staff.cabin-1)*.007)*(1+(hubLevel-1)*.035)*(1+(x.morale-70)/1100)*(1+(x.satisfaction-65)/2000)*(all.demand)**(b.international?1:.25);
const campaigns=activeCampaign(s).reduce((z,c)=>z*c.demand,1);
const connection=s.upgrades.includes('interline')&&s.routes.some(q=>q.active&&q!==rr&&q.to===rr.from)?1.07:1;
const capacitySafety=workload(s)>1.15?cap(1-(workload(s)-1.15)*.10,.72,1):1;
const goodDemand=cap(demandMod*campaigns*connection*capacitySafety,.5,2.7);
const newPassengers=Math.min(b.seats,Math.max(0,Math.round(b.passengers*goodDemand)));
const basePassenger=(b.income-b.freight),newPassengerIncome=basePassenger*(b.passengers?newPassengers/b.passengers:0)*tariff.fare*pol.price*(s.upgrades.includes('hospitality')&&pol.id==='premium'?1.055:1);
const crewSaving=cap(1-(x.staff.operations-1)*.017,.73,1);const fuelSaving=(s.upgrades.includes('saf')?.94:1)*(x.hedge.until>=s.week?x.hedge.multiplier:1);
const expensesAdjust=b.fuel*(fuelSaving-1)+b.expense*.11*(maint.cost-1)+b.expense*.045*(pol.cost-1);
const envRate=(s.upgrades.includes('carbon')?.75:1)*(s.upgrades.includes('saf')?.75:1)*(s.upgrades.includes('eco')?.8:1);
const emissions=r((b.km/1000)*b.trips*2*model.seats*.000075*envRate,3); // abstract game metric, not actual physical tonnes
const carbonCost=emissions*.0018;
const cargoCapacity=(model.seats*.048+2)*b.trips*2*(s.upgrades.includes('handling')?1.2:1)*(1+(x.staff.logistics-1)*.045)*all.cargo;
const cargoDemand=(65+find(D.CITIES,rr.to).demand)/160;
const cargoTons=cargo.id==='none'?0:r(Math.min(cargoCapacity*cargo.volume*cargoDemand,55+8*x.staff.logistics),2);
const cargoIncome=cargoTons*cargo.price*(.8+Math.min(b.km/2200,1.7))*(s.upgrades.includes('safebag')?1.08:1);
const cargoExpense=cargoTons*cargo.handling+((cargo.id==='express'||cargo.id==='pharma')?cargo.risk*.018:0);
const newCost=Math.max(0,b.expense+expensesAdjust+carbonCost+cargoExpense+b.expense*.018*(crewSaving-1));
return {...b,passengers:newPassengers,load:r(newPassengers/b.seats),income:r(newPassengerIncome+cargoIncome+b.freight),expense:r(newCost),profit:r(newPassengerIncome+cargoIncome+b.freight-newCost),cargoTons,freight:r(cargoIncome),carbonCost:r(carbonCost),emissions,extraFare:tariff.name};}
function overhead(s,weekly){ensure(s);const x=s.expansion;const payroll=D.DEPARTMENTS.reduce((a,d)=>a+d.base*x.staff[d.id],0);
const hubs=Object.values(x.hubs).reduce((a,l)=>a+(l-1)*.055,0);
const ally=alliance(s).fee;
const overload=Math.max(0,workload(s)-1)*.12;
const moraleTax=x.morale<40?.18:0;
const weeklyCosts=payroll+hubs+ally+overload+moraleTax;
let contractRevenue=0,contractPenalty=0;
const tons=weekly.reduce((a,z)=>a+(z.cargoTons||0),0);
for(const c of x.contracts){const template=find(D.CARGO_CONTRACTS,c.id);if(tons>=template.minTons)contractRevenue+=template.payment;else contractPenalty+=template.penalty;}
return {expense:r(weeklyCosts+contractPenalty),income:r(contractRevenue),staff:r(payroll),contracts:r(contractRevenue-contractPenalty),cargoTons:r(tons,2),emissions:r(weekly.reduce((a,z)=>a+(z.emissions||0),0),2)};
}
function valuation(s){ensure(s);const x=s.expansion;return r(Object.values(x.hubs).reduce((a,l)=>a+(l-1)*3.8,0)+(x.staff.operations+x.staff.cabin+x.staff.sales+x.staff.logistics-6)*.6+(x.alliance==='none'?0:4)+x.green*.065+(x.satisfaction-65)*.11,1)}
function metric(s,type){ensure(s);if(type==='cargo')return s.expansion.weeklyStats.at(-1)?.cargoTons||0;if(type==='staff')return Object.values(s.expansion.staff).reduce((a,b)=>a+b,0);if(type==='green')return s.expansion.green;return null;}
function postTick(s,weekly,extra){const x=s.expansion;if(!x)return;ensure(s);const maint=maintenance(s);for(const line of weekly){const rr=s.routes.find(q=>q.id===line.id),pl=s.planes.find(p=>p.id===rr?.plane);if(!pl)continue;const stockIncrement=line.trips*.095*(s.upgrades.includes('maintenance')?.82:1);pl.wear= r(cap(pl.wear+stockIncrement*(maint.wear-1),0,100),1);if(pl.wear>=98&&rr.active){rr.active=false;s.logs.unshift({id:s.nextId++,week:s.week,title:'Teknik emniyet: uçak sefer dışı',detail:pl.name+' bakım gerektiriyor.',type:'bad'});}}
const load=workload(s);x.morale=r(cap(x.morale+(load<.85?.7:load>1.2?-1.65:-.15)+(maint.id==='proactive'?.13:0),0,100),1);
x.satisfaction=r(cap(x.satisfaction+(policy(s).rep*5)+(x.staff.cabin-2)*.13-(load>1.2?.3:0),15,100),1);
s.rep=r(cap(s.rep+policy(s).rep+maint.rep+(x.morale<30?-.25:0),0,100),1);
x.green=r(cap(x.green+(s.upgrades.includes('saf')?.27:0)+(s.upgrades.includes('carbon')?.13:0)+(s.upgrades.includes('eco')?.1:0)-extra.emissions*.006,0,100),1);
x.totalCargo=r(x.totalCargo+extra.cargoTons,2);x.totalEmissions=r(x.totalEmissions+extra.emissions,2);
x.weeklyStats.push({week:s.week-1,cargoTons:extra.cargoTons,emissions:extra.emissions,staff:extra.staff,contracts:extra.contracts,satisfaction:x.satisfaction,morale:x.morale,green:x.green});x.weeklyStats=x.weeklyStats.slice(-120);
for(const contract of x.contracts)contract.weeks--;x.contracts=x.contracts.filter(c=>c.weeks>0);
x.campaigns=x.campaigns.filter(c=>c.until>=s.week);
if(x.hedge.until<s.week)x.hedge={until:0,multiplier:1};}
function log(s,title,detail){s.logs.unshift({id:s.nextId++,week:s.week,title,detail,type:'good'});s.logs=s.logs.slice(0,70)}
function afford(s,n){return Number.isFinite(n)&&n>=0&&s.cash>=n}
function upgradeStaff(s,id){ensure(s);const d=find(D.DEPARTMENTS,id);if(!d)return {ok:false,error:'Departman bulunamadı.'};const level=s.expansion.staff[id];if(level>=12)return {ok:false,error:'Departman en yüksek seviyede.'};const cost=r(d.hire*(1+level*.8)**1.38,2);if(!afford(s,cost))return {ok:false,error:'Personel yatırımı için yeterli nakit yok.'};s.cash=r(s.cash-cost);s.expansion.staff[id]++;s.expansion.morale=cap(s.expansion.morale+.6,0,100);log(s,'Yeni ekip alındı',`${d.name} kadro kademesi ${level+1} oldu. (${cost} M$)`);return {ok:true,cost};}
function setPolicy(s,id){ensure(s);if(!find(D.POLICIES,id))return {ok:false,error:'Geçersiz hizmet politikası.'};s.expansion.service=id;log(s,'Hizmet standardı değişti',find(D.POLICIES,id).name);return {ok:true};}
function setMaintenance(s,id){ensure(s);if(!find(D.MAINTENANCE,id))return {ok:false,error:'Geçersiz bakım politikası.'};s.expansion.maintenance=id;log(s,'Bakım programı değişti',find(D.MAINTENANCE,id).name);return {ok:true};}
function setTariff(s,id,tariff){ensure(s);const rr=s.routes.find(q=>q.id===Number(id));if(!rr||!find(D.TARIFFS,tariff))return {ok:false,error:'Rota veya tarife geçersiz.'};rr.tariff=tariff;log(s,'Rota sınıfı değişti',`${rr.from}–${rr.to}: ${find(D.TARIFFS,tariff).name}`);return {ok:true};}
function setCargo(s,id,cargo){ensure(s);const rr=s.routes.find(q=>q.id===Number(id));if(!rr||!find(D.CARGO,cargo))return {ok:false,error:'Rota veya kargo türü geçersiz.'};rr.cargo=cargo;log(s,'Kargo hizmeti güncellendi',`${rr.from}–${rr.to}: ${find(D.CARGO,cargo).name}`);return {ok:true};}
function hubUpgrade(s,id){ensure(s);if(!s.hubs.includes(id))return {ok:false,error:'Önce şehirde merkez açmalısın.'};const lvl=s.expansion.hubs[id];if(lvl>=3)return {ok:false,error:'Merkez en yüksek seviyede.'};const cost=r(5+lvl*8+find(D.CITIES,id).demand*.019,2);if(!afford(s,cost))return {ok:false,error:'Yetersiz nakit.'};s.cash=r(s.cash-cost);s.expansion.hubs[id]++;log(s,'Terminal geliştirildi',`${id} terminali seviye ${lvl+1}.`);return {ok:true,cost};}
function joinAlliance(s,id){ensure(s);const a=find(D.ALLIANCES,id);if(!a)return {ok:false,error:'İttifak bulunamadı.'};if(s.expansion.alliance===id)return {ok:false,error:'Zaten bu ittifaktasın.'};if(id==='premium'&&s.rep<72)return {ok:false,error:'Premium ittifak için 72 itibar gerekli.'};if(id==='global'&&s.rep<55)return {ok:false,error:'Küresel ittifak için 55 itibar gerekli.'};if(!afford(s,a.cost))return {ok:false,error:'İttifak giriş aidatı için nakit yetersiz.'};s.cash=r(s.cash-a.cost);s.expansion.alliance=id;log(s,'Havacılık ittifakı',a.name+' ağına geçiş yapıldı.');return {ok:true,cost:a.cost};}
function launchCampaign(s,id){ensure(s);const c=find(D.CAMPAIGNS,id);if(!c)return {ok:false,error:'Kampanya bulunamadı.'};if(s.expansion.campaigns.some(x=>x.id===id&&x.until>=s.week))return {ok:false,error:'Bu kampanya halen aktif.'};if(!afford(s,c.cost))return {ok:false,error:'Kampanya için yeterli nakit yok.'};s.cash=r(s.cash-c.cost);s.rep=r(cap(s.rep+c.rep,0,100));s.expansion.campaigns.push({id,until:s.week+c.weeks-1});log(s,'Pazarlama kampanyası',`${c.name} ${c.weeks} haftalığına başladı.`);return {ok:true};}
function signCargo(s,id){ensure(s);const c=find(D.CARGO_CONTRACTS,id);if(!c)return {ok:false,error:'Sözleşme bulunamadı.'};if(s.expansion.contracts.some(q=>q.id===id))return {ok:false,error:'Bu sözleşme zaten aktif.'};if(s.expansion.contracts.length>=3)return {ok:false,error:'En fazla üç aktif kargo sözleşmesi olabilir.'};if(s.rep<c.rep)return {ok:false,error:`İtibarın en az ${c.rep} olmalı.`};if(!afford(s,c.deposit))return {ok:false,error:'Sözleşme teminatı karşılanamıyor.'};if(totalCargo(s)<c.minTons)return {ok:false,error:'Mevcut haftalık kargo kapasiten bu sözleşmeyi karşılamıyor.'};s.cash=r(s.cash-c.deposit);s.expansion.contracts.push({id,weeks:c.duration});log(s,'Yeni kargo anlaşması',`${c.name} (${c.duration} hafta).`);return {ok:true};}
function hedgeFuel(s){ensure(s);if(s.expansion.hedge.until>=s.week)return {ok:false,error:'Yakıt hedge sözleşmesi halen aktif.'};const cost=1.8+s.planes.length*.15;if(!afford(s,cost))return {ok:false,error:'Yeterli nakit yok.'};s.cash=r(s.cash-cost);s.expansion.hedge={until:s.week+7,multiplier:.90};log(s,'Yakıt fiyatı koruması','8 hafta boyunca yakıt giderlerinde indirim aktif.');return {ok:true};}
function routeEfficiency(s){ensure(s);return E.forecast(s).routes.filter(q=>q.profit<0).sort((a,b)=>a.profit-b.profit).slice(0,6)}
// Centralized accounting, forecast and weekly tick share the same deterministic calculations.
const original={...E};
E.newGame=function(options){const s=original.newGame(options);ensure(s);return s};
E.validateSave=function(s){if(!original.validateSave(s))return false;if(s.expansion){if(typeof s.expansion!=='object'||Array.isArray(s.expansion))return false;if(s.expansion.staff&&Object.values(s.expansion.staff).some(n=>!Number.isInteger(n)||n<1||n>30))return false;}return true};
E.metric=function(s,type){const extra=metric(s,type);return extra===null?original.metric(s,type):extra};
E.expansion={ensure,route,overhead,valuation,metric,postTick,upgradeStaff,setPolicy,setMaintenance,setTariff,setCargo,hubUpgrade,joinAlliance,launchCampaign,signCargo,hedgeFuel,routeEfficiency,workload,totalCargo};
root.AIR_EXT=E.expansion;if(typeof module!=='undefined')module.exports=E.expansion;
})(typeof globalThis!=='undefined'?globalThis:this);
