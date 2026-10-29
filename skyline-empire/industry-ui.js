(function(root){
'use strict';
const S={hub:null,filter:'all'};
function views(s,h){
 const {D,E,head,panel,btn,stat,tag,fmt,money,esc,city}=h,I=E.industry,i=s.industry,f=E.forecast(s);
 const row=(name,description,button='',status='')=>`<div class="exp-row"><div class="exp-text"><strong>${esc(name)}</strong><small>${description}</small>${status?`<span class="ind-status">${esc(status)}</span>`:''}</div><div class="exp-buttons">${button}</div></div>`;
 const act=(label,operation,id,disabled=false,kind='primary')=>btn(esc(label),'industry-'+operation,`data-id="${esc(id)}" ${disabled?'disabled':''}`,kind);
 const active=z=>z&&z.until>=s.week;
 const filterCount=(arr)=>arr.filter(z=>active(z)).length;
 const n=(name,value,desc,emoji)=>stat(name,value,desc,emoji);
 const empty='<p class="tip">Henüz yok. Yeni anlaşma veya yatırım yapabilirsin.</p>';
 function network(){
  const citySlots=D.IND_SLOTS.map(p=>{const owned=i.slots.includes(p.id),reachable=s.hubs.includes(p.airport)||s.routes.some(z=>z.from===p.airport||z.to===p.airport),can=reachable&&s.level>=p.level&&s.cash>=p.cost;
    return row(p.name,`Tek seferlik ${money(p.cost)} · Haftalık ${money(p.upkeep)} · Yolcu talebi +%${fmt(p.demand*100)} · dakiklik +%${fmt(p.delay*100)}`,owned?tag('✓ Tahsisli','good'):act('Slot Al','slot',p.id,!can),!reachable?'Önce havalimanına hat aç':'')}).join('');
  const hub=s.hubs.includes(S.hub)?S.hub:s.hub,routeCount=s.routes.filter(z=>z.active&&z.from===hub).length;
  const choices=s.hubs.map(z=>`<button class="tab ${hub===z?'active':''}" data-action="industry-hub" data-id="${esc(z)}">${esc(city(z)?.name||z)}</button>`).join('');
  const bank=D.IND_WAVES.map(p=>row(p.name,`Aktarma potansiyeli +%${fmt(p.lift*100)} · Yoğunluk riski +%${fmt(p.congestion*100)} · ${money(p.cost)}/hafta · En az ${p.minRoutes} çıkış`,i.waves[hub]===p.id?tag('✓ Uygulanıyor','good'):act('Programla','wave',hub+':'+p.id,routeCount<p.minRoutes||s.cash<.08),routeCount<p.minRoutes?'Aktif kalkış hattı eksik':'' )).join('');
  return head('AĞ MİMARİSİ','Slotlar & Aktarma Dalgaları','Havalimanı anlaşmaları yerel yolcu talebini artırır. Aktarma bankaları hat sayısına bağlı gelir sağlar ancak yoğunluk gecikme ve gider oluşturur.')+
  `<div class="stats-grid">${n('SLOT ANLAŞMASI',i.slots.length+'/24','Havalimanı ayrıcalığı','🛬')}${n('AKTARMA MERKEZİ',Object.keys(i.waves).length,'Planlı banka sahipleri','🌐')}${n('AKTİF HATLAR',s.routes.filter(z=>z.active).length,'Hat bütünleşmesi','✈')}${n('HAFTALIK YOLCU',fmt(f.passengers),'Aktarmalar dahil','♙')}</div>`+
  panel('🛬 Öncelikli Terminal Slotları',`<div class="ind-scroll"><div class="list-rows">${citySlots}</div></div>`,'24 HAVALİMANI SÖZLEŞMESİ')+
  panel('🕑 Hub Aktarma Dalgaları',`<div class="tabs mega-tabs">${choices}</div><p class="tip">${esc(hub)} kalkışında ${routeCount} aktif hat var. Birden fazla bağlantılı rota daha yüksek getiriler sağlar.</p><div class="list-rows">${bank}</div>`,'18 TRANSFER PROGRAMI');
 }
 function corporate(){
  const contracts=D.IND_CORPORATE.map(p=>{const one=i.corporate.find(z=>z.id===p.id&&active(z)),inRegion=s.routes.some(z=>z.active&&city(z.to)?.region===p.region);return row(p.name,`Bölge ${p.region+1} · ${p.paxGoal} yolcu ve %${fmt(p.punctuality*100)} dakiklik · Başarılı haftada +${money(p.bonus)}; tutmazsa −${money(p.penalty)} · ${p.duration} hafta`,one?tag(`✓ ${one.until-s.week+1} hafta`,'good'):act('Anlaşma Yap','corporate',p.id,!inRegion||s.cash<p.fee||s.rep<p.rep||filterCount(i.corporate)>=3),`Giriş ${money(p.fee)} · İtibar ${p.rep} gerekli`)}).join('');
  const ancillary=D.IND_ANCILLARY.map(p=>row(p.name,`Kurulum ${money(p.capital)} · ${money(p.upkeep)}/hafta · Yolcu başına $${fmt(p.perPax*1e6)} yan satış · Hizmet katkısı ${fmt(p.trust*100)} puan`,i.ancillary.includes(p.id)?tag('✓ Faaliyette','good'):act('İşletmeyi Aç','ancillary',p.id,i.ancillary.length>=8||s.cash<p.capital||s.level<p.level),`Seviye ${p.level} · Müşteri sayısıyla ölçeklenir`)).join('');
  return head('TİCARİ GELİŞME','Kurumsal Satış & Yan Gelir','Kargo dışında yeni yolcu kontratları ve müşteri başına gerçek yan gelirler. Sözleşme kalitesi bölgeye, yolcu sayısına ve dakikliğe bağlıdır.')+
  `<div class="stats-grid">${n('KURUMSAL SÖZLEŞME',filterCount(i.corporate)+'/3','Aktif gelir riski','🧳')}${n('YAN İŞLETME',i.ancillary.length+'/8','Yolcu bazlı satış','🛍')}${n('YOLCU HACMİ',fmt(f.passengers),'Haftalık tahmin','♙')}${n('SON ANLAŞMA',money(i.weekly.at(-1)?.corporateNet||0),'Başarı/ceza dengesi','＄')}</div>`+
  panel('🧳 Kurumsal Yolcu Portföyü',`<div class="list-rows">${contracts}</div>`,'20 SEKTÖR AĞI')+panel('🛍 Yolcuya Ek Hizmetler',`<div class="list-rows">${ancillary}</div>`,'20 YAN GELİR ÜRÜNÜ');
 }
 function supply(){
  const vendors=D.IND_VENDORS.map(p=>row(p.name,`${p.categoryName} · Kalite +%${fmt(p.quality*100)} · İş yükü maliyeti +%${fmt(p.cost*100)} · Haftalık ${money(p.fee)}`,i.vendors[p.category]===p.id?tag('✓ Sözleşmeli','good'):act('Tedarikçi Seç','vendor',p.id,s.cash<.12+p.fee),`Rakip tekliflerden yalnızca birini kullanabilirsin`)).join('');
  const orders=D.IND_ORDERS.map(p=>{const plane=D.AIRCRAFT.find(a=>a.id===p.model),o=i.orders.find(x=>x.id===p.id),total=plane.price*p.discount,deposit=total*p.deposit;
   return row(p.name,`Liste ${money(plane.price)} · İndirimli ${money(total)} · Şimdi ${money(deposit)} · ${p.lead} hafta sonra kalan %75`,o?tag(`✓ Teslim: hafta ${o.due}`,'good'):act('Sipariş Ver','order',p.id,s.level<p.level||s.cash<deposit||i.orders.length>=3),`En geç teslimata kadar ${money(total-deposit)} nakit hazır olmalı`)}).join('');
  return head('TEDARİK VE ÜRETİM','Satınalma & Fabrika','On tedarik kategorisinde rekabetçi ihale; peşin ödemeli ve gerçek teslimat süreli fabrika siparişleriyle filoyu planla.')+
  `<div class="stats-grid">${n('TEDARİKÇİ AĞI',Object.keys(i.vendors).length+'/10','Etkin hizmet kategorisi','⚙')}${n('ÜRETİM BANDI',i.orders.length+'/3','Beklenen yeni uçak','🏭')}${n('TESLİM EDİLEN',i.delivered,'Fabrika kaynaklı uçak','✈')}${n('FİLO',s.planes.length,'Tüm uçaklar','◈')}</div>`+
  panel('⚙ Rekabetçi Tedarik İhaleleri',`<div class="list-rows">${vendors}</div>`,'20 TEDARİK TEKLİFİ')+panel('🏭 Yeni Uçak Sipariş Defteri',`<div class="list-rows">${orders}</div>`,'16 FABRİKA ANLAŞMASI');
 }
 function competition(){
  const current=active(i.tactic)?D.IND_TACTICS.find(z=>z.id===i.tactic.id):null;
  const tactics=D.IND_TACTICS.map(p=>row(p.name,`Pazar baskısı +%${fmt(p.lift*100)} · Rakip karşı hamle riski +%${fmt(p.counter*100)} · ${p.duration} hafta · Başlangıç ${money(p.cost)}`,current?.id===p.id?tag(`✓ ${i.tactic.until-s.week+1} hafta`,'good'):act('Uygula','tactic',p.id,!!current||s.cash<p.cost||s.rep<p.rep),`İtibar ${p.rep} · Aynı anda tek strateji`)).join('');
  return head('REKABET YÖNETİMİ','Havayolu Rekabet Masası','Rakip payı artık sadece pasif istatistik değil: hedefli stratejiler yolcu talebine, rekabet maliyetine ve uzun dönem itibara dokunur.')+
  `<div class="stats-grid">${n('AKTİF HAMLE',current?'1/1':'0/1',current?.name||'Strateji seç','♟')}${n('RAKİP TOPLAM PAYI','%'+fmt(s.rivals.reduce((a,z)=>a+z.share,0)),'Pazar baskısı','⚔')}${n('ŞİRKET İTİBARI',fmt(s.rep),'Kamuoyu güveni','★')}${n('BEKLENEN KÂR',money(f.profit),'Rekabet koşulları dahil','＄')}</div>`+
  panel('⚔ Rekabet Karşı Hamleleri',`<div class="list-rows">${tactics}</div>`,'18 OYUN PLANI');
 }
 function compliance(){
  const cert=D.IND_SAFETY.map(p=>{const z=i.safety.find(z=>z.id===p.id&&active(z));return row(p.name,`Denetim ${money(p.cost)} · ${p.duration} hafta · Güvenilirlik +%${fmt(p.safety*100)} · ${money(p.fee)}/hafta`,z?tag(`✓ ${z.until-s.week+1} hafta`,'good'):act('Akredite Ol','safety',p.id,s.cash<p.cost||s.rep<p.rep||filterCount(i.safety)>=8),`İtibar ${p.rep} gerekli · Bitişte yenilenir`)}).join('');
  const labor=D.IND_LABOR.map(p=>{const z=i.labor[p.unit];return row(p.name,`Ücret ${money(p.wage)}/hafta · Moral +${fmt(p.morale)} · ${p.term} hafta · İmza ${money(p.signing)}`,active(z)&&z.id===p.id?tag(`✓ ${z.until-s.week+1} hafta`,'good'):act('Mutabakat','labor',p.id,active(z)||s.cash<p.signing),`Personel grubunda aynı anda tek sözleşme`)}).join('');
  const protocols=D.IND_CONTINGENCY.map(p=>row(p.name,`Tehdit etkisini %${fmt(p.protection*100)} azaltır · ${money(p.setup)} kurulum · ${money(p.fee)}/hafta`,i.contingency[p.threat]===p.id?tag('✓ Devrede','good'):act('Devreye Al','contingency',p.id,s.cash<p.setup),`Aynı risk alanındaki protokolü değiştirir`)).join('');
  return head('EMNİYET VE İNSAN','Uyum, İş Barışı & Kriz','Sertifikalar süreli, personel mutabakatları ücretli ve kriz protokolleri sigorta gibi koruyucudur. Tümünün dakiklik ve finans üzerinde bedeli bulunur.')+
  `<div class="stats-grid">${n('GEÇERLİ DENETİM',filterCount(i.safety)+'/8','Yenilenebilir akreditasyon','🛡')}${n('İŞ MUTABAKATI',Object.values(i.labor).filter(active).length+'/4','Dört personel grubu','♙')}${n('KRİZ HAZIRLIĞI',Object.keys(i.contingency).length+'/4','Korunan tehdit alanları','🚨')}${n('GÜVENİLİRLİK',fmt(s.mega.reliability)+'%','Filo güvenlik puanı','✓')}</div>`+
  panel('🛡 Bağımsız Emniyet Akreditasyonları',`<div class="list-rows">${cert}</div>`,'20 SÜRELİ SERTİFİKA')+
  panel('♙ İş Barışı & Toplu Sözleşmeler',`<div class="list-rows">${labor}</div>`,'16 PERSONEL PAKETİ')+
  panel('🚨 İş Sürekliliği & Kriz Protokolleri',`<div class="list-rows">${protocols}</div>`,'16 KORUMA SEÇENEĞİ');
 }
 function treasury(){
  const positions=i.treasury.map(z=>{const p=D.IND_TREASURY.find(x=>x.id===z.id);return row(p.name,`Yatırılan ${money(z.principal)} · Beklenen getiri ${money(z.principal*p.rate)}`,tag(`Vade ${z.due} · ${Math.max(0,z.due-s.week+1)} hafta`,'good'))}).join('');
  const products=D.IND_TREASURY.map(p=>row(p.name,`${p.term} hafta · Getiri %${fmt(p.rate*100)} · Ana para ${money(p.min*2)} · Vade bitince ana para ve faiz nakde geçer`,i.treasury.some(z=>z.id===p.id)?tag('✓ Portföyde','good'):act('Vadeli Yatırım','bond',p.id,s.cash-p.min*2<2||i.treasury.length>=3),`Portföy ve serbest nakit dengesini koru`)).join('');
  const held=i.treasury.reduce((a,z)=>a+z.principal,0);
  const chart=i.weekly.slice(-24).map(z=>`<div class="ind-tiny" title="Hafta ${z.week} · Ticari gelir ${money(z.industryIncome)}" style="height:${Math.max(7,Math.min(100,z.industryIncome*30+10))}%"></div>`).join('');
  return head('HAZİNE & YATIRIMCI','Sermaye Yönetimi','Vadeli nakdi planla. Yatırım sırasında sermaye kasadan çıkar ama şirket değerinde korunur; vade sonunda anapara serbest kalır, getiri haftalık rapora yazılır.')+
  `<div class="stats-grid">${n('SERBEST NAKİT',money(s.cash),'Günlük operasyon sermayesi','＄')}${n('VADELİ PORTFÖY',money(held),'Şirket değeri içinde','🏦')}${n('AÇIK YATIRIM',i.treasury.length+'/3','Vadeli pozisyonlar','▣')}${n('DÖNEMSEL FAİZ',money(i.weekly.at(-1)?.treasuryIncome||0),'Son hafta gerçekleşen','↗')}</div>`+
  panel('🏦 Aktif Hazine Portföyü',positions||empty)+panel('📊 Yan Gelirlerin Gelişimi',chart?`<div class="ind-spark">${chart}</div>`:empty)+panel('📋 Vadeli Hazine Araçları',`<div class="list-rows">${products}</div>`,'12 FİNANSAL ÜRÜN');
 }
 return {network,corporate,supply,competition,compliance,treasury};
}
root.SKY_INDUSTRY_UI={views,filter:S};
if(typeof module!=='undefined')module.exports=root.SKY_INDUSTRY_UI;
})(typeof globalThis!=='undefined'?globalThis:this);
