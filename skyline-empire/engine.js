(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./data.js'):null);
const byId=(all,id)=>all.find(x=>x.id===id);
const round=(n,p=3)=>Math.round((n+Number.EPSILON)*10**p)/10**p;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function rng(s){s.seed=(Math.imul(1664525,s.seed>>>0)+1013904223)>>>0;return s.seed/4294967296}
function dist(a,b){const p=Math.PI/180,dl=(b.lon-a.lon)*p,dphi=(b.lat-a.lat)*p;const h=Math.sin(dphi/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dl/2)**2;return Math.round(12742*Math.asin(Math.min(1,Math.sqrt(h))))}
function distance(a,b){return dist(byId(D.CITIES,a),byId(D.CITIES,b))}
function planeModel(p){return byId(D.AIRCRAFT,p.model)}
function maxTrips(plane,km,s){const model=planeModel(plane);return clamp(Math.floor(155/(km/model.speed*2+(s.upgrades.includes('ground')?2.4:3.6))),1,14)}
function availableCities(s){return D.CITIES.filter(x=>s.hubs.includes(x.id))}
function eventLog(s,title,detail='',type='neutral'){s.logs.unshift({id:s.nextId++,week:s.week,title,detail,type});s.logs=s.logs.slice(0,70)}
function newGame({name='Anka Air',hub='IST',difficulty='normal',seed=20261029}={}){
if(!byId(D.CITIES,hub))hub='IST';if(!D.DIFFICULTY[difficulty])difficulty='normal';
let s={version:1,name:String(name).trim().slice(0,28)||'Anka Air',hub,hubs:[hub],difficulty,week:1,seed:seed>>>0,cash:D.DIFFICULTY[difficulty].cash,debt:0,rep:61,experience:0,pax:0,flights:0,earnings:0,level:1,nextId:4,planes:[{id:1,model:'regional',name:'Kuş 001',wear:4,leased:false,route:3},{id:2,model:'a220',name:'Kuş 002',wear:2,leased:false,route:null}],routes:[{id:3,from:hub,to:hub==='ANK'?'IST':'ANK',plane:1,trips:8,price:1.02,marketing:1,active:true,last:null}],upgrades:[],contracts:[],achievements:[],pendingEvent:null,effects:[],history:[],logs:[],rivals:D.RIVALS.map(x=>({...x,share:x.share})),lastReport:null,bankrupt:false,consecutiveLoss:0};
if(distance(s.routes[0].from,s.routes[0].to)>planeModel(s.planes[0]).range){const fallback=D.CITIES.find(c=>c.id!==hub&&distance(hub,c.id)<=planeModel(s.planes[0]).range);s.routes[0].to=fallback.id}
if(root.AIR_EXT)root.AIR_EXT.ensure(s);eventLog(s,'Şirket kuruldu!','İlk rotan hazır. Filonu büyüt, yeni hatlar aç ve gökyüzüne hükmet.','good');return s;
}
function hasUpgrade(s,id){return s.upgrades.includes(id)}
function calcFare(a,b){return round(Math.min(1540,(95+distance(a,b)*.132)*(byId(D.CITIES,a).country===byId(D.CITIES,b).country?.87:1)),0)}
function calcRoute(s,route,randomize=false){
const pl=byId(s.planes,route.plane);if(!pl)return null;const model=planeModel(pl),km=distance(route.from,route.to),a=byId(D.CITIES,route.from),b=byId(D.CITIES,route.to),di=D.DIFFICULTY[s.difficulty];
const trips=clamp(Number(route.trips)||1,1,maxTrips(pl,km,s));
const international=a.country!==b.country;
const baseDemand=(a.demand+b.demand)*5.7*(1+(a.tourism+b.tourism-3)/16);
const elasticity=clamp(1.75-route.price*.68,.35,1.35);
const rivalShare=s.rivals.reduce((sum,r)=>sum+r.share,0);
const networkDiscount=Math.max(.65,1-s.routes.filter(r=>r.active&&((r.from===route.from&&r.to===route.to)||(r.from===route.to&&r.to===route.from))).length*.055);
const demandBoost=s.effects.reduce((p,e)=>p*(e.demand||1),1);
const campaign=1+route.marketing*.085;
const popularity=clamp(.82+s.rep/325,.82,1.14);
const upgrades=(hasUpgrade(s,'booking')?1.10:1)*(hasUpgrade(s,'loyalty')?1.12:1)*(hasUpgrade(s,'ai')?1.08:1)*(international&&hasUpgrade(s,'alliance')?1.18:1);
const season=1+Math.sin((s.week%52)/52*Math.PI*2)*.09;
const stochastic=randomize?.91+rng(s)*.18:1;
const demand=baseDemand*elasticity*(1-rivalShare/100*.32)*networkDiscount*demandBoost*campaign*popularity*upgrades*di.demand*season*stochastic;
const seats=trips*2*model.seats;
const wearImpact=pl.wear>80?.83:pl.wear>65?.94:1;
const load=clamp(demand/seats,0,clamp(.93+route.marketing*.018,0,.99)*wearImpact);
const passengers=Math.round(seats*load);
const fare=calcFare(route.from,route.to)*route.price;
const income=passengers*fare/1e6*1.27*(hasUpgrade(s,'revenue')?1.09:1)*(hasUpgrade(s,'premium')?1.13:1);
const freight=hasUpgrade(s,'cargo')?trips*2*(.006+model.seats*.000032):0;
const fuelScale=(.68+km/3800);
const fuelEffect=s.effects.reduce((p,e)=>p*(e.fuel||1),1);
const fuel=trips*2*model.fuel*fuelScale*di.cost*fuelEffect*(hasUpgrade(s,'fuel')?.88:1)*(hasUpgrade(s,'eco')?.9:1);
const maintenance=trips*2*model.maint*(.73+km/8500)*(1+pl.wear/250)*(hasUpgrade(s,'maintenance')?.82:1);
const crew=model.crew*(hasUpgrade(s,'academy')?.85:1);
const airport=trips*2*(.0018+((a.region+b.region)/2)*.00032);
const advertising=[0,.012,.035,.071][route.marketing]||0;
const lease=pl.leased?model.price*.0025:0;
const expense=(fuel+maintenance+crew+airport+advertising+lease)*(hasUpgrade(s,'ai')?.94:1);
const base={id:route.id,km,trips,passengers,seats,load:round(load,3),income:round(income+freight),expense:round(expense),profit:round(income+freight-expense),fare:round(fare,0),fuel:round(fuel),freight:round(freight),international};return root.AIR_EXT?root.AIR_EXT.route(s,route,base):base;
}
function forecast(s){const routes=s.routes.filter(r=>r.active).map(r=>calcRoute(s,r));const income=routes.reduce((a,r)=>a+r.income,0);const other=root.AIR_EXT?root.AIR_EXT.overhead(s,routes):{income:0,expense:0};const expenses=routes.reduce((a,r)=>a+r.expense,0)+s.hubs.length*.035+s.debt*.0018+other.expense;return {income:round(income+other.income),expenses:round(expenses),profit:round(income+other.income-expenses),passengers:routes.reduce((a,r)=>a+r.passengers,0),routes};}
function valuation(s){return round(s.cash-s.debt+s.planes.reduce((a,p)=>a+(p.leased?0:planeModel(p).price*(1-p.wear*.0026)),0)+s.routes.filter(r=>r.active).length*2.5+s.hubs.length*4+s.upgrades.length*3+s.rep*.18+(root.AIR_EXT?root.AIR_EXT.valuation(s):0),1)}
function metric(s,type){switch(type){case 'cargo':case 'green':case 'staff':return root.AIR_EXT?root.AIR_EXT.metric(s,type):0;case 'routes':return s.routes.filter(r=>r.active).length;case 'pax':return s.pax;case 'intl':return s.routes.filter(r=>r.active&&byId(D.CITIES,r.from).country!==byId(D.CITIES,r.to).country).length;case 'fleet':return s.planes.length;case 'rep':return s.rep;case 'long':return s.routes.filter(r=>r.active&&distance(r.from,r.to)>=5300).length;case 'valuation':return valuation(s);case 'profit':return s.lastReport?.profit||0;case 'destinations':return new Set(s.routes.filter(r=>r.active).map(r=>r.to)).size;case 'week':return s.week;default:return 0}}
function refreshProgress(s){
const val=valuation(s);const next=clamp(Math.floor(Math.max(0,val-80)/80)+Math.floor(s.pax/60000)+1,1,6);if(next>s.level){s.level=next;eventLog(s,'Yeni seviye!','Havayolu itibarın ve ekonomik gücün yeni uçakların kilidini açtı.','good')}
for(const a of D.ACHIEVEMENTS){if(!s.achievements.includes(a.id)&&metric(s,a.type)>=a.goal){s.achievements.push(a.id);s.cash=round(s.cash+a.bonus);eventLog(s,'Başarım: '+a.name,`Ödül: +${a.bonus} M$`, 'good')}}
}
function tick(s){if(s.bankrupt)return {ok:false,error:'Şirket iflas etti.'};if(s.pendingEvent)return {ok:false,error:'Önce bekleyen olayla ilgili karar vermelisin.'};
const weekly=s.routes.filter(r=>r.active).map(r=>calcRoute(s,r,true));let income=0,expense=0,pax=0,flights=0;
for(const r of weekly){income+=r.income;expense+=r.expense;pax+=r.passengers;flights+=r.trips*2;const p=byId(s.planes,byId(s.routes,r.id).plane);if(p){p.wear=round(clamp(p.wear+r.trips*.095*(hasUpgrade(s,'maintenance')?.82:1),0,100),1);if(p.wear>=98){byId(s.routes,r.id).active=false;eventLog(s,'Uçak bakıma alındı',`${p.name} aşırı yıpranma nedeniyle seferden çekildi. Bakım yaparak rotayı yeniden açabilirsin.`, 'bad')}}byId(s.routes,r.id).last=r;}
const other=root.AIR_EXT?root.AIR_EXT.overhead(s,weekly):{income:0,expense:0,cargoTons:0,emissions:0,staff:0,contracts:0};const fixed=s.hubs.length*.035+s.debt*.0018;expense+=fixed+other.expense;income+=other.income;
const profit=round(income-expense);
s.cash=round(s.cash+profit);s.earnings=round(s.earnings+profit);s.pax+=pax;s.flights+=flights;s.experience+=Math.round(pax/80+weekly.length*8);s.week++;
let repDelta=(weekly.length&&weekly.reduce((a,r)=>a+r.load,0)/weekly.length>.65?.19:-.06)+(hasUpgrade(s,'loyalty')?.08:0)+(hasUpgrade(s,'eco')?.05:0)+(hasUpgrade(s,'academy')?.05:0);s.rep=round(clamp(s.rep+repDelta,0,100),1);if(root.AIR_EXT)root.AIR_EXT.postTick(s,weekly,other);
for(const effect of s.effects)effect.weeks--;s.effects=s.effects.filter(e=>e.weeks>0);
for(const r of s.rivals)r.share=round(clamp(r.share+(rng(s)-.5)*.45+r.growth*.012,5,31),2);
s.lastReport={week:s.week-1,income:round(income),expenses:round(expense),profit,passengers:pax,flights,cargoTons:other.cargoTons,emissions:other.emissions,staffCost:other.staff,contractProfit:other.contracts,load:weekly.length?round(weekly.reduce((a,r)=>a+r.load,0)/weekly.length,3):0};
s.history.push({week:s.week-1,cash:round(s.cash,2),value:valuation(s),profit,passengers:pax});s.history=s.history.slice(-120);
if(profit<0)s.consecutiveLoss++;else s.consecutiveLoss=0;
if(s.week%8===0)eventLog(s,'8 haftalık faaliyet raporu',`${pax.toLocaleString('tr-TR')} yolcu taşındı. Geçen hafta ${profit>=0?'kâr':'zarar'}: ${Math.abs(profit).toFixed(2)} M$.`,profit>=0?'good':'bad');
refreshProgress(s);
if(s.cash<-15){s.bankrupt=true;eventLog(s,'İflas!','Şirketin nakit rezervi kritik seviyeye düştü. Yeni bir kariyer başlat.','bad')}
else if(s.week>=5&&rng(s)<.13&&!s.pendingEvent){const e=D.EVENTS[Math.floor(rng(s)*D.EVENTS.length)];s.pendingEvent=e.id}
return {ok:true,report:s.lastReport,pendingEvent:s.pendingEvent};}
function advance(s,n=1){const reports=[];for(let i=0;i<clamp(n,1,52);i++){const r=tick(s);if(!r.ok)return {ok:reports.length>0,reports,error:r.error};reports.push(r.report);if(r.pendingEvent||s.bankrupt)break}return {ok:true,reports,pendingEvent:s.pendingEvent}}
function resolveEvent(s,choice){const e=byId(D.EVENTS,s.pendingEvent);if(!e)return {ok:false,error:'Bekleyen olay yok.'};const o=e.options[choice];if(!o)return {ok:false,error:'Geçersiz seçim.'};if(o.cash<0&&s.cash+o.cash<-15)return {ok:false,error:'Bu kararı finanse edecek nakit yok.'};s.cash=round(s.cash+(o.cash||0));s.debt=round(s.debt+(o.debt||0));s.rep=round(clamp(s.rep+(o.rep||0),0,100));if(o.effect)s.effects.push({...o.effect});s.pendingEvent=null;eventLog(s,e.title,o.label,o.rep>=0?'good':'neutral');return {ok:true}}
function buyPlane(s,modelId,lease=false){const m=byId(D.AIRCRAFT,modelId);if(!m)return {ok:false,error:'Uçak modeli bulunamadı.'};if(m.level>s.level)return {ok:false,error:`Bu uçak için seviye ${m.level} gerekli.`};const cost=lease?round(m.price*.08):m.price;if(s.cash<cost)return {ok:false,error:'Yetersiz nakit.'};s.cash=round(s.cash-cost);const count=s.planes.filter(p=>p.model===m.id).length+1;s.planes.push({id:s.nextId++,model:m.id,name:`${m.name.split(' ')[0]} ${String(count).padStart(2,'0')}`,wear:0,leased:lease,route:null});eventLog(s,'Filoya yeni uçak katıldı',`${m.name} ${lease?'kiralandı':'satın alındı'}.`, 'good');refreshProgress(s);return {ok:true}}
function sellPlane(s,id){const p=byId(s.planes,id);if(!p)return {ok:false,error:'Uçak bulunamadı.'};if(p.route!==null)return {ok:false,error:'Önce uçağın rotasını kaldır.'};const m=planeModel(p);const refund=p.leased?round(m.price*.025):round(m.price*(.68-p.wear*.003));s.cash=round(s.cash+refund);s.planes=s.planes.filter(x=>x.id!==id);eventLog(s,'Filo güncellendi',`${m.name} filodan çıkarıldı (+${refund} M$).`);return {ok:true}}
function servicePlane(s,id){const p=byId(s.planes,id);if(!p)return {ok:false,error:'Uçak bulunamadı.'};const cost=round(Math.max(.2,planeModel(p).price*.018)*(p.wear/50+.25),2);if(s.cash<cost)return {ok:false,error:'Bakım için yeterli nakit yok.'};s.cash=round(s.cash-cost);p.wear=0;eventLog(s,'Bakım tamamlandı',`${p.name} bakım gördü. Maliyet: ${cost} M$.`,'good');return {ok:true}}
function addRoute(s,{from,to,plane,trips=7,price=1,marketing=1}){plane=Number(plane);trips=Number(trips);price=Number(price);marketing=Number(marketing);const pl=byId(s.planes,plane);if(!s.hubs.includes(from))return {ok:false,error:'Kalkış noktası şirket merkezlerinden biri olmalı.'};if(!byId(D.CITIES,to)||from===to)return {ok:false,error:'Geçerli bir varış noktası seç.'};if(!pl||pl.route!==null)return {ok:false,error:'Uygun, boşta bir uçak seç.'};const km=distance(from,to);if(km>planeModel(pl).range)return {ok:false,error:'Bu uçak seçilen rotanın menziline yetmiyor.'};if(s.routes.some(r=>r.from===from&&r.to===to))return {ok:false,error:'Bu yönde zaten bir rotan var.'};if(!Number.isFinite(price)||price<.65||price>1.7||!Number.isInteger(marketing)||marketing<0||marketing>3||!Number.isInteger(trips)||trips<1||trips>maxTrips(pl,km,s))return {ok:false,error:'Sefer, fiyat veya pazarlama değerleri geçersiz.'};const cost=.55+km*.00008;if(s.cash<cost)return {ok:false,error:'Hat açma maliyetini karşılayamıyorsun.'};s.cash=round(s.cash-cost);const id=s.nextId++;s.routes.push({id,from,to,plane,trips,price,marketing,active:true,last:null});pl.route=id;eventLog(s,'Yeni uçuş hattı!',`${from} → ${to} hizmete açıldı.`, 'good');refreshProgress(s);return {ok:true}}
function editRoute(s,id,patch){const r=byId(s.routes,id);if(!r)return {ok:false,error:'Rota bulunamadı.'};const pl=byId(s.planes,r.plane);const t=patch.trips===undefined?r.trips:Number(patch.trips),p=patch.price===undefined?r.price:Number(patch.price),m=patch.marketing===undefined?r.marketing:Number(patch.marketing);if(!Number.isInteger(t)||t<1||t>maxTrips(pl,distance(r.from,r.to),s)||!Number.isFinite(p)||p<.65||p>1.7||!Number.isInteger(m)||m<0||m>3)return {ok:false,error:'Geçersiz rota ayarı.'};if(patch.active&&pl.wear>=98)return {ok:false,error:'Uçak önce bakım görmeli.'};r.trips=t;r.price=p;r.marketing=m;if(patch.active!==undefined)r.active=!!patch.active;eventLog(s,'Rota tarifesi güncellendi',`${r.from} → ${r.to}`);return {ok:true}}
function removeRoute(s,id){const r=byId(s.routes,id);if(!r)return {ok:false,error:'Rota bulunamadı.'};const p=byId(s.planes,r.plane);if(p)p.route=null;s.routes=s.routes.filter(x=>x.id!==id);eventLog(s,'Rota kapatıldı',`${r.from} → ${r.to} hattı kapatıldı.`);return {ok:true}}
function openHub(s,id){const c=byId(D.CITIES,id);if(!c)return {ok:false,error:'Şehir bulunamadı.'};if(s.hubs.includes(id))return {ok:false,error:'Bu şehirde zaten merkezin var.'};const cost=hubCost(s,id);if(s.cash<cost)return {ok:false,error:'Yeni merkez için nakit yetersiz.'};s.cash=round(s.cash-cost);s.hubs.push(id);if(root.AIR_EXT)root.AIR_EXT.ensure(s);eventLog(s,'Yeni uçuş merkezi',`${c.name} artık ana üslerinden biri!`,'good');return {ok:true}}
function hubCost(s,id){const c=byId(D.CITIES,id);return round(7+c.demand*.075+(c.region>=3?5:0),1)}
function research(s,id){const u=byId(D.UPGRADES,id);if(!u)return {ok:false,error:'Araştırma bulunamadı.'};if(s.upgrades.includes(id))return {ok:false,error:'Bu geliştirme zaten açılmış.'};if(s.level<u.level)return {ok:false,error:`Seviye ${u.level} gerekli.`};if(s.cash<u.cost)return {ok:false,error:'Araştırma için nakit yetersiz.'};s.cash=round(s.cash-u.cost);s.upgrades.push(id);eventLog(s,'Araştırma tamamlandı',u.name+' aktif.','good');return {ok:true}}
function takeLoan(s){if(s.debt+15>135)return {ok:false,error:'Kredi limitine ulaştın.'};s.cash=round(s.cash+15);s.debt=round(s.debt+15);eventLog(s,'Yeni kredi','15 M$ finansman sağlandı.');return {ok:true}}
function repayLoan(s){if(s.debt<=0)return {ok:false,error:'Ödenecek borç yok.'};const amount=Math.min(15,s.debt);if(s.cash<amount)return {ok:false,error:'Yeterli nakit yok.'};s.cash=round(s.cash-amount);s.debt=round(s.debt-amount);eventLog(s,'Kredi geri ödemesi',`${amount} M$ kredi ödendi.`,'good');return {ok:true}}
function claimContract(s,id){const c=byId(D.CONTRACTS,id);if(!c)return {ok:false,error:'Görev bulunamadı.'};if(s.contracts.includes(id))return {ok:false,error:'Ödül daha önce alındı.'};if(metric(s,c.type)<c.goal)return {ok:false,error:'Görev henüz tamamlanmadı.'};s.contracts.push(id);s.cash=round(s.cash+c.reward);s.rep=round(clamp(s.rep+1,0,100));eventLog(s,'Görev tamamlandı',`${c.name}: +${c.reward} M$`, 'good');return {ok:true}}
function validateSave(s){if(!s||typeof s!=='object'||s.version!==1||!Array.isArray(s.planes)||!Array.isArray(s.routes)||!Array.isArray(s.hubs)||!Array.isArray(s.history)||!D.DIFFICULTY[s.difficulty])return false;if(s.planes.length>1000||s.routes.length>1000||!Number.isFinite(s.cash)||!Number.isFinite(s.week)||s.week<1||typeof s.name!=='string')return false;return s.planes.every(p=>byId(D.AIRCRAFT,p.model)&&Number.isFinite(p.wear))&&s.routes.every(r=>byId(D.CITIES,r.from)&&byId(D.CITIES,r.to)&&Number.isFinite(r.trips)&&Number.isFinite(r.price))}
const E={newGame,distance,maxTrips,calcFare,calcRoute,forecast,valuation,metric,refreshProgress,tick,advance,resolveEvent,buyPlane,sellPlane,servicePlane,addRoute,editRoute,removeRoute,openHub,hubCost,research,takeLoan,repayLoan,claimContract,validateSave};root.AIR_ENGINE=E;if(typeof module!=='undefined')module.exports=E;
})(typeof globalThis!=='undefined'?globalThis:this);
