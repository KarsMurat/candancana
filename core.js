/* Candan Cana — bağımlılıksız demo veri modeli ve ortak yardımcılar. */
(function () {
  'use strict';
  const storageKey = 'candancana-demo-v1';
  const seed = {
    version: 1,
    customers: [
      { id:'u-elif', name:'Elif Yılmaz', email:'elif@example.test', phone:'0555 010 10 01', initials:'EY', address:'Beykoz, İstanbul · Örnek teslimat adresi' },
      { id:'u-selin', name:'Selin Aydın', email:'selin@example.test', phone:'0555 010 10 02', initials:'SA', address:'Sarıyer, İstanbul · Örnek adres' },
      { id:'u-mert', name:'Mert Aksoy', email:'mert@example.test', phone:'0555 010 10 03', initials:'MA', address:'Beylikdüzü, İstanbul · Örnek adres' },
      { id:'u-deniz', name:'Deniz Eren', email:'deniz@example.test', phone:'0555 010 10 04', initials:'DE', address:'Şile, İstanbul · Örnek adres' },
      { id:'u-ayse', name:'Ayşe Demir', email:'ayse@example.test', phone:'0555 010 10 05', initials:'AD', address:'Kadıköy, İstanbul · Örnek adres' },
      { id:'u-okan', name:'Okan Yıldız', email:'okan@example.test', phone:'0555 010 10 06', initials:'OY', address:'Üsküdar, İstanbul · Örnek adres' }
    ],
    products: [
      { id:'tohum', name:'Tohum', subtitle:'Kendi vedanız, kendi ritminiz.', price:3500, oldPrice:null, description:'Dostunuzun hatırasını doğayla buluşturmak için sade bir başlangıç. Biyobozunur kapsül ve size ait bir dijital anı alanı bir arada.', image:'assets/capsule.jpg', features:['Biyobozunur anı kapsülü','Kişisel dijital anı sayfası','QR anı etiketi','Dikim rehberi'], tag:'Sade bir başlangıç', active:true, stock:18 },
      { id:'filiz', name:'Filiz', subtitle:'Sevginizle birlikte büyüsün.', price:5900, oldPrice:null, description:'Bir kapsül, bir fidan ve hiç kaybolmayan hatıralar. Dostunuz için yeni bir yaşamın ilk adımını birlikte planlamak isteyenlere.', image:'assets/paw-tree.jpg', features:['Tohum paketinin tüm içeriği','Fidan seçimi ve eşleştirmesi','Dikim planlama desteği','Dijital bakım günlüğü'], tag:'Bir fidanla birlikte', active:true, stock:12 },
      { id:'kok', name:'Kök', subtitle:'Her adımda yanınızdayız.', price:8900, oldPrice:null, description:'Kapsülden dikim planına, anı sayfasından ilk bakım kaydına kadar süreci birlikte takip etmek için kapsamlı bir eşlik.', image:'assets/hero.jpg', features:['Filiz paketinin tüm içeriği','Ekip ile dikim organizasyonu','Konumlu dikim kaydı','İlk bakım ve fotoğraf güncellemesi'], tag:'Birlikte, her adımda', active:true, stock:8 }
    ],
    orders: [
      {id:'CC-26063',customerId:'u-mert',date:'2026-10-10T11:30:00',items:[{productId:'tohum',name:'Tohum',quantity:1,unitPrice:3500}],total:3500,payment:'pending',fulfillment:'preparing',note:'Örnek bekleyen ödeme kaydı.',address:'Beylikdüzü, İstanbul · Örnek adres'},
      {id:'CC-26061',customerId:'u-okan',date:'2026-10-09T14:20:00',items:[{productId:'kok',name:'Kök',quantity:1,unitPrice:8900}],total:8900,payment:'paid',fulfillment:'preparing',note:'Fidan seçimi için iletişim kurulacak.',address:'Üsküdar, İstanbul · Örnek adres'},
      {id:'CC-26059',customerId:'u-ayse',date:'2026-10-08T10:15:00',items:[{productId:'tohum',name:'Tohum',quantity:1,unitPrice:3500}],total:3500,payment:'paid',fulfillment:'shipped',note:'',address:'Kadıköy, İstanbul · Örnek adres'},
      {id:'CC-26058',customerId:'u-elif',date:'2026-10-07T16:45:00',items:[{productId:'tohum',name:'Tohum',quantity:1,unitPrice:3500}],total:3500,payment:'paid',fulfillment:'delivered',note:'Misket için küçük bir anı bahçesi hazırlıyoruz.',address:'Beykoz, İstanbul · Örnek teslimat adresi'},
      {id:'CC-26055',customerId:'u-deniz',date:'2026-10-05T09:10:00',items:[{productId:'filiz',name:'Filiz',quantity:1,unitPrice:5900}],total:5900,payment:'paid',fulfillment:'delivered',note:'Dikimi aile gerçekleştirecek.',address:'Şile, İstanbul · Örnek adres'},
      {id:'CC-26053',customerId:'u-mert',date:'2026-10-03T13:35:00',items:[{productId:'kok',name:'Kök',quantity:1,unitPrice:8900}],total:8900,payment:'paid',fulfillment:'delivered',note:'',address:'Beylikdüzü, İstanbul · Örnek adres'},
      {id:'CC-26052',customerId:'u-selin',date:'2026-10-02T12:00:00',items:[{productId:'filiz',name:'Filiz',quantity:1,unitPrice:5900}],total:5900,payment:'paid',fulfillment:'delivered',note:'',address:'Sarıyer, İstanbul · Örnek adres'},
      {id:'CC-26041',customerId:'u-elif',date:'2026-09-24T10:30:00',items:[{productId:'filiz',name:'Filiz',quantity:1,unitPrice:5900}],total:5900,payment:'paid',fulfillment:'delivered',note:'Luna için bir zeytin fidanı.',address:'Beykoz, İstanbul · Örnek teslimat adresi'}
    ],
    capsules: [
      {id:'KAP-0018',orderId:'CC-26041',customerId:'u-elif',productId:'filiz',petName:'Luna',petType:'Golden Retriever',petImage:'assets/luna.jpg',status:'planted',staffId:'staff-3',memorialSlug:'luna',memorial:{story:'Kapıdaki ilk karşılayışın, deniz kenarındaki uzun yürüyüşlerimiz, en sessiz günlerde bile yanımızda oluşun… Evimizin neşesi, kalbimizin en yumuşak yerisin. Şimdi her yeni yaprakta seni hatırlayacağız.',birthDate:'2014-04-12',lossDate:'2026-09-21',isPublic:true,showLocation:false},planting:{lat:41.1037,lng:29.1082,district:'Beykoz',label:'Beykoz · örnek anı bahçesi',date:'2026-10-01',verified:true,source:'team'},care:[{id:'care-1',date:'2026-10-08',type:'Bakım',note:'Fidanın ilk kontrolü yapıldı. Yapraklar sağlıklı, toprak nemi uygun. Can suyu verildi.',by:'Can Kaya',image:'assets/paw-tree.jpg'},{id:'care-2',date:'2026-10-01',type:'Dikim',note:'Luna için ayrılan zeytin fidanı toprakla buluştu.',by:'Can Kaya',image:'assets/capsule.jpg'}]},
      {id:'KAP-0032',orderId:'CC-26058',customerId:'u-elif',productId:'tohum',petName:'Misket',petType:'Tekir kedi',petImage:'assets/misket.jpg',status:'awaiting_planting',staffId:'staff-2',memorialSlug:'misket',memorial:{story:'Güneşli pencerenin önündeki yerin hep senin. Küçücük patilerinle kocaman izler bıraktın.',birthDate:'2018-06-03',lossDate:'2026-10-04',isPublic:false,showLocation:false},planting:null,care:[]},
      {id:'KAP-0025',orderId:'CC-26052',customerId:'u-selin',productId:'filiz',petName:'Pati',petType:'Köpek',petImage:'assets/luna.jpg',status:'planted',staffId:'staff-3',memorialSlug:'pati',memorial:{story:'Birlikte çıktığımız her yol, seninle daha güzeldi.',birthDate:'2015-02-10',lossDate:'2026-09-29',isPublic:true,showLocation:true},planting:{lat:41.1658,lng:29.0184,district:'Sarıyer',label:'Sarıyer · örnek dikim noktası',date:'2026-10-05',verified:true,source:'team'},care:[]},
      {id:'KAP-0026',orderId:'CC-26053',customerId:'u-mert',productId:'kok',petName:'Mia',petType:'Kedi',petImage:'assets/misket.jpg',status:'planted',staffId:'staff-3',memorialSlug:'mia',memorial:{story:'Sessizliğimizi bile dolduran güzel dostumuz.',birthDate:'2016-08-15',lossDate:'2026-10-01',isPublic:false,showLocation:false},planting:{lat:41.0017,lng:28.6542,district:'Beylikdüzü',label:'Beylikdüzü · örnek dikim noktası',date:'2026-10-06',verified:true,source:'team'},care:[]},
      {id:'KAP-0027',orderId:'CC-26055',customerId:'u-deniz',productId:'filiz',petName:'Bulut',petType:'Kedi',petImage:'assets/misket.jpg',status:'reported',staffId:'staff-2',memorialSlug:'bulut',memorial:{story:'Adın gibi hafif, sevgin gibi sonsuz.',birthDate:'2017-03-22',lossDate:'2026-10-02',isPublic:true,showLocation:false},planting:{lat:41.1643,lng:29.6021,district:'Şile',label:'Şile · müşteri tarafından bildirilen örnek nokta',date:'2026-10-09',verified:false,source:'customer'},care:[]},
      {id:'KAP-0033',orderId:'CC-26059',customerId:'u-ayse',productId:'tohum',petName:'Zeytin',petType:'Köpek',petImage:'assets/luna.jpg',status:'shipped',staffId:'staff-2',memorialSlug:'zeytin',memorial:{story:'',birthDate:'2018-09-03',lossDate:'2026-10-06',isPublic:false,showLocation:false},planting:null,care:[]},
      {id:'KAP-0035',orderId:'CC-26061',customerId:'u-okan',productId:'kok',petName:'Çakıl',petType:'Köpek',petImage:'assets/luna.jpg',status:'preparing',staffId:'staff-2',memorialSlug:'cakil',memorial:{story:'',birthDate:'2013-11-10',lossDate:'2026-10-07',isPublic:false,showLocation:false},planting:null,care:[]}
    ],
    tasks: [
      {id:'G-101',title:'Bulut’un dikim konumunu doğrula',type:'Dikim doğrulama',capsuleId:'KAP-0027',assignedTo:'staff-2',due:'2026-10-10',status:'open',priority:'high',note:'Müşteri tarafından iletilen konum ve fotoğrafı kontrol et.'},
      {id:'G-102',title:'Luna’nın aylık bakımını planla',type:'Bakım',capsuleId:'KAP-0018',assignedTo:'staff-3',due:'2026-10-12',status:'open',priority:'normal',note:'Fidan kontrolü ve fotoğraf güncellemesi.'},
      {id:'G-103',title:'Çakıl’ın kapsülünü hazırlayın',type:'Hazırlık',capsuleId:'KAP-0035',assignedTo:'staff-2',due:'2026-10-11',status:'in_progress',priority:'normal',note:'Kök paketi; fidan eşleştirmesi yapılacak.'},
      {id:'G-104',title:'Misket için dikim bilgisini takip et',type:'Müşteri takibi',capsuleId:'KAP-0032',assignedTo:'staff-2',due:'2026-10-13',status:'open',priority:'normal',note:'Müşteri kendi dikimini gerçekleştirecek.'},
      {id:'G-105',title:'Pati’nin ilk bakımını tamamla',type:'Bakım',capsuleId:'KAP-0025',assignedTo:'staff-3',due:'2026-10-10',status:'in_progress',priority:'normal',note:'Sulama ve toprak kontrolü.'},
      {id:'G-106',title:'Mia’nın dikim kaydını tamamla',type:'Dikim',capsuleId:'KAP-0026',assignedTo:'staff-3',due:'2026-10-06',status:'done',priority:'normal',note:'Konum kaydı doğrulandı.'}
    ],
    team: [
      {id:'staff-1',name:'Deniz Arslan',initials:'DA',role:'admin',email:'deniz.arslan@example.test',active:true},
      {id:'staff-2',name:'Ece Demir',initials:'ED',role:'operations',email:'ece.demir@example.test',active:true},
      {id:'staff-3',name:'Can Kaya',initials:'CK',role:'field',email:'can.kaya@example.test',active:true}
    ],
    audits: [
      {id:'a-3',date:'2026-10-10T10:15:00',actor:'Ece Demir',action:'Sipariş güncellendi',detail:'CC-26058 teslim edildi olarak işaretlendi.'},
      {id:'a-2',date:'2026-10-09T17:20:00',actor:'Deniz Eren',action:'Dikim konumu bildirildi',detail:'Bulut · KAP-0027 için onay bekleniyor.'},
      {id:'a-1',date:'2026-10-08T14:30:00',actor:'Can Kaya',action:'Bakım kaydı eklendi',detail:'Luna’nın ilk kontrolü tamamlandı.'}
    ],
    messages: [], cart: [], settings:{staffId:'staff-1',staffRole:'admin'}, lastOrderId:null
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  let db = copy(seed);
  let storageAvailable = true;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored && stored.version === 1 && ['customers','products','orders','capsules','tasks','team','audits','messages','cart'].every(key => Array.isArray(stored[key])) && stored.customers.some(c => c.id === 'u-elif')) db = stored;
  } catch (_) { storageAvailable = false; }
  const C = window.CC = {
    db, actions:{}, forms:{}, changes:{}, inputs:{},
    esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    money(value) { const amount=Number(value)||0; return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:Number.isInteger(amount)?0:2,maximumFractionDigits:2}).format(amount); },
    date(value) { if (!value) return 'Henüz belirtilmedi'; const d = new Date(String(value).length === 10 ? value+'T12:00:00' : value); return Number.isNaN(d.valueOf()) ? 'Tarih belirtilmedi' : new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric'}).format(d); },
    route() { const raw = location.hash.replace(/^#/,'') || '/'; const i = raw.indexOf('?'); let path = (i<0 ? raw : raw.slice(0,i)).replace(/\/+$/,'') || '/'; try {path=decodeURIComponent(path);} catch (_) {} return {path,parts:path.split('/').filter(Boolean),query:new URLSearchParams(i<0?'':raw.slice(i+1))}; },
    go(path) { if (location.hash === '#'+path) C.render(); else location.hash = '#'+path; },
    save() { try {localStorage.setItem(storageKey,JSON.stringify(C.db)); storageAvailable=true; return true;} catch (_) {storageAvailable=false; return false;} },
    commit(message) { const saved=C.save(); C.render(); if(message) C.toast(saved ? message : message+' Bu oturumda saklandı.', saved?'success':'info'); },
    reset() { C.db = copy(seed); C.save(); C.go('/'); C.render(); C.toast('Demo başlangıç verilerine döndürüldü.'); },
    product(id) { return C.db.products.find(x=>x.id===id); },
    customer(id) { return C.db.customers.find(x=>x.id===id); },
    capsule(id) { return C.db.capsules.find(x=>x.id===id); },
    order(id) { return C.db.orders.find(x=>x.id===id); },
    currentCustomer() { return C.customer('u-elif'); },
    currentStaff() { const user = C.db.team.find(x=>x.id===C.db.settings.staffId)||C.db.team[0]; return {...user,role:C.db.settings.staffRole||user.role}; },
    audit(action,detail) { const actor=C.route().path.startsWith('/yonetim')?C.currentStaff().name:C.currentCustomer().name; C.db.audits.unshift({id:'a-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),date:new Date().toISOString(),actor,action,detail}); C.db.audits=C.db.audits.slice(0,150); },
    markers(capsules) { return capsules.filter(c=>['reported','planted'].includes(c.status) && c.planting && c.planting.lat!==null && c.planting.lng!==null && Number.isFinite(Number(c.planting.lat)) && Number.isFinite(Number(c.planting.lng))).map(c=>({id:c.id,lat:Number(c.planting.lat),lng:Number(c.planting.lng),title:c.petName,subtitle:c.planting.district+' · '+c.id,status:c.status,image:c.petImage})); },
    cartCount() { return C.db.cart.reduce((n,item)=>n+item.quantity,0); },
    cartTotal() { return C.db.cart.reduce((n,item)=>n+(C.product(item.productId)?.price||0)*item.quantity,0); },
    storageAvailable() { return storageAvailable; },
    uid(prefix) { return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5); }
  };
  C.ensureOrderCapsules = function (order, details={}) {
    const wanted=new Map();
    for(const item of order.items){if(!Number.isInteger(item.quantity)||item.quantity<1)throw new Error('Siparişteki kapsül adedi geçersiz.');wanted.set(item.productId,(wanted.get(item.productId)||0)+item.quantity);}
    const plans=[];
    for(const [productId,quantity] of wanted){
      const count=C.db.capsules.filter(c=>c.orderId===order.id&&c.productId===productId).length;
      const missing=Math.max(0,quantity-count),product=C.product(productId);
      if(missing&&(!product||!product.active||product.stock<missing))throw new Error((product?.name||'Kapsül')+' için yeterli aktif stok yok. Önce ürün stokunu düzenleyin.');
      if(missing)plans.push({product,missing});
    }
    let number=Math.max(35,...C.db.capsules.map(c=>Number(c.id.replace('KAP-',''))||0));
    let index=C.db.capsules.filter(c=>c.orderId===order.id).length;
    const total=order.items.reduce((n,item)=>n+item.quantity,0),created=[];
    for(const {product,missing} of plans){
      product.stock-=missing;
      for(let n=0;n<missing;n++){
        number++;index++;
        const id='KAP-'+String(number).padStart(4,'0'),type=details.petType||'Belirtilmedi';
        const capsule={id,orderId:order.id,customerId:order.customerId,productId:product.id,petName:(details.petName||'Yeni dostum')+(total>1?' '+index:''),petType:type,petImage:type==='Kedi'?'assets/misket.jpg':'assets/luna.jpg',status:'preparing',staffId:'staff-2',memorialSlug:'ani-'+id.toLowerCase(),memorial:{story:'',birthDate:'',lossDate:'',isPublic:false,showLocation:false},planting:null,care:[]};
        C.db.capsules.unshift(capsule);created.push(capsule);
      }
    }
    return created;
  };
  const statuses = {
    paid:['Ödendi','success'],pending:['Ödeme bekliyor','warning'],failed:['Ödeme başarısız','danger'],refunded:['İade edildi','muted'],
    preparing:['Hazırlanıyor','info'],shipped:['Kargoda','info'],delivered:['Teslim edildi','success'],
    awaiting_planting:['Dikim bekliyor','warning'],reported:['Konum onayı bekliyor','warning'],planted:['Dikildi','success'],
    open:['Yapılacak','muted'],in_progress:['Devam ediyor','info'],done:['Tamamlandı','success'],
    admin:['Yönetici','success'],operations:['Operasyon','info'],field:['Saha ekibi','muted'],
    high:['Öncelikli','warning'],normal:['Normal','muted'],active:['Aktif','success'],inactive:['Pasif','muted']
  };
  C.status = value => {const s=statuses[value]||[String(value||'Belirtilmedi'),'muted'];return {label:s[0],tone:s[1]};};
  C.badge = value => {const s=C.status(value);return '<span class="badge badge-'+s.tone+'"><span class="status-dot" aria-hidden="true"></span>'+C.esc(s.label)+'</span>';};
  const paths = {
    leaf:'M20 4c-8-2-16 2-16 9a7 7 0 0 0 7 7c7 0 11-8 9-16ZM5 19 16 8M10 14l-1-5M10 14l5 1',
    sprout:'M12 22V12M12 15C4 15 2 11 3 6c5-1 9 2 9 6M12 12c0-6 3-9 9-8 0 5-3 8-9 8',
    'arrow-right':'M4 12h16m-6-6 6 6-6 6','arrow-left':'M20 12H4m6-6-6 6 6 6','arrow-up-right':'M6 18 18 6M6 6h12v12',
    plus:'M12 5v14M5 12h14',minus:'M5 12h14',check:'m5 12 4 4L19 6',
    'chevron-down':'m6 9 6 6 6-6','chevron-right':'m9 6 6 6-6 6','chevron-left':'m15 6-6 6 6 6',
    'shopping-bag':'M5 7h14l1 14H4L5 7ZM9 8V6a3 3 0 0 1 6 0v2',
    heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    'map-pin':'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    user:'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    box:'m21 7-9-5-9 5v10l9 5 9-5V7ZM3 7l9 5 9-5M12 12v10M7.5 4.5l9 5',
    search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    calendar:'M3 5h18v16H3zM16 3v4M8 3v4M3 11h18M8 15h2M14 15h2',
    users:'M17 21v-2a5 5 0 0 0-5-5H6a5 5 0 0 0-5 5v2M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM23 21v-2a5 5 0 0 0-4-5M17 2a4 4 0 0 1 0 8',
    settings:'m9 3 1-2h4l1 2 3 2 3 1v4l-2 2v3l1 3-3 3-3-1h-3l-2 2-4-1v-3l-2-3-2-1 1-4 3-1 2-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    more:'M5 12h.01M12 12h.01M19 12h.01',
    download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
    'external-link':'M14 3h7v7M21 3 10 14M10 3H3v18h18v-7',
    menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',
    clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    mail:'M3 5h18v14H3zM3 5l9 7 9-7',phone:'M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-17.5-17.5A2 2 0 0 1 4.3 2h3a2 2 0 0 1 2 1.7l.5 3-2 2a16 16 0 0 0 7.5 7.5l2-2 3 .5a2 2 0 0 1 1.7 2.2Z',
    star:'m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.6l6.2-.9L12 3Z',
    shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4ZM8 12l3 3 5-6',
    filter:'M4 5h16M7 12h10M10 19h4',image:'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M17 7h.01',
    camera:'M3 6h4l2-3h6l2 3h4v15H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    edit:'m16 3 5 5M3 21l1-6L17 2l5 5L9 20l-6 1Z',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
    'log-out':'M9 21H3V3h6M9 12h12m-5-5 5 5-5 5','credit-card':'M2 4h20v16H2zM2 9h20M6 15h4',
    truck:'M1 3h14v14H1zM15 8h4l4 5v4h-8M8 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM22 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    clipboard:'M9 3H4v18h16V3h-5M9 1h6v5H9zM8 11h8M8 15h6',
    map:'m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3V5ZM9 2v17M15 5v17',
    'check-circle':'M22 11v1a10 10 0 1 1-6-9M22 4l-10 10-3-3',
    'alert-circle':'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 8v5M12 17h.01',
    navigation:'m3 10 19-8-8 19-3-8-8-3Z',gift:'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H7a3 3 0 1 1 3-3l2 3ZM12 8h5a3 3 0 1 0-3-3l-2 3Z',
    refresh:'M20 7a9 9 0 1 0 1 9M20 2v6h-6'
  };
  C.icon = (name,size=20) => '<svg width="'+Number(size)+'" height="'+Number(size)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.leaf)+'"/></svg>';
}());
