(function(root){
'use strict';
const CITIES=[
['IST','İstanbul','Türkiye',41.01,28.98,165,2.0,0],['ANK','Ankara','Türkiye',39.93,32.86,115,1.2,0],['ADB','İzmir','Türkiye',38.42,27.14,104,1.3,0],['AYT','Antalya','Türkiye',36.89,30.71,126,1.8,0],['SAW','Sabiha Gökçen','Türkiye',40.9,29.31,122,1.2,0],
['LHR','Londra','Birleşik Krallık',51.47,-0.45,170,2.3,1],['CDG','Paris','Fransa',49.01,2.55,166,2.3,1],['FRA','Frankfurt','Almanya',50.03,8.56,142,1.8,1],['AMS','Amsterdam','Hollanda',52.31,4.76,139,1.8,1],['MAD','Madrid','İspanya',40.47,-3.57,125,1.5,1],['FCO','Roma','İtalya',41.8,12.25,144,2.1,1],['ZRH','Zürih','İsviçre',47.46,8.55,107,1.4,1],['ATH','Atina','Yunanistan',37.94,23.94,118,1.7,1],['BER','Berlin','Almanya',52.37,13.5,119,1.3,1],
['DXB','Dubai','BAE',25.25,55.36,170,2.1,2],['DOH','Doha','Katar',25.27,51.61,131,1.4,2],['CAI','Kahire','Mısır',30.12,31.41,129,1.4,2],['TLV','Tel Aviv','İsrail',32.0,34.87,113,1.2,2],['JED','Cidde','Suudi Arabistan',21.67,39.15,126,1.4,2],['BOM','Mumbai','Hindistan',19.09,72.87,171,1.8,2],['DEL','Delhi','Hindistan',28.56,77.1,165,1.7,2],
['JFK','New York','ABD',40.64,-73.78,190,2.4,3],['LAX','Los Angeles','ABD',33.94,-118.41,160,2.0,3],['ORD','Chicago','ABD',41.98,-87.9,142,1.7,3],['YYZ','Toronto','Kanada',43.68,-79.63,131,1.6,3],['GRU','São Paulo','Brezilya',-23.43,-46.47,149,1.5,3],
['NRT','Tokyo','Japonya',35.77,140.39,174,2.4,4],['ICN','Seul','Güney Kore',37.46,126.44,142,1.8,4],['SIN','Singapur','Singapur',1.36,103.99,148,2.2,4],['BKK','Bangkok','Tayland',13.69,100.75,155,2.0,4],['HKG','Hong Kong','Çin',22.31,113.91,144,1.8,4],['SYD','Sidney','Avustralya',-33.94,151.18,147,1.8,4],['CPT','Cape Town','Güney Afrika',-33.97,18.6,117,1.5,2]
].map(([id,name,country,lat,lon,demand,tourism,region])=>({id,name,country,lat,lon,demand,tourism,region}));
const AIRCRAFT=[
{id:'regional',name:'Embraer E175',type:'Bölgesel',seats:88,range:3900,speed:790,price:16,fuel:.0043,maint:.0023,crew:.023,comfort:65,level:1},
{id:'atr',name:'ATR 72-600',type:'Turboprop',seats:72,range:1450,speed:510,price:11,fuel:.0027,maint:.0016,crew:.019,comfort:53,level:1},
{id:'a220',name:'Airbus A220-300',type:'Dar gövde',seats:145,range:6200,speed:840,price:31,fuel:.0068,maint:.003,crew:.029,comfort:77,level:1},
{id:'b737',name:'Boeing 737-800',type:'Dar gövde',seats:175,range:5400,speed:835,price:34,fuel:.0081,maint:.0035,crew:.033,comfort:70,level:1},
{id:'a320',name:'Airbus A320neo',type:'Dar gövde',seats:180,range:6300,speed:845,price:40,fuel:.0072,maint:.0034,crew:.034,comfort:76,level:2},
{id:'e195',name:'Embraer E195-E2',type:'Bölgesel',seats:132,range:4600,speed:830,price:27,fuel:.0054,maint:.0028,crew:.027,comfort:81,level:2},
{id:'a321',name:'Airbus A321XLR',type:'Uzun menzil',seats:210,range:8700,speed:850,price:59,fuel:.0091,maint:.0043,crew:.039,comfort:82,level:3},
{id:'b787',name:'Boeing 787-9',type:'Geniş gövde',seats:290,range:14100,speed:900,price:115,fuel:.0178,maint:.008,crew:.057,comfort:91,level:4},
{id:'a330',name:'Airbus A330-900',type:'Geniş gövde',seats:310,range:13300,speed:875,price:103,fuel:.0184,maint:.0087,crew:.061,comfort:88,level:4},
{id:'b777',name:'Boeing 777-300ER',type:'Geniş gövde',seats:390,range:13600,speed:905,price:148,fuel:.026,maint:.011,crew:.069,comfort:87,level:5},
{id:'a350',name:'Airbus A350-900',type:'Geniş gövde',seats:340,range:15000,speed:905,price:157,fuel:.021,maint:.009,crew:.067,comfort:95,level:5},
{id:'a380',name:'Airbus A380',type:'Süper jumbo',seats:550,range:15200,speed:900,price:244,fuel:.042,maint:.018,crew:.102,comfort:98,level:6}
];
const UPGRADES=[
{id:'booking',name:'Akıllı Rezervasyon',tag:'Gelir',desc:'Doluluk yönetimi güçlenir, talep %10 artar.',cost:4,level:1,icon:'🎟️'},
{id:'fuel',name:'Yakıt Optimizasyonu',tag:'Operasyon',desc:'Yakıt giderleri %12 azalır.',cost:6,level:1,icon:'⛽'},
{id:'loyalty',name:'Sadakat Programı',tag:'Gelir',desc:'Talep %12 ve itibar kazanımı artar.',cost:8,level:2,icon:'💎'},
{id:'maintenance',name:'Öngörücü Bakım',tag:'Operasyon',desc:'Bakım giderleri ve yıpranma %18 azalır.',cost:8,level:2,icon:'🔧'},
{id:'revenue',name:'Dinamik Fiyatlama',tag:'Gelir',desc:'Bilet gelirleri %9 artar.',cost:12,level:3,icon:'📈'},
{id:'ground',name:'Hızlı Yer Hizmetleri',tag:'Operasyon',desc:'Her uçakta daha fazla sefer yapılabilir.',cost:10,level:3,icon:'🛬'},
{id:'cargo',name:'Kargo Bölümü',tag:'Gelir',desc:'Her aktif uçuşta ek kargo geliri.',cost:16,level:3,icon:'📦'},
{id:'premium',name:'Premium Kabin',tag:'Marka',desc:'Bilet gelirleri %13 artar; pazarlama daha etkili.',cost:20,level:4,icon:'✨'},
{id:'academy',name:'Uçuş Akademisi',tag:'Marka',desc:'Mürettebat giderleri %15 azalır ve güven artar.',cost:15,level:4,icon:'🎓'},
{id:'alliance',name:'Küresel İttifak',tag:'Marka',desc:'Uluslararası hatların talebi %18 artar.',cost:25,level:5,icon:'🌐'},
{id:'eco',name:'Sürdürülebilir Yakıt',tag:'Operasyon',desc:'Yakıt maliyeti %10 azalır, itibar artar.',cost:23,level:5,icon:'🌱'},
{id:'ai',name:'Yapay Zekâ Operasyon',tag:'Gelir',desc:'Talep %8 artar, işletme maliyetleri %6 düşer.',cost:42,level:6,icon:'🧠'}
];
const RIVALS=[{name:'Atlas Wings',color:'#f09a77',share:19,growth:1.1},{name:'Nordic Jet',color:'#89aaff',share:16,growth:.9},{name:'Sunbird Air',color:'#b9a0ff',share:11,growth:1.25}];
const CONTRACTS=[
{id:'launch',name:'İlk Uçuş',text:'İlk aktif rotanı kur.',type:'routes',goal:1,reward:2},
{id:'pax',name:'10.000 Yolcu',text:'Toplam 10.000 yolcu taşı.',type:'pax',goal:10000,reward:5},
{id:'network',name:'Bölgesel Ağ',text:'4 aktif rotaya ulaş.',type:'routes',goal:4,reward:7},
{id:'intl',name:'Dünya Vatandaşı',text:'3 uluslararası rota aç.',type:'intl',goal:3,reward:10},
{id:'fleet',name:'Filo Büyüyor',text:'5 uçağa sahip ol.',type:'fleet',goal:5,reward:12},
{id:'trust',name:'Beş Yıldızlı Marka',text:'İtibarını 80 puana çıkar.',type:'rep',goal:80,reward:8},
{id:'global',name:'Kıtalar Arası',text:'Kıtalar arası bir rota aç.',type:'long',goal:1,reward:15},
{id:'enterprise',name:'Havacılık İmparatorluğu',text:'Şirket değerini 300 M$ üzerine çıkar.',type:'valuation',goal:300,reward:25}
];
const ACHIEVEMENTS=[
{id:'first',name:'Gökyüzüne Merhaba',text:'İlk rota',type:'routes',goal:1,bonus:.5,icon:'🚀'},
{id:'hundred',name:'İlk 1000',text:'1.000 yolcu',type:'pax',goal:1000,bonus:1,icon:'👥'},
{id:'million',name:'Milyoner',text:'100 M$ şirket değeri',type:'valuation',goal:100,bonus:2,icon:'💰'},
{id:'five',name:'Beş Uçak',text:'5 uçaklık filo',type:'fleet',goal:5,bonus:2,icon:'✈️'},
{id:'regional',name:'Uçuş Ağı',text:'6 rota',type:'routes',goal:6,bonus:4,icon:'🕸️'},
{id:'profitable',name:'Altın Hafta',text:'Tek haftada 2 M$ net kâr',type:'profit',goal:2,bonus:3,icon:'🏆'},
{id:'world',name:'Dünya Oyuncusu',text:'10 farklı varış noktası',type:'destinations',goal:10,bonus:6,icon:'🌍'},
{id:'quarter',name:'Uzun Soluklu',text:'52 hafta hayatta kal',type:'week',goal:52,bonus:5,icon:'🗓️'},
{id:'fiveStar',name:'Kusursuz Hizmet',text:'90 itibar',type:'rep',goal:90,bonus:5,icon:'⭐'},
{id:'tycoon',name:'Tycoon',text:'1 milyar $ şirket değeri',type:'valuation',goal:1000,bonus:30,icon:'👑'}
];
const EVENTS=[
{id:'fuel',title:'Akaryakıt piyasasında şok',desc:'Küresel petrol fiyatları yükseldi. Yakıt giderleri önümüzdeki 4 hafta artacak.',emoji:'⛽',options:[{label:'Fiyatları sabitle (−2 M$)',cash:-2,rep:2,effect:{fuel:1.03,weeks:4}},{label:'Piyasanın akışına bırak',effect:{fuel:1.32,weeks:4}}]},
{id:'tourism',title:'Turizm patlaması!',desc:'Tatil sezonunda uçuş talebi artışa geçti.',emoji:'🏖️',options:[{label:'Reklam kampanyası (−1 M$)',cash:-1,effect:{demand:1.28,weeks:5}},{label:'Organik büyümeyi izle',effect:{demand:1.12,weeks:4}}]},
{id:'inspection',title:'Sürpriz havacılık denetimi',desc:'Emniyet ekibi filonu detaylı inceledi.',emoji:'🛡️',options:[{label:'Güvenlik iyileştirmesi (−1.5 M$)',cash:-1.5,rep:4},{label:'Standart incelemeyle devam',rep:-2}]},
{id:'strike',title:'Yer hizmetlerinde grev',desc:'Havalimanlarındaki iş gücü sorunu sefer verimini düşürebilir.',emoji:'📣',options:[{label:'Ek personel tut (−2 M$)',cash:-2,effect:{demand:1.03,weeks:2}},{label:'Mevcut ekiple idare et',rep:-3,effect:{demand:.83,weeks:3}}]},
{id:'viral',title:'Markan sosyal medyada gündem oldu!',desc:'Bir yolcunun paylaşımı şirketinin tanınırlığını artırdı.',emoji:'📸',options:[{label:'Kampanyayı büyüt (−1 M$)',cash:-1,rep:5,effect:{demand:1.15,weeks:4}},{label:'Teşekkür mesajı yayınla',rep:3}]},
{id:'downturn',title:'Ekonomik durgunluk',desc:'Yolcu talebi geçici olarak baskılanıyor.',emoji:'📉',options:[{label:'Esnek biletler (−1 M$)',cash:-1,effect:{demand:.94,weeks:4}},{label:'Normal tarifeyi koru',effect:{demand:.77,weeks:4}}]},
{id:'invest',title:'Yatırım fonundan teklif',desc:'Bir fon uygun şartlarla sermaye desteği sunuyor.',emoji:'💼',options:[{label:'10 M$ kredi al (+10 M$)',cash:10,debt:10},{label:'Bağımsız kal',rep:1}]},
{id:'green',title:'Yeşil havacılık ödülleri',desc:'Çevreci havayolları gündemde. Markan için bir fırsat.',emoji:'🌿',options:[{label:'Sürdürülebilirlik projesi (−3 M$)',cash:-3,rep:7},{label:'Şimdilik yatırım yapma',rep:-1}]}
];
const DIFFICULTY={easy:{name:'Rahat',cash:120,demand:1.17,cost:.88},normal:{name:'Normal',cash:78,demand:1,cost:1},hard:{name:'Zor',cash:55,demand:.85,cost:1.16}};
const data={CITIES,AIRCRAFT,UPGRADES,RIVALS,CONTRACTS,ACHIEVEMENTS,EVENTS,DIFFICULTY};
root.AIR_DATA=data;if(typeof module!=='undefined')module.exports=data;
})(typeof globalThis!=='undefined'?globalThis:this);
