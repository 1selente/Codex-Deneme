(function(root){
'use strict';
const D=root.AIR_DATA||(typeof require!=='undefined'?require('./data.js'):null);
const extraCities=[
['AOE','Eskişehir','Türkiye',39.78,30.52,64,1.1,0],['SZF','Samsun','Türkiye',41.27,36.34,76,1.3,0],['ASR','Kayseri','Türkiye',38.77,35.49,74,1.5,0],['TZX','Trabzon','Türkiye',41,39.79,69,1.6,0],['GZT','Gaziantep','Türkiye',37.06,37.48,78,1.2,0],['VAN','Van','Türkiye',38.47,43.33,60,1.2,0],['DIY','Diyarbakır','Türkiye',37.91,40.22,68,1,0],['ECN','Lefkoşa','KKTC',35.15,33.49,72,1.5,0],
['VIE','Viyana','Avusturya',48.11,16.57,119,1.8,1],['PRG','Prag','Çekya',50.1,14.26,110,1.8,1],['CPH','Kopenhag','Danimarka',55.62,12.65,113,1.5,1],['OSL','Oslo','Norveç',60.19,11.1,102,1.2,1],['ARN','Stockholm','İsveç',59.65,17.92,116,1.3,1],['WAW','Varşova','Polonya',52.17,20.97,123,1.1,1],['DUB','Dublin','İrlanda',53.42,-6.27,108,1.7,1],['LIS','Lizbon','Portekiz',38.78,-9.14,114,2,1],['BCN','Barselona','İspanya',41.3,2.08,153,2.4,1],['MXP','Milano','İtalya',45.63,8.73,137,1.9,1],['MUC','Münih','Almanya',48.35,11.79,131,1.6,1],
['RUH','Riyad','Suudi Arabistan',24.96,46.7,130,1.3,2],['AUH','Abu Dabi','BAE',24.43,54.65,121,1.7,2],['KWI','Kuveyt','Kuveyt',29.23,47.97,96,1.2,2],['ADD','Addis Ababa','Etiyopya',8.98,38.8,103,1.1,2],['NBO','Nairobi','Kenya',-1.32,36.92,116,1.5,2],['JNB','Johannesburg','Güney Afrika',-26.13,28.24,137,1.3,2],['CMN','Kazablanka','Fas',33.37,-7.59,119,1.4,2],
['SFO','San Francisco','ABD',37.62,-122.38,152,2,3],['MIA','Miami','ABD',25.79,-80.29,142,2.2,3],['DFW','Dallas','ABD',32.9,-97.04,139,1.4,3],['SEA','Seattle','ABD',47.45,-122.31,127,1.6,3],['MEX','Meksiko','Meksika',19.44,-99.07,141,1.6,3],['EZE','Buenos Aires','Arjantin',-34.82,-58.54,142,1.5,3],['SCL','Santiago','Şili',-33.39,-70.79,120,1.4,3],
['KUL','Kuala Lumpur','Malezya',2.75,101.71,137,1.6,4],['CGK','Cakarta','Endonezya',-6.13,106.66,162,1.5,4],['MNL','Manila','Filipinler',14.51,121.02,138,1.3,4],['PEK','Pekin','Çin',40.08,116.59,172,1.7,4],['PVG','Şanghay','Çin',31.14,121.81,180,1.8,4],['TPE','Taipei','Tayvan',25.08,121.23,135,1.6,4],['AKL','Auckland','Yeni Zelanda',-37,174.79,112,1.9,4],['MEL','Melbourne','Avustralya',-37.67,144.84,133,1.8,4]
];
D.CITIES.push(...extraCities.map(([id,name,country,lat,lon,demand,tourism,region])=>({id,name,country,lat,lon,demand,tourism,region})));
D.AIRCRAFT.push(...[
{id:'crj',name:'Bombardier CRJ900',type:'Bölgesel',seats:90,range:2900,speed:820,price:18,fuel:.0046,maint:.0025,crew:.023,comfort:69,level:1},
{id:'e190',name:'Embraer E190',type:'Bölgesel',seats:106,range:4400,speed:825,price:23,fuel:.0052,maint:.0027,crew:.027,comfort:72,level:1},
{id:'b737max',name:'Boeing 737 MAX 8',type:'Dar gövde',seats:189,range:6500,speed:839,price:44,fuel:.0074,maint:.0035,crew:.035,comfort:79,level:2},
{id:'a319',name:'Airbus A319neo',type:'Dar gövde',seats:140,range:6900,speed:846,price:35,fuel:.0066,maint:.0032,crew:.03,comfort:82,level:2},
{id:'b767',name:'Boeing 767-300ER',type:'Geniş gövde',seats:260,range:11000,speed:850,price:78,fuel:.017,maint:.009,crew:.056,comfort:75,level:3},
{id:'b7878',name:'Boeing 787-8',type:'Geniş gövde',seats:245,range:13600,speed:903,price:97,fuel:.0158,maint:.0073,crew:.054,comfort:92,level:4},
{id:'a3501000',name:'Airbus A350-1000',type:'Geniş gövde',seats:380,range:15800,speed:905,price:196,fuel:.026,maint:.0113,crew:.074,comfort:96,level:6},
{id:'b747',name:'Boeing 747-8',type:'Süper jumbo',seats:465,range:14300,speed:908,price:204,fuel:.036,maint:.016,crew:.09,comfort:88,level:6}
]);
D.POLICIES=[
{id:'economy',name:'Ekonomik Hizmet',desc:'Maliyet düşer; talep ve marka değeri bir miktar geriler.',demand:.94,price:1,cost:.86,rep:-.05},
{id:'balanced',name:'Dengeli Hizmet',desc:'Verimli operasyon ve iyi yolcu deneyimi.',demand:1,price:1,cost:1,rep:0},
{id:'premium',name:'Üst Düzey Hizmet',desc:'Yüksek servis gideri, yüksek bilet geliri ve güçlü itibar.',demand:1.07,price:1.075,cost:1.22,rep:.11}
];
D.TARIFFS=[{id:'value',name:'Hesaplı',demand:1.11,fare:.92},{id:'standard',name:'Standart',demand:1,fare:1},{id:'business',name:'Business',demand:.91,fare:1.16}];
D.DEPARTMENTS=[
{id:'operations',name:'Operasyon',emoji:'🛫',desc:'Uçakların haftalık operasyonel verimliliği ve güvenliği.',base:.09,hire:.75},
{id:'cabin',name:'Kabin ve Hizmet',emoji:'🛎️',desc:'Yolcu talebi, itibar ve hizmet kalitesi.',base:.075,hire:.65},
{id:'sales',name:'Satış ve Pazarlama',emoji:'📣',desc:'Bilet satışları ve gelir optimizasyonu.',base:.08,hire:.7},
{id:'logistics',name:'Kargo ve Lojistik',emoji:'📦',desc:'Kargo kapasitesi, tonaj ve anlaşma hizmeti.',base:.07,hire:.6}
];
D.CARGO=[
{id:'none',name:'Kargo taşımacılığı yok',price:0,volume:0,handling:0,risk:0},
{id:'general',name:'Standart Kargo',price:.0015,volume:1,handling:.00036,risk:0},
{id:'express',name:'Ekspres Kargo',price:.00245,volume:.63,handling:.00056,risk:.02},
{id:'pharma',name:'Soğuk Zincir / İlaç',price:.00325,volume:.41,handling:.00081,risk:.04}
];
D.ALLIANCES=[
{id:'none',name:'Bağımsız Havayolu',cost:0,fee:0,demand:1,cargo:1,desc:'Bağımsız büyüme; ittifak ücreti yok.'},
{id:'regional',name:'Anadolu Connect',cost:4,fee:.08,demand:1.065,cargo:1.05,desc:'Bölgesel bağlantı ve kod paylaşımı.'},
{id:'global',name:'Global Sky Network',cost:14,fee:.23,demand:1.13,cargo:1.12,desc:'Uluslararası yolcu ve kargo erişimi.'},
{id:'premium',name:'Aero Elite Alliance',cost:29,fee:.38,demand:1.17,cargo:1.22,desc:'Premium uluslararası ağ ve yüksek hizmet standardı.'}
];
D.MAINTENANCE=[{id:'budget',name:'Asgari Bakım',cost:.84,wear:1.22,rep:-.055},{id:'standard',name:'Standart Bakım',cost:1,wear:1,rep:0},{id:'proactive',name:'Önleyici Bakım',cost:1.31,wear:.69,rep:.06}];
D.CAMPAIGNS=[{id:'domestic',name:'Ulusal Tanıtım',cost:2.3,weeks:5,demand:1.10,rep:.5},{id:'global',name:'Küresel Marka',cost:8,weeks:7,demand:1.17,rep:1.5},{id:'family',name:'Aile ve Turizm',cost:3.4,weeks:6,demand:1.12,rep:.8}];
D.CARGO_CONTRACTS=[
{id:'postal',name:'Ulusal Posta Dağıtımı',duration:9,minTons:4,payment:.23,penalty:.08,deposit:.5,rep:30},
{id:'medical',name:'Tıbbi Malzeme Sevkiyatı',duration:12,minTons:8,payment:.58,penalty:.22,deposit:1.4,rep:52},
{id:'express',name:'Küresel Ekspres',duration:14,minTons:18,payment:1.12,penalty:.41,deposit:3,rep:67},
{id:'freight',name:'Endüstriyel Lojistik',duration:18,minTons:32,payment:1.85,penalty:.7,deposit:5,rep:76}
];
D.UPGRADES.push(...[
{id:'handling',name:'Akıllı Kargo Terminali',tag:'Operasyon',desc:'Kargo kapasitesi %20 artar.',cost:12,level:2,icon:'🏗️'},
{id:'safebag',name:'İleri Bagaj Takibi',tag:'Marka',desc:'Kargo teslimat geliri %8 ve müşteri memnuniyeti artar.',cost:9,level:2,icon:'🧳'},
{id:'crewops',name:'Akıllı Mürettebat Planlama',tag:'Operasyon',desc:'Operasyon ekibi daha verimli çalışır, fazla mesai azalır.',cost:17,level:3,icon:'👩‍✈️'},
{id:'carbon',name:'Karbon İzleme',tag:'Operasyon',desc:'Emisyon vergisi %25 azalır.',cost:18,level:3,icon:'🌲'},
{id:'interline',name:'Aktarma Optimizasyonu',tag:'Gelir',desc:'Aktarma yapan yolcuların talebi yükselir.',cost:25,level:4,icon:'🔀'},
{id:'hospitality',name:'Kişisel Kabin Deneyimi',tag:'Marka',desc:'Premium hizmet getirisi artar.',cost:24,level:4,icon:'🥂'},
{id:'predictive',name:'Tahmine Dayalı Talep Analizi',tag:'Gelir',desc:'Düşük doluluklu hatlarda gelir korunur.',cost:32,level:5,icon:'📊'},
{id:'saf',name:'Yeni Nesil Motor / SAF',tag:'Operasyon',desc:'Yakıt tasarrufu ve daha düşük emisyon.',cost:44,level:6,icon:'🍃'}
]);
D.CONTRACTS.push(...[
{id:'cargo-first',name:'İlk Kargo',text:'Haftalık en az 5 ton kargo taşı.',type:'cargo',goal:5,reward:4},
{id:'cargo-hub',name:'Kargo İmparatorluğu',text:'Haftalık 30 ton kargoya çık.',type:'cargo',goal:30,reward:15},
{id:'operations',name:'Kurumsal Yapı',text:'Toplam en az 12 personel kademe puanına ulaş.',type:'staff',goal:12,reward:8},
{id:'esg',name:'Sürdürülebilir Marka',text:'Çevre puanını 75 üzerine çıkar.',type:'green',goal:75,reward:7},
{id:'leader',name:'Havacılık Lideri',text:'150.000 toplam yolcu taşı.',type:'pax',goal:150000,reward:25},
{id:'mega',name:'Küresel İşletme',text:'20 aktif rotaya ulaş.',type:'routes',goal:20,reward:40}
]);
D.ACHIEVEMENTS.push(...[
{id:'cargo-king',name:'Lojistik Uzmanı',text:'20 ton/hafta kargo',type:'cargo',goal:20,bonus:5,icon:'📦'},
{id:'staffmaster',name:'İyi İşveren',text:'20 departman seviyesi',type:'staff',goal:20,bonus:7,icon:'👩‍✈️'},
{id:'green-sky',name:'Yeşil Gökyüzü',text:'85 çevre puanı',type:'green',goal:85,bonus:8,icon:'🌱'},
{id:'longterm',name:'Yüzyıl Havayolu',text:'150 hafta yönet',type:'week',goal:150,bonus:18,icon:'📅'},
{id:'largefleet',name:'Dev Filo',text:'15 uçağa sahip ol',type:'fleet',goal:15,bonus:16,icon:'🛫'},
{id:'bigworld',name:'Dünyayı Birleştir',text:'25 farklı varış noktası',type:'destinations',goal:25,bonus:22,icon:'🌐'}
]);
root.AIR_EXP_DATA={extraCities:extraCities.length};if(typeof module!=='undefined')module.exports=D;
})(typeof globalThis!=='undefined'?globalThis:this);
