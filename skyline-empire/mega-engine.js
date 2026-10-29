(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./mega-data.js'):null);
const E=root.AIR_ENGINE||(typeof require!=='undefined'?require('./expansion-engine.js')&&root.AIR_ENGINE:null);
const X=E.expansion;
const r=(n,p=3)=>Math.round((n+Number.EPSILON)*10**p)/10**p;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const find=(a,id)=>a.find(x=>x.id===id);
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const ins=(s,text,detail)=>{s.logs.unshift({id:s.nextId++,week:s.week,title:text,detail,type:'good'});s.logs=s.logs.slice(0,70)};
const retrofitKeys=['engine','cabin','hold','avionics'];
function ensure(s){if(!s||!Array.isArray(s.planes)||!Array.isArray(s.routes))return s;
 if(!plain(s.mega))s.mega={};const m=s.mega;
 if(!Array.isArray(m.technology))m.technology=[];
 m.technology=[...new Set(m.technology)].filter(id=>find(D.MEGA_TECH,id)).slice(0,72);
 if(!Array.isArray(m.projects))m.projects=[];
 m.projects=[...new Set(m.projects)].filter(id=>find(D.MEGA_PROJECTS,id)).slice(0,18);
 if(!plain(m.profiles))m.profiles={};
 const routes=new Set(s.routes.map(z=>String(z.id)));
 for(const key of Object.keys(m.profiles))if(!routes.has(key)||!find(D.MEGA_PROFILES,m.profiles[key]))delete m.profiles[key];
 if(!plain(m.retrofits))m.retrofits={};
 const planes=new Set(s.planes.map(z=>String(z.id)));
 for(const key of Object.keys(m.retrofits)){if(!planes.has(key)||!plain(m.retrofits[key])){delete m.retrofits[key];continue;}for(const part of retrofitKeys){const val=m.retrofits[key][part];m.retrofits[key][part]=Number.isInteger(val)?clamp(val,0,3):0;}}
 if(!['basic','standard','comprehensive'].includes(m.insurance))m.insurance='standard';
 if(!['off','starter','silver','gold'].includes(m.club))m.club='starter';
 if(!Number.isInteger(m.training))m.training=0;m.training=clamp(m.training,0,6);
 if(!Number.isFinite(m.reliability))m.reliability=89;m.reliability=clamp(m.reliability,0,100);
 if(!Number.isFinite(m.loyalty))m.loyalty=12;m.loyalty=clamp(m.loyalty,0,100);
 if(!Number.isFinite(m.lifetimeRevenue))m.lifetimeRevenue=0;
 if(!Number.isFinite(m.lifetimePunctuality))m.lifetimePunctuality=0;
 if(!Number.isFinite(m.incidents))m.incidents=0;
 if(!Array.isArray(m.weekly))m.weekly=[];m.weekly=m.weekly.filter(a=>plain(a)&&Number.isFinite(a.week)).slice(-120);
 return s;
}
const owned=(s,id)=>s.mega.technology.includes(id);
const purchased=(s,id)=>s.mega.projects.includes(id);
function effect(s,name){ensure(s);let score=0;
 for(const id of s.mega.technology){const u=find(D.MEGA_TECH,id);if(u&&u.effect===name)score+=u.power;}
 for(const id of s.mega.projects){const u=find(D.MEGA_PROJECTS,id);if(u&&u.effect===name)score+=u.power;}
 return clamp(r(score,4),0,.5);
}
function fuelIndex(s){return r(clamp(1+.18*Math.sin(s.week*.32)+.075*Math.cos(s.week*.094),.76,1.26),4)}
function demandIndex(s,route){const city=find(D.CITIES,route.to);const region=city?.region||0;return r(clamp(1+.09*Math.sin(s.week*.12+region*.9)+.065*Math.cos(s.week*.045+region),.80,1.20),4)}
const policies={basic:{name:'Asgari Sigorta',fee:.014,protection:0},standard:{name:'Dengeli Sigorta',fee:.041,protection:.34},comprehensive:{name:'Tam Kapsam Sigortası',fee:.084,protection:.67}};
const clubs={off:{name:'Sadakat Programı Yok',cost:0,demand:1,loyalty:0},starter:{name:'SkyMiles Başlangıç',cost:.04,demand:1.012,loyalty:.14},silver:{name:'SkyMiles Silver',cost:.14,demand:1.038,loyalty:.35},gold:{name:'SkyMiles Gold',cost:.37,demand:1.078,loyalty:.65}};
function modifiers(s,rr,b){ensure(s);
 const m=s.mega,profile=find(D.MEGA_PROFILES,m.profiles[String(rr.id)])||D.MEGA_PROFILES[0],pl=s.planes.find(x=>x.id===rr.plane);
 if(!pl||!b)return b;const upgrades=m.retrofits[String(pl.id)]||{};
 const econ=demandIndex(s,rr),fuel=fuelIndex(s);
 const pressure=Math.max(0,X.workload(s)-.95),wear=Math.max(0,pl.wear-45);
 const rel=clamp(.955-wear*.0024-pressure*.055+effect(s,'reliability')*.19+(upgrades.avionics||0)*.017+m.training*.009,.67,.998);
 const serviceDemand=clamp(profile.demand*(1+effect(s,'demand')+effect(s,'service')*.12)*clubs[m.club].demand*(1+m.loyalty/2000)*econ, .6,2.1);
 const prevPax=b.passengers;
 const passengers=clamp(Math.round(b.passengers*serviceDemand*clamp(.985+(rel-.85)*.10,.94,1.01)),0,b.seats);
 const fareBoost=profile.fare*(1+effect(s,'fare'))*(1+effect(s,'marketing')*.12)*(1+(upgrades.cabin||0)*.024);
 const passengerIncome=(b.income-b.freight)*(passengers/Math.max(1,prevPax))*fareBoost;
 const cargoTons=r(b.cargoTons*(1+effect(s,'cargo')+(upgrades.hold||0)*.10)*profile.cargo,2);
 const cargoIncome=b.freight*(cargoTons/Math.max(.0001,b.cargoTons||.0001))*(1+effect(s,'cargoFare'));
 const cargoExtra=(cargoTons-b.cargoTons)*.0002*(1-effect(s,'cargoCost'));
 const fuelCost=b.fuel*(fuel-1)-(b.fuel*effect(s,'fuel')*3.5)-(b.fuel*(upgrades.engine||0)*.032);
 const serviceCost=b.expense*(profile.cost-1)*.19;
 const reliabilityCost=(1-rel)*passengerIncome*.026*(1-policies[m.insurance].protection)*(1-effect(s,'insurance')*.35);
 const crewSaving=b.expense*effect(s,'crew')*.055;
 const carbonSaving=(b.carbonCost||0)*effect(s,'carbon');
 const cost=r(Math.max(0,b.expense+fuelCost+serviceCost+reliabilityCost+cargoExtra-crewSaving-carbonSaving));
 const totalIncome=r(passengerIncome+cargoIncome);
 return {...b,passengers,load:r(passengers/Math.max(1,b.seats)),income:totalIncome,expense:cost,profit:r(totalIncome-cost),freight:r(cargoIncome),cargoTons,emissions:r((b.emissions||0)*(1-effect(s,'carbon')*.6),3),punctuality:r(rel,4),fuelIndex:fuel,marketIndex:econ,profile:profile.name,basePax:prevPax};
}
function overhead(s,weekly,base){ensure(s);const m=s.mega;
 const buildings=m.projects.reduce((a,id)=>a+(find(D.MEGA_PROJECTS,id)?.upkeep||0),0)*(1-effect(s,'upkeep'));
 const insurance=policies[m.insurance].fee*s.planes.length*(1-effect(s,'insurance')*.6);
 const club=clubs[m.club].cost*(1-effect(s,'upkeep')*.15);
 const training=m.training*.031;
 const contractBoost=Math.max(0,base.contracts||0)*effect(s,'contract')*.75;
 return {...base,income:r(base.income+contractBoost),expense:r(base.expense+buildings+insurance+club+training),megaOverhead:r(buildings+insurance+club+training),facilities:r(buildings),insurance:r(insurance),loyalty:r(club),training:r(training)};
}
function valuation(s,base){ensure(s);const m=s.mega;
 const facilities=m.projects.reduce((a,id)=>a+(find(D.MEGA_PROJECTS,id)?.cost||0)*.68,0);
 const intangible=m.technology.reduce((a,id)=>a+(find(D.MEGA_TECH,id)?.cost||0)*.22,0);
 const installed=s.planes.reduce((sum,p)=>{const parts=m.retrofits[String(p.id)]||{};const model=find(D.AIRCRAFT,p.model);return sum+retrofitKeys.reduce((a,key)=>a+(parts[key]||0)*model.price*.015,0)},0);
 return r(base+facilities+intangible+installed+m.loyalty*.085+m.reliability*.052,2);
}
function postTick(s,weekly,extra){ensure(s);const m=s.mega;const totalFlights=weekly.reduce((a,b)=>a+b.trips*2,0);
 const punctuality=totalFlights?weekly.reduce((a,b)=>a+(b.punctuality||.9)*b.trips*2,0)/totalFlights:.98;
 const demand=weekly.reduce((a,z)=>a+z.passengers,0);
 m.reliability=r(clamp(m.reliability*.85+punctuality*100*.15,0,100),2);
 m.loyalty=r(clamp(m.loyalty+(demand?Math.min(1.9,demand/4000):-.18)*clubs[m.club].loyalty+(m.reliability>93?.15:-.07)+(effect(s,'loyalty')*.85)-.16,0,100),2);
 s.expansion.satisfaction=r(clamp(s.expansion.satisfaction+(m.reliability-87)*.012+effect(s,'satisfaction')*.6 + (demand?Math.min(.04,demand/400000):-.07),15,100),2);
 s.expansion.morale=r(clamp(s.expansion.morale+effect(s,'morale')*.53+m.training*.023-(X.workload(s)>1.6?.1:0),0,100),2);
 s.expansion.green=r(clamp(s.expansion.green+effect(s,'green')*.16,0,100),2);
 s.rep=r(clamp(s.rep+(m.reliability-88)*.003,0,100),2);
 for(const line of weekly){const rr=s.routes.find(y=>y.id===line.id),pl=s.planes.find(y=>y.id===rr?.plane);if(!pl)continue;const mods=m.retrofits[String(pl.id)]||{};
 pl.wear=r(clamp(pl.wear-line.trips*.095*(effect(s,'wear')*.55+(mods.engine||0)*.026),0,100),2);
 }
 const gross=extra.income||0;
 m.lifetimeRevenue=r(m.lifetimeRevenue+weekly.reduce((a,y)=>a+y.income,0)+(gross||0),3);
 m.lifetimePunctuality=r(m.lifetimePunctuality+punctuality,3);
 m.weekly.push({week:s.week-1,reliability:m.reliability,loyalty:m.loyalty,punctuality:r(punctuality*100,1),fuelIndex:fuelIndex({week:s.week-1}),revenue:r(weekly.reduce((a,b)=>a+b.income,0)),cargoTons:r(weekly.reduce((a,b)=>a+b.cargoTons,0),1),overhead:extra.megaOverhead||0});
 m.weekly=m.weekly.slice(-120);
}
function research(s,id){ensure(s);const u=find(D.MEGA_TECH,id);if(!u)return {ok:false,error:'Geçersiz araştırma.'};const m=s.mega;
 if(owned(s,id))return {ok:false,error:'Teknoloji zaten geliştirildi.'};
 if(u.stage>1&&!owned(s,u.domain+'-'+(u.stage-1)))return {ok:false,error:'Önce aynı daldaki önceki teknolojiyi açmalısın.'};
 if(s.level<u.level)return {ok:false,error:`Şirket seviyesi ${u.level} gerekli.`};
 const cost=r(u.cost*(1-effect(s,'projectCost')*.32),2);
 if(s.cash<cost)return {ok:false,error:'Araştırma bütçesi yetersiz.'};
 s.cash=r(s.cash-cost);m.technology.push(id);ins(s,'Yeni teknoloji: '+u.name,`Araştırma tamamlandı · ${cost} M$`);return {ok:true,cost};
}
function project(s,id){ensure(s);const p=find(D.MEGA_PROJECTS,id);if(!p)return {ok:false,error:'Proje mevcut değil.'};
 if(purchased(s,id))return {ok:false,error:'Proje zaten yapıldı.'};
 if(p.stage>1&&!purchased(s,p.family+'-'+(p.stage-1)))return {ok:false,error:'Önce önceki tesisi inşa etmelisin.'};
 if(p.stage>1&&s.level<p.stage)return {ok:false,error:'Bu tesis için daha yüksek şirket seviyesi gerekli.'};
 const cost=r(p.cost*(1-effect(s,'projectCost')*.5),2);
 if(s.cash<cost)return {ok:false,error:'Yatırım için nakit yetersiz.'};
 s.cash=r(s.cash-cost);s.mega.projects.push(id);ins(s,'Yatırım tamamlandı: '+p.name,`Kalıcı tesis aktif; haftalık bakım ${p.upkeep} M$`);return {ok:true,cost};
}
function setProfile(s,routeId,id){ensure(s);const rr=s.routes.find(z=>z.id===Number(routeId)),p=find(D.MEGA_PROFILES,id);
 if(!rr||!p)return {ok:false,error:'Rota veya kabin profili geçersiz.'};
 s.mega.profiles[String(rr.id)]=id;ins(s,'Uçuş profili: '+p.name,rr.from+' → '+rr.to);return {ok:true};
}
function retrofit(s,planeId,type){ensure(s);const p=s.planes.find(z=>z.id===Number(planeId));if(!p||!retrofitKeys.includes(type))return {ok:false,error:'Uçak veya modernizasyon tipi bulunamadı.'};
 const mods=s.mega.retrofits[String(p.id)]||(s.mega.retrofits[String(p.id)]={});const lvl=mods[type]||0;
 if(lvl>=3)return {ok:false,error:'Bu uçakta maksimum modernizasyon seviyesine ulaşıldı.'};
 const model=find(D.AIRCRAFT,p.model),cost=r(model.price*(.022+lvl*.018)*(1-effect(s,'projectCost')*.3),2);
 if(s.cash<cost)return {ok:false,error:'Modernizasyon için nakit yetersiz.'};
 s.cash=r(s.cash-cost);mods[type]=lvl+1;ins(s,'Filo modernizasyonu',`${p.name}: ${type} seviye ${lvl+1}`);return {ok:true,cost};
}
function setInsurance(s,id){ensure(s);if(!policies[id])return {ok:false,error:'Sigorta türü bulunamadı.'};s.mega.insurance=id;ins(s,'Sigorta kapsamı',policies[id].name);return {ok:true}}
function setClub(s,id){ensure(s);if(!clubs[id])return {ok:false,error:'Sadakat programı bulunamadı.'};s.mega.club=id;ins(s,'Müşteri kulübü',clubs[id].name);return {ok:true}}
function train(s){ensure(s);const m=s.mega;if(m.training>=6)return {ok:false,error:'Eğitim seviyesi en yüksek düzeyde.'};const cost=r(1.6+m.training*2.3,2);if(s.cash<cost)return {ok:false,error:'Eğitim için nakit yetersiz.'};s.cash=r(s.cash-cost);m.training++;ins(s,'Eğitim ve emniyet',`Mürettebat eğitimi seviye ${m.training}`);return {ok:true,cost}}
function audit(s){ensure(s);const f=E.forecast(s);return {fuelPrice:fuelIndex(s),income:f.income,expenses:f.expenses,profit:f.profit,reliability:s.mega.reliability,loyalty:s.mega.loyalty,tech:s.mega.technology.length,projects:s.mega.projects.length,retrofits:Object.values(s.mega.retrofits).reduce((a,p)=>a+retrofitKeys.reduce((k,t)=>k+(p[t]||0),0),0),lateFlights:f.routes.reduce((a,b)=>a+Math.round(b.trips*2*(1-(b.punctuality||1))),0),carbon:f.routes.reduce((a,b)=>a+(b.emissions||0),0)};}
// Compatibility wrappers use the V2 accounting pipeline. No parallel simulation.
const original={ensure:X.ensure,route:X.route,overhead:X.overhead,valuation:X.valuation,postTick:X.postTick};
X.ensure=function(s){const out=original.ensure(s);return ensure(out)};
X.route=function(s,rr,b){return modifiers(s,rr,original.route(s,rr,b))};
X.overhead=function(s,weekly){const base=original.overhead(s,weekly);return overhead(s,weekly,base)};
X.valuation=function(s){return valuation(s,original.valuation(s))};
X.postTick=function(s,weekly,extra){original.postTick(s,weekly,extra);postTick(s,weekly,extra)};
const oldNewGame=E.newGame,oldValidate=E.validateSave,oldRemove=E.removeRoute,oldSell=E.sellPlane;
E.newGame=function(options){const s=oldNewGame(options);ensure(s);return s};
E.validateSave=function(s){if(!oldValidate(s))return false;if(s.mega){if(!plain(s.mega))return false;if(s.mega.technology&&!Array.isArray(s.mega.technology))return false;if(s.mega.projects&&!Array.isArray(s.mega.projects))return false;if((s.mega.technology?.length||0)>72||(s.mega.projects?.length||0)>18)return false;
 if(s.mega.technology?.some(id=>!find(D.MEGA_TECH,id)))return false;if(s.mega.projects?.some(id=>!find(D.MEGA_PROJECTS,id)))return false;
 if(s.mega.retrofits&&(!plain(s.mega.retrofits)||Object.values(s.mega.retrofits).some(v=>!plain(v)||Object.values(v).some(n=>!Number.isInteger(n)||n<0||n>3))))return false;
}return true};
E.removeRoute=function(s,id){const result=oldRemove(s,id);if(result.ok&&s.mega)delete s.mega.profiles[String(id)];return result};
E.sellPlane=function(s,id){const result=oldSell(s,id);if(result.ok&&s.mega)delete s.mega.retrofits[String(id)];return result};
const API={ensure,effect,fuelIndex,demandIndex,policies,clubs,retrofitKeys,research,project,setProfile,retrofit,setInsurance,setClub,train,audit};
E.mega=API;root.AIR_MEGA=API;
if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
