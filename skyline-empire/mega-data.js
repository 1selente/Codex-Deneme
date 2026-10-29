(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./expansion-data.js'):null);
// Coordinates are broad route-map approximations, not navigational data.
const airportRows=`EDO|Edremit|Türkiye|39.55|27.01|66|2.0|0
EZS|Elazığ|Türkiye|38.6|39.28|75|1.2|0
BJV|Bodrum|Türkiye|37.25|27.66|93|2.4|0
DLM|Dalaman|Türkiye|36.71|28.79|80|2.3|0
ERZ|Erzurum|Türkiye|39.96|41.17|67|1.1|0
KYA|Konya|Türkiye|37.98|32.56|71|1.2|0
BAL|Batman|Türkiye|37.93|41.12|53|1|0
MQM|Mardin|Türkiye|37.22|40.63|67|1.7|0
MLX|Malatya|Türkiye|38.44|38.09|64|1.1|0
ERC|Erzincan|Türkiye|39.71|39.53|50|1.1|0
BSL|Basel|İsviçre|47.59|7.53|110|1.4|1
GVA|Cenevre|İsviçre|46.24|6.11|126|1.7|1
BRU|Brüksel|Belçika|50.9|4.49|132|1.5|1
BUD|Budapeşte|Macaristan|47.43|19.26|118|1.8|1
SOF|Sofya|Bulgaristan|42.69|23.41|94|1.2|1
BEG|Belgrad|Sırbistan|44.82|20.3|100|1.4|1
SKG|Selanik|Yunanistan|40.52|22.97|103|2.1|1
NAP|Napoli|İtalya|40.89|14.29|114|2.1|1
VCE|Venedik|İtalya|45.51|12.35|125|2.5|1
HAM|Hamburg|Almanya|53.63|9.99|126|1.3|1
HEL|Helsinki|Finlandiya|60.32|24.96|111|1.5|1
KEF|Reykjavik|İzlanda|63.99|-22.62|90|2|1
EDI|Edinburgh|Birleşik Krallık|55.95|-3.37|124|2|1
MAN|Manchester|Birleşik Krallık|53.36|-2.27|150|1.6|1
ALG|Cezayir|Cezayir|36.69|3.22|116|1.2|2
TUN|Tunus|Tunus|36.85|10.23|92|1.6|2
LOS|Lagos|Nijerya|6.58|3.32|151|1.1|2
ACC|Akra|Gana|5.61|-0.16|99|1.2|2
DAR|Darüsselam|Tanzanya|-6.88|39.2|104|1.8|2
MCT|Maskat|Umman|23.59|58.28|126|1.7|2
IKA|Tahran|İran|35.42|51.15|141|1.1|2
AMM|Amman|Ürdün|31.72|35.99|120|1.7|2
BOS|Boston|ABD|42.36|-71.01|141|1.8|3
IAD|Washington|ABD|38.95|-77.46|147|1.6|3
MSP|Minneapolis|ABD|44.88|-93.22|129|1.5|3
DEN|Denver|ABD|39.86|-104.67|134|1.8|3
YVR|Vancouver|Kanada|49.19|-123.18|138|2.2|3
YUL|Montreal|Kanada|45.47|-73.74|137|1.8|3
BOG|Bogota|Kolombiya|4.7|-74.15|153|1.3|3
LIM|Lima|Peru|-12.02|-77.11|136|1.8|3
CNX|Chiang Mai|Tayland|18.77|98.96|111|2.5|4
HAN|Hanoi|Vietnam|21.22|105.81|132|1.9|4
SGN|Ho Chi Minh|Vietnam|10.82|106.65|162|1.7|4
PUS|Busan|Güney Kore|35.18|129.07|135|1.8|4
KIX|Osaka|Japonya|34.44|135.24|153|2.1|4
GOI|Goa|Hindistan|15.38|73.83|135|2.5|4
AMD|Ahmedabad|Hindistan|23.08|72.63|125|1.2|4
CMB|Kolombo|Sri Lanka|7.18|79.88|103|2.1|4`;
D.CITIES.push(...airportRows.split('\n').map(row=>{const [id,name,country,lat,lon,demand,tourism,region]=row.split('|');return {id,name,country,lat:+lat,lon:+lon,demand:+demand,tourism:+tourism,region:+region}}));
const aircraftRows=`at72|ATR 72-600|Bölgesel|72|1600|510|14|.003|.0018|.016|71|1
dhc8|Dash 8 Q400|Bölgesel|82|2050|650|17|.0036|.0021|.019|72|1
e175|Embraer E175|Bölgesel|88|3700|800|21|.0044|.0023|.022|77|1
e195e2|Embraer E195-E2|Dar gövde|146|4800|836|37|.0059|.003|.033|86|2
a320neo|Airbus A320neo|Dar gövde|180|6200|840|46|.0076|.0037|.039|87|2
a321neo|Airbus A321neo|Dar gövde|220|7300|848|59|.0091|.0042|.043|88|3
a321xlr|Airbus A321XLR|Uzun menzil dar gövde|210|8700|850|74|.0095|.0045|.046|91|4
b737700|Boeing 737-700|Dar gövde|132|5400|838|28|.0066|.0037|.033|74|2
b737900|Boeing 737-900ER|Dar gövde|190|5900|842|42|.0088|.0041|.041|78|2
b737max9|Boeing 737 MAX 9|Dar gövde|205|6500|841|55|.0089|.0044|.044|85|3
b7879|Boeing 787-9|Geniş gövde|296|14100|904|125|.0195|.0089|.063|94|4
b78710|Boeing 787-10|Geniş gövde|330|11900|904|139|.0215|.0093|.066|94|5
a330900|Airbus A330-900neo|Geniş gövde|298|13400|875|132|.021|.0096|.065|91|4
a350900|Airbus A350-900|Geniş gövde|325|15000|905|161|.024|.0103|.07|96|5
b777300|Boeing 777-300ER|Geniş gövde|396|13500|892|170|.029|.013|.077|85|5
b7779|Boeing 777-9|Geniş gövde|420|13500|900|228|.028|.013|.083|95|6
a340600|Airbus A340-600|Geniş gövde|370|13700|875|135|.035|.015|.09|79|5
c919|COMAC C919|Dar gövde|170|5500|835|37|.0074|.0039|.035|79|3`;
D.AIRCRAFT.push(...aircraftRows.split('\n').map(row=>{const [id,name,type,seats,range,speed,price,fuel,maint,crew,comfort,level]=row.split('|');return{id,name,type,seats:+seats,range:+range,speed:+speed,price:+price,fuel:+fuel,maint:+maint,crew:+crew,comfort:+comfort,level:+level}}));
const domains=[
{id:'digital',name:'Dijital & Gelir',icon:'🧠',effects:['demand','fare','marketing','loyalty','demand','fare','service','marketing','demand','fare','loyalty','fare'],names:['Akıllı Biletleme','Talep Sensörleri','Gerçek Zamanlı Fiyatlar','Dijital Sadakat','Ağ Analitiği','Müşteri Segmentasyonu','Kişisel Teklifler','Gelişmiş Reklam Hedefleme','Dinamik Dağıtım','Premium Satış Motoru','Tahmin Modelleri','Otonom Gelir Yönetimi']},
{id:'flight',name:'Uçuş Operasyonları',icon:'🛠️',effects:['fuel','wear','reliability','crew','fuel','wear','reliability','cargo','fuel','crew','wear','reliability'],names:['Rota Optimizasyonu','Dijital Bakım Defteri','Mürettebat Vardiyaları','Hızlı Turnaround','İleri Yakıt Planlaması','Durum İzleme','Gecikme Algoritması','Akıllı Yer Hizmetleri','Otonom Taksi','Kabin Ekip Verimi','Öngörücü Bakım 2.0','Kusursuz Operasyon']},
{id:'people',name:'Çalışanlar & Deneyim',icon:'👩‍✈️',effects:['satisfaction','morale','reliability','service','satisfaction','morale','loyalty','crew','satisfaction','service','morale','loyalty'],names:['Kabin Akademisi','Çalışan Yan Hakları','Kriz Eğitimleri','Konfor Laboratuvarı','Yolcu Geri Bildirimi','Ekip Rotasyonu','VIP İlişkiler','Akıllı Personel Planlama','Şikâyet Tahmini','İleri Yolcu Deneyimi','Liderlik Okulu','Yaşam Boyu Sadakat']},
{id:'logistics',name:'Lojistik & Kargo',icon:'📦',effects:['cargo','cargoFare','cargoCost','contract','cargo','cargoFare','cargoCost','contract','cargo','cargoFare','cargoCost','contract'],names:['Kargo Barkod Sistemi','Öncelikli Gönderi','Robotik Tasnif','Kurumsal CRM','Hızlı Yükleme','Soğuk Zincir Uzmanlığı','Otomatik Gümrük','Kurumsal Portal','Kargo Transfer Ağı','İleri Gümrük Analizi','Tahmine Dayalı Lojistik','Küresel Kargo Platformu']},
{id:'finance',name:'Finans & Risk',icon:'🏦',effects:['interest','insurance','upkeep','projectCost','interest','insurance','upkeep','projectCost','interest','insurance','upkeep','projectCost'],names:['Hazine Merkezi','Sigorta Analitiği','Tedarik Optimizasyonu','Satın Alma Pazarlığı','Kur Riski Planlama','Kapsamlı Reasürans','Akıllı Bütçeleme','Yatırım Portföyü','Finansal Stres Testi','Küresel Risk Havuzu','Yönetim Kontrol Sistemi','Kurumsal Holding']},
{id:'green',name:'Yeşil Havacılık',icon:'🌱',effects:['carbon','fuel','reliability','green','carbon','fuel','reliability','green','carbon','fuel','satisfaction','green'],names:['Emisyon Haritası','Yeşil İniş','Hava Durumu Tahmini','Yeşil Marka','SAF Testleri','Hafif Kompozitler','Gürültü Azaltma','Çevre Sertifikaları','İleri Karbon Analitiği','Elektrikli Yer Araçları','Sürdürülebilir Kabin','Sıfır Atık Ağı']}
];
D.MEGA_TECH=domains.flatMap(domain=>domain.names.map((name,index)=>({id:domain.id+'-'+(index+1),domain:domain.id,domainName:domain.name,icon:domain.icon,name,stage:index+1,cost:Math.round((1.5+index*1.15+index*index*.24)*10)/10,level:Math.min(6,1+Math.floor(index/2)),effect:domain.effects[index],power:Math.round((.009+(index%3)*.004)*1000)/1000,desc:'Kalıcı '+domain.effects[index]+' bonusu, üst teknoloji için temel oluşturur.'})));
const facilities=[
['term','Terminal ve Slot','🛬','demand',['Peron Planlaması','Hızlı Aktarma Terminali','Mega Terminal']],
['fleet','Teknik Hangar','🔧','wear',['Servis Atölyesi','Bölgesel Hangar','Küresel MRO Merkezi']],
['cargo','Kargo Kampüsü','📦','cargo',['Yük Deposu','Otomatik Tasnif','Küresel Lojistik Kampüsü']],
['school','Uçuş Akademisi','🎓','reliability',['Eğitim Birimi','Simülasyon Merkezi','Uluslararası Akademi']],
['digital','Ticari Platform','💻','fare',['Rezervasyon Merkezi','Sadakat Platformu','Kişisel Fiyat Merkezi']],
['sustain','Sürdürülebilirlik','🌳','carbon',['Karbon Ölçümü','Yeşil Yer Operasyonu','SAF Tesisi']]
];
D.MEGA_PROJECTS=facilities.flatMap(([family,familyName,icon,effect,names])=>names.map((name,i)=>({id:family+'-'+(i+1),family,familyName,icon,name,stage:i+1,effect,power:.025+i*.009,cost:Math.round((6+i*11+(family==='term'?3:0))*10)/10,upkeep:Math.round((.06+i*.07)*100)/100,desc:'Haftalık gider karşılığında kalıcı '+familyName.toLowerCase()+' gücü.'})));
const strategies=[
['commuter','İş Günü','Ekonomi',1.06,.99,.98,.94,.01],['flex','Esnek Bilet','Ekonomi',1.05,1.025,1.035,.97,.02],['lowcost','Ultra Düşük Maliyet','Ekonomi',1.16,.87,.88,.92,-.01],['regional','Bölgesel Bağlantı','Ekonomi',1.07,.96,.96,1.03,.015],
['leisure','Tatil Paketi','Turizm',1.17,.98,1.04,.92,.022],['family','Aile Dostu','Turizm',1.10,1.015,1.055,.95,.04],['resort','Tatil Köprüsü','Turizm',1.12,1.035,1.04,.89,.03],['adventure','Macera Rotası','Turizm',1.07,1.10,1.07,.92,.035],
['business','Kurumsal Bağlantı','Business',.94,1.15,1.07,.97,.04],['shuttle','İş Servisi','Business',.99,1.1,1.04,.92,.03],['flexpro','Esnek Business','Business',.91,1.2,1.09,.97,.045],['executive','Yönetici Hattı','Business',.86,1.29,1.14,.88,.06],
['premium','Premium Kabin','Lüks',.94,1.17,1.12,.88,.05],['first','First Class','Lüks',.83,1.33,1.21,.73,.065],['boutique','Butik Havayolu','Lüks',.91,1.26,1.14,.86,.055],['flagship','Amiral Gemi','Lüks',.88,1.3,1.2,.78,.07]
];
D.MEGA_PROFILES=strategies.map(([id,name,group,demand,fare,cost,cargo,satisfaction])=>({id,name,group,demand,fare,cost,cargo,satisfaction}));
const businessContracts=[
['fresh','Taze Ürün Nakliyatı',4,.25,.09,.6,8,27],['documents','Kritik Evrak',5,.38,.13,.9,10,33],['textile','Tekstil Zinciri',7,.5,.18,1.2,12,36],['electronics','Elektronik Dağıtım',10,.74,.26,1.9,12,43],['seafood','Soğutulmuş Deniz Ürünleri',12,.88,.33,2.2,11,47],['retail','Uluslararası Perakende',15,1.05,.4,2.8,14,51],['pharmacy','Küresel İlaç Nakliyesi',17,1.18,.48,3.2,13,56],['auto','Otomotiv Yan Sanayi',20,1.3,.5,3.6,15,60],['aerospace','Havacılık Bileşenleri',23,1.52,.65,4.2,15,64],['luxury','Lüks Moda Nakliyesi',25,1.8,.68,5,16,69],['emergency','Afet Lojistik Çözümü',28,1.95,.72,5.4,15,72],['worldcargo','Küresel E-ticaret Ağı',35,2.35,.92,6.8,18,78]
];
D.CARGO_CONTRACTS.push(...businessContracts.map(([id,name,minTons,payment,penalty,deposit,duration,rep])=>({id:'mega-'+id,name,duration,minTons,payment,penalty,deposit,rep})));
const eventDefs=[
['digital','Dijital Rezervasyon Talebi','💻','Yeni satış kanalı gündemde.',-1.1,1.2,.15],
['airport','Yeni Havalimanı İndirimi','🛬','Bölgesel terminale indirim gündemde.',-1.2,1.12,.12],
['strike','İş Gücü Müzakeresi','👷','Mürettebat yeni talepler sunuyor.',-1.8,1.09,.3],
['weather','Şiddetli Hava Olayı','🌧️','Uçuş güvenliği ve seferler baskı altında.',-1.7,1.08,.15],
['fuel','Yakıt Fiyatı Dalgalanması','⛽','Piyasada yüksek oynaklık var.',-2,1.1,.2],
['tourism','Turizm Şenliği','🏖️','Turizmde ani bir hareketlilik var.',-1.4,1.17,.3],
['cyber','Siber Güvenlik Uyarısı','🛡️','Rezervasyon altyapısı yenilenmeli.',-2,1.1,.2],
['competitor','Rakip Fiyat Savaşı','⚔️','Rakip havayolları biletlerini indiriyor.',-1.1,1.15,.2],
['award','Yolcu Memnuniyeti Ödülü','🏆','Hizmet kalitesi için yatırım fırsatı.',-2,1.09,.8],
['shipment','Kurumsal Kargo Fırsatı','📦','Yeni lojistik partnerleri arayışta.',-1.4,1.12,.4],
['climate','Emisyon Düzenlemesi','🌱','Yeşil filo yatırımı öneriliyor.',-1.6,1.04,.7],
['crew','Pilot Eğitim Programı','👩‍✈️','Ekip eğitimi için ortaklık teklifi.',-2.3,1.14,.7],
['cabin','Kabin Yenileme Kampanyası','🛎️','Yolcu deneyimi için fırsat.',-1.8,1.11,.4],
['bank','Banka Kredi Komitesi','🏦','Finansmana erişim ve risk dengesi.',-1.3,1.05,.2],
['international','Yeni Uçuş Hakları','🌍','Uluslararası pazarda büyüme fırsatı.',-2,1.16,.4],
['maintenance','Yedek Parça Sıkıntısı','🔧','Bileşen tedarik zinciri baskı altında.',-1.5,1.09,.18],
['festival','Bölgesel Festival','🎉','Yerel talepte kısa süreli artış.',-1.2,1.13,.4],
['loyalty','Sadakat Programı Daveti','💳','Müşteri kulübünü güçlendirme şansı.',-1.5,1.09,.4],
['safety','Uçuş Emniyeti Denetimi','📋','Bağımsız emniyet testi önerildi.',-2.2,1.07,.6],
['airporttech','Yeni Nesil Yer Hizmeti','🤖','Otomasyon sağlayıcısı ortaklık istiyor.',-2.5,1.14,.4]
];
D.EVENTS.push(...eventDefs.map(([id,title,emoji,desc,cash,demand,rep])=>({id:'mega-event-'+id,title,emoji,desc,options:[{label:'Proaktif yatırım yap',cash,rep,effect:{weeks:5,demand,fuel:.985}},{label:'Sınırlı önlem al',cash:cash*.3,rep:rep*.25,effect:{weeks:3,demand:1+(demand-1)*.3}},{label:'Maliyetleri koru, risk al',cash:.15,rep:-.5,effect:{weeks:2,demand:.985,fuel:1.02}}]})));
D.MEGA_COUNTS={airports:48,aircraft:18,technology:72,projects:18,profiles:16,contracts:12,events:20};
root.AIR_MEGA_DATA=D.MEGA_COUNTS;
if(typeof module!=='undefined')module.exports=D;
})(typeof globalThis!=='undefined'?globalThis:this);
