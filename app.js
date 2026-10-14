(function () {
  'use strict';
  const C = window.CC;
  const app = document.getElementById('app');
  const dialog = document.getElementById('site-dialog');
  let previousFocus = null;
  let lastPath = null;
  let lastLocation = null;
  let toastTimer;
  const customerRoute = path => /^\/(hesabim|siparislerim|siparis|kapsullerim|kapsulum|ani)(\/|$)/.test(path);
  const brand = () => '<a class="brand" href="#/" aria-label="Candan Cana ana sayfa"><img src="assets/brand.jpg" alt="" width="52" height="58"><span>Candan Cana<small>Sevgi, kök salar.</small></span></a>';
  C.brand = brand;
  function header(path) {
    const nav = [['/hikayemiz','Hikâyemiz'],['/nasil-calisir','Nasıl çalışır?'],['/kapsuller','Kapsüllerimiz'],['/iletisim','Bize ulaşın']];
    return '<header class="site-header"><div class="header-inner">'+brand()+
      '<nav id="public-nav" class="public-nav" aria-label="Ana gezinme">'+nav.map(([url,label])=>'<a href="#'+url+'" '+(path===url?'aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>'+
      '<div class="header-actions"><a class="icon-button account-link" href="#/hesabim" aria-label="Müşteri hesabım">'+C.icon('user')+'</a><a class="icon-button cart-link" href="#/sepet" aria-label="Sepetim, '+C.cartCount()+' ürün">'+C.icon('shopping-bag')+(C.cartCount()?'<span class="cart-count">'+C.cartCount()+'</span>':'')+'</a><a class="btn btn-primary header-cta" href="#/kapsuller">Kapsül seç '+C.icon('arrow-up-right',16)+'</a><button class="icon-button nav-toggle" data-action="nav-toggle" aria-controls="public-nav" aria-expanded="false" aria-label="Menüyü aç">'+C.icon('menu')+'</button></div></div></header>';
  }
  function footer() {
    return '<footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a href="#/" class="footer-wordmark">Candan Cana<span>Bir candan, yeni bir cana.</span></a><p>Dostluğun bıraktığı iz, doğada yaşamaya devam etsin.</p></div><div><h3>Keşfedin</h3><a href="#/hikayemiz">Hikâyemiz</a><a href="#/nasil-calisir">Nasıl çalışır?</a><a href="#/kapsuller">Kapsüllerimiz</a></div><div><h3>Yanınızdayız</h3><a href="#/iletisim">Bize ulaşın</a><a href="#/klinikler">Veteriner iş birlikleri</a><a href="#/hesabim">Hesabım</a></div><div class="footer-note">'+C.icon('sprout',30)+'<p>Her hatıranın<br>bir yarını olsun.</p><a class="text-link" href="#/ani/luna">Örnek anı sayfası '+C.icon('arrow-up-right',16)+'</a></div></div><div class="container footer-bottom"><span>© 2026 Candan Cana · Konsept demo</span><button data-action="demo-info">Demo ve veri bilgisi</button><span>Sevgiyle, doğayla.</span></div></footer>';
  }
  C.toast = function (message,type='success') {
    if(type==='error')type='danger';
    const region=document.getElementById('toast-region');
    clearTimeout(toastTimer);
    region.innerHTML='<div class="toast toast-'+C.esc(type)+'">'+C.icon(type==='danger'?'alert-circle':type==='info'?'leaf':'check-circle',20)+'<span>'+C.esc(message)+'</span><button class="icon-button" data-action="toast-close" aria-label="Bildirimi kapat">'+C.icon('close',16)+'</button></div>';
    toastTimer=setTimeout(()=>{region.innerHTML='';},6000);
  };
  C.openModal = function ({title,body,wide=false}) {
    previousFocus=document.activeElement;
    dialog.className=wide?'modal-wide':'';
    dialog.innerHTML='<div class="modal-heading"><h2 id="dialog-title">'+C.esc(title)+'</h2><button class="icon-button" data-action="close-modal" aria-label="Pencereyi kapat">'+C.icon('close')+'</button></div><div class="modal-body">'+body+'</div>';
    if(!dialog.open) dialog.showModal();
    const first=dialog.querySelector('[autofocus],input:not([type="hidden"]),select,textarea');
    if(first) setTimeout(()=>first.focus(),0);
  };
  C.closeModal = function () { if(dialog.open)dialog.close(); };
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)C.closeModal();}});
  dialog.addEventListener('close',()=>{if(!dialog.open)dialog.replaceChildren();if(previousFocus?.isConnected)previousFocus.focus();});
  C.actions['close-modal']=()=>C.closeModal();
  C.actions['toast-close']=()=>{clearTimeout(toastTimer);document.getElementById('toast-region').innerHTML='';};
  C.actions['nav-toggle']=element=>{
    const open=element.getAttribute('aria-expanded')!=='true';
    element.setAttribute('aria-expanded',String(open));element.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');
    element.innerHTML=C.icon(open?'close':'menu');document.getElementById('public-nav').classList.toggle('is-open',open);
  };
  C.actions['demo-info']=()=>C.openModal({title:'Candan Cana demosunu keşfedin',body:'<div class="stack"><p>Bu deneyimdeki kişiler, fiyatlar, siparişler ve dikim noktaları örnektir. Mağaza, müşteri hesabı ve yönetim paneli aynı demo kayıtlarını kullanır.</p><div class="demo-guide"><p><strong>Müşteri</strong> Elif Yılmaz olarak siparişlerinizi ve Luna ile Misket’in kapsüllerini görebilirsiniz.</p><p><strong>Yönetim</strong> Kapsül fiyatlarını, siparişleri, görevleri ve dikim kayıtlarını düzenleyebilirsiniz.</p><p><strong>Satın alma</strong> Ödeme sonucu simüle edilir; gerçek ödeme alınmaz. Gerçek kart bilgisi girmeniz istenmez.</p></div><p class="muted">Değişiklikler bu tarayıcıda saklanır. Gerçek kimlik doğrulaması, mesaj gönderimi ve konum hizmeti bağlı değildir. Harita şematiktir. “Sıfırla” ile başlangıç verilerine dönebilirsiniz.</p><button class="btn btn-primary" data-action="close-modal">Keşfetmeye devam et</button></div>'});
  C.actions['demo-reset']=()=>C.openModal({title:'Demoyu başlangıca döndür?',body:'<p>Bu tarayıcıda oluşturduğunuz örnek siparişler, fiyat değişiklikleri ve diğer demo düzenlemeleri başlangıç kayıtlarıyla değiştirilecek.</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close-modal">Vazgeç</button><button class="btn btn-primary" data-action="demo-reset-confirm">'+C.icon('refresh',18)+' Demoyu sıfırla</button></div>'});
  C.actions['demo-reset-confirm']=()=>{C.closeModal();C.reset();};
  C.render = function () {
    const route=C.route();
    const locationKey=route.path+'?'+route.query.toString();
    const active=document.activeElement;
    const focusInfo=active&&app.contains(active)?{tag:active.tagName,id:active.id,key:active.dataset.focusKey,action:active.dataset.action,record:active.dataset.id,step:active.dataset.step,change:active.dataset.change,href:active.getAttribute('href'),name:active.name,form:active.closest('form')?.dataset.form,selection:typeof active.selectionStart==='number'?[active.selectionStart,active.selectionEnd]:null}:null;
    const isAdmin=route.path.startsWith('/yonetim');
    const isCustomer=customerRoute(route.path);
    const view=(isAdmin?C.adminView?.(route):isCustomer?C.customerView?.(route):C.publicView?.(route))||{
      title:'Sayfa bulunamadı',html:'<section class="container missing-page"><span class="missing-number">404</span><h1>Bu yolda bir sayfa yok.</h1><p>Aradığınız sayfa taşınmış veya bağlantı değişmiş olabilir.</p><a class="btn btn-primary" href="#/">Ana sayfaya dön '+C.icon('arrow-right')+'</a></section>'
    };
    document.title=view.title+' · Candan Cana';
    document.body.classList.toggle('is-admin',isAdmin);
    document.body.dataset.page=route.parts[0]||'home';
    app.innerHTML=isAdmin?view.html:header(route.path)+'<main id="main-content" tabindex="-1">'+view.html+'</main>'+footer();
    document.querySelectorAll('[data-demo-link]').forEach(a=>{
      const active=a.dataset.demoLink===(isAdmin?'admin':isCustomer?'customer':'public');
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    if(view.bind)view.bind();
    if(lastPath!==route.path) {
      if(dialog.open)C.closeModal();
      window.scrollTo({top:0,behavior:'instant'});
      if(lastPath!==null) {
        const h=app.querySelector('h1'); if(h){h.tabIndex=-1;h.focus({preventScroll:true});}
      }
    } else if(focusInfo) {
      let replacement=focusInfo.id?document.getElementById(focusInfo.id):null;
      if(!replacement)replacement=Array.from(app.querySelectorAll('button,a,input,select,textarea')).find(el=>{
        if(focusInfo.key)return el.dataset.focusKey===focusInfo.key;
        if(focusInfo.action)return el.dataset.action===focusInfo.action&&el.dataset.id===focusInfo.record&&el.dataset.step===focusInfo.step;
        if(focusInfo.change)return el.dataset.change===focusInfo.change;
        if(focusInfo.href)return el.getAttribute('href')===focusInfo.href;
        if(focusInfo.name)return el.name===focusInfo.name&&el.closest('form')?.dataset.form===focusInfo.form;
        return false;
      });
      if(replacement&&!replacement.disabled){replacement.focus({preventScroll:true});if(focusInfo.selection&&replacement.setSelectionRange){try{replacement.setSelectionRange(...focusInfo.selection);}catch(_){}}}
      else if(lastLocation!==locationKey){const h=app.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
    }
    lastPath=route.path;
    lastLocation=locationKey;
  };
  document.addEventListener('click',event=>{
    const skip=event.target.closest('.skip-link');
    if(skip){event.preventDefault();(document.getElementById('main-content')||app.querySelector('main')||app).focus();return;}
    const el=event.target.closest('[data-action]');
    if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return;
    const handler=C.actions[el.dataset.action];
    if(handler){event.preventDefault();try{handler(el,event);}catch(err){console.error(err);C.toast('İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin.','danger');}}
  });
  document.addEventListener('submit',event=>{
    const form=event.target.closest('form[data-form]');if(!form)return;
    event.preventDefault();if(!form.reportValidity())return;
    const handler=C.forms[form.dataset.form];
    if(handler){try{handler(form,event);}catch(err){console.error(err);C.toast('Form kaydedilemedi. Alanları kontrol edip tekrar deneyin.','danger');}}
  });
  document.addEventListener('change',event=>{const el=event.target.closest('[data-change]');if(el&&C.changes[el.dataset.change])C.changes[el.dataset.change](el,event);});
  document.addEventListener('input',event=>{const el=event.target.closest('[data-input]');if(el&&C.inputs[el.dataset.input])C.inputs[el.dataset.input](el,event);});
  window.addEventListener('hashchange',()=>C.render());
  window.addEventListener('storage',event=>{if(event.key==='candancana-demo-v1'){try{const data=JSON.parse(event.newValue);if(data?.version===1&&Array.isArray(data.products)&&Array.isArray(data.orders)){C.db=data;C.render();}}catch(_){}}});
  C.render();
}());
