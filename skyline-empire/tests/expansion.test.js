'use strict';
const assert=require('node:assert/strict');
const D=require('../data.js');require('../expansion-data.js');
const E=require('../engine.js');require('../expansion-engine.js');
let passed=0,failed=0;
const test=(name,fn)=>{try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+'\n'+e.stack)}};
const approx=(a,b,eps=.006)=>assert(Math.abs(a-b)<=eps,`${a} vs ${b}`);
const run=()=>E.newGame({name:'Test Airline',seed:42,difficulty:'easy'});
test('Tüm veri kümesi tekil, geçerli ve geniş',()=>{
  assert(D.CITIES.length>=70);assert(D.AIRCRAFT.length>=20);assert(D.UPGRADES.length>=20);
  for(const arr of [D.CITIES,D.AIRCRAFT,D.UPGRADES,D.POLICIES,D.TARIFFS,D.DEPARTMENTS,D.CARGO,D.ALLIANCES,D.CAMPAIGNS,D.CARGO_CONTRACTS]){
    assert.equal(new Set(arr.map(x=>x.id)).size,arr.length);
  }
  for(const pl of D.AIRCRAFT){assert(pl.seats>0&&pl.range>500&&pl.price>0&&pl.speed>100)}
  for(const c of D.CITIES){assert(c.lon>=-180&&c.lon<=180&&c.lat>=-90&&c.lat<=90)}
});
test('Başlangıç verileri, ticari tahmin ve finans eşitliği',()=>{const s=run(),f=E.forecast(s);assert.equal(s.expansion.staff.operations,2);assert.equal(s.expansion.service,'balanced');approx(f.profit,f.income-f.expenses);assert(Number.isFinite(E.valuation(s)));assert(E.validateSave(s));});
test('Eski kayıt bozulmadan yeni veri şemasına geçer',()=>{const s=run();delete s.expansion;for(const r of s.routes){delete r.cargo;delete r.tariff;}assert(E.validateSave(s));E.expansion.ensure(s);assert.equal(s.routes[0].tariff,'standard');assert.equal(s.routes[0].cargo,'none');assert(E.forecast(s).profit<Infinity);});
test('Departman ataması, maaş ve kapasite aynı simülasyona bağlı',()=>{const s=run(),before=E.forecast(s);const b=E.expansion.upgradeStaff(s,'sales');assert(b.ok);assert(s.cash<120);assert(E.forecast(s).expenses>before.expenses);assert(!E.expansion.upgradeStaff(s,'missing').ok);assert(!E.expansion.upgradeStaff(s,'sales').error);});
test('Yolcu politikası ve dinamik fiyat sınıfı kazancı etkiler',()=>{const s=run(),base=E.forecast(s).routes[0];assert(E.expansion.setPolicy(s,'premium').ok);const premium=E.forecast(s).routes[0];assert(premium.income>=base.income);assert(E.expansion.setTariff(s,3,'business').ok);assert.notEqual(E.forecast(s).routes[0].income,premium.income);assert(!E.expansion.setTariff(s,3,'invalid').ok);});
test('Kargo tarifesi, tonaj, gelir, sözleşme maliyeti',()=>{const s=run();assert(E.expansion.setCargo(s,3,'general').ok);const a=E.forecast(s);assert(a.routes[0].cargoTons>0&&a.routes[0].freight>0);assert(E.expansion.signCargo(s,'postal').ok);const b=E.forecast(s);assert(b.income>a.income);assert(!E.expansion.signCargo(s,'postal').ok);assert(!E.expansion.setCargo(s,33,'none').ok);assert(E.expansion.setCargo(s,3,'none').ok);const c=E.forecast(s);assert(c.expenses>b.expenses,'eksik sözleşme cezası gider olarak yazılmalı');});
test('Hedge gerçekten yakıt giderlerini azaltır ve süresi geçer',()=>{const s=run(),base=E.forecast(s).routes[0].expense;assert(E.expansion.hedgeFuel(s).ok);assert(E.forecast(s).routes[0].expense<base);assert(!E.expansion.hedgeFuel(s).ok);s.week=50;E.expansion.ensure(s);assert.equal(E.forecast(s).routes[0].expense,base);});
test('Terminal ve ittifak artışı talep ve finansı etkiler',()=>{const s=run();const prior=E.forecast(s);assert(E.expansion.hubUpgrade(s,'IST').ok);assert(E.forecast(s).expenses>prior.expenses);assert(!E.expansion.hubUpgrade(s,'FCO').ok);assert(E.expansion.joinAlliance(s,'regional').ok);assert(E.forecast(s).income>=prior.income);assert(!E.expansion.joinAlliance(s,'regional').ok)});
test('Kampanyalar zamanla biter, mükerrer kampanya kilitli',()=>{const s=run();assert(E.expansion.launchCampaign(s,'domestic').ok);assert(!E.expansion.launchCampaign(s,'domestic').ok);assert(s.expansion.campaigns.length===1);s.week=10;E.expansion.postTick(s,[],E.expansion.overhead(s,[]));assert.equal(s.expansion.campaigns.length,0);});
test('Bakım modu yıpranmayı azaltır ve hesap kırılmaz',()=>{const a=run(),b=run();E.expansion.setMaintenance(a,'proactive');E.tick(a);E.tick(b);assert(a.planes[0].wear<b.planes[0].wear);});
test('Deterministik simülasyon tüm sistemlerle',()=>{const a=run(),b=run();for(const s of [a,b]){E.expansion.setCargo(s,3,'express');E.expansion.setPolicy(s,'premium');E.expansion.upgradeStaff(s,'sales');E.expansion.launchCampaign(s,'domestic');E.expansion.signCargo(s,'postal')}for(let i=0;i<120;i++){if(a.pendingEvent){E.resolveEvent(a,1);E.resolveEvent(b,1)}if(a.bankrupt)break;assert.deepEqual(E.tick(a),E.tick(b));assert.deepEqual(a,b);assert(Number.isFinite(a.cash));}assert(a.expansion.weeklyStats.length<=120);});
test('300 hafta ek sistemlerle istikrarlı; depolama sınırları',()=>{const s=run();E.expansion.setCargo(s,3,'general');E.addRoute(s,{from:'IST',to:'FCO',plane:2,trips:7,price:1.05,marketing:1});E.expansion.setCargo(s,s.routes.at(-1).id,'general');for(let i=0;i<300;i++){if(s.pendingEvent)E.resolveEvent(s,1);const result=E.tick(s);if(s.bankrupt)break;assert(result.ok);assert(Number.isFinite(E.forecast(s).profit));assert(Number.isFinite(E.valuation(s)));assert(s.cash>-1e9);assert(E.validateSave(JSON.parse(JSON.stringify(s))))}assert(s.expansion.weeklyStats.length<=120);assert(s.history.length<=120);});
test('Yeni görevler, eski görevler ve ödül tekrar önleme',()=>{const s=run();assert(E.claimContract(s,'launch').ok);assert(!E.claimContract(s,'launch').ok);assert(!E.claimContract(s,'cargo-first').ok);E.expansion.setCargo(s,3,'general');E.tick(s);assert(E.claimContract(s,'cargo-first').ok);});
test('Geçersiz kararlar para çalmaz',()=>{const s=run(),cash=s.cash;assert(!E.expansion.joinAlliance(s,'invalid').ok);assert(!E.expansion.hubUpgrade(s,'bogus').ok);assert(!E.expansion.launchCampaign(s,'bogus').ok);assert(!E.expansion.signCargo(s,'bogus').ok);assert(!E.expansion.setCargo(s,3,'bogus').ok);assert.equal(s.cash,cash);});
console.log(`\n${passed} passed, ${failed} failed`);if(failed)process.exitCode=1;
