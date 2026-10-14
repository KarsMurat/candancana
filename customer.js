(function () {
  'use strict';

  var C = window.CC;
  var E = function (value) { return C.esc(value == null ? '' : value); };
  var routeLink = function (path) { return '#' + path; };
  var encoded = function (value) { return encodeURIComponent(value); };
  var capsulePath = function (id, tab) { return '/kapsulum/' + encoded(id) + (tab ? '?tab=' + encoded(tab) : ''); };
  var orderPath = function (id) { return '/siparis/' + encoded(id); };
  var memorialPath = function (capsule) { return '/ani/' + encoded(capsule.memorialSlug); };
  var isoDay = function (value) { return String(value || '').slice(0, 10); };
  var today = function () {
    var date = new Date();
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };
  var makeId = function (prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); };
  var current = function () { return C.currentCustomer(); };
  var ownCapsules = function () { return C.db.capsules.filter(function (capsule) { return capsule.customerId === current().id; }); };
  var ownOrders = function () {
    return C.db.orders.filter(function (order) { return order.customerId === current().id; }).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  };
  var ownCapsule = function (id) {
    var capsule = C.capsule(id);
    return capsule && capsule.customerId === current().id ? capsule : null;
  };
  var ownOrder = function (id) {
    var order = C.order(id);
    return order && order.customerId === current().id ? order : null;
  };
  var petName = function (capsule) { return capsule.petName || 'Yeni bir hatıra'; };
  var petPhoto = function (capsule) { return capsule.petImage || 'assets/paw-tree.jpg'; };
  var dateText = function (date) { return date ? E(C.date(date)) : 'Henüz belirlenmedi'; };
  var excerpt = function (text, length) { return String(text || '').length > length ? String(text).slice(0, length).trimEnd() + '…' : String(text || ''); };
  var icon = function (name, size) { return C.icon(name, size || 20); };
  var actionLink = function (path, label, secondary) {
    return '<a class="btn ' + (secondary ? 'btn-secondary' : 'btn-primary') + '" href="' + E(routeLink(path)) + '">' + E(label) + icon('arrow-right', 17) + '</a>';
  };
  var mapMarkers = function (capsules) { return C.markers(capsules); };
  var errorBox = function () { return '<p class="cu-form-error" role="alert" data-form-error hidden></p>'; };

  function formError(form, message, field) {
    var box = form.querySelector('[data-form-error]');
    if (box) { box.textContent = message; box.hidden = false; }
    if (field) { field.focus(); }
    else if (box) { box.setAttribute('tabindex', '-1'); box.focus(); }
  }

  function clearError(form) {
    var box = form.querySelector('[data-form-error]');
    if (box) { box.textContent = ''; box.hidden = true; }
  }

  function accountShell(route, heading, description, content, actions) {
    var user = current();
    var tab = route.query.get('tab');
    var links = [
      { path: '/hesabim', label: 'Genel bakış', icon: 'grid', active: route.path === '/hesabim' && tab !== 'profil' },
      { path: '/siparislerim', label: 'Siparişlerim', icon: 'shopping-bag', active: route.path === '/siparislerim' || route.parts[0] === 'siparis' },
      { path: '/kapsullerim', label: 'Kapsüllerim', icon: 'sprout', active: route.path === '/kapsullerim' || route.parts[0] === 'kapsulum' },
      { path: '/hesabim?tab=profil', label: 'Bilgilerim', icon: 'user', active: route.path === '/hesabim' && tab === 'profil' }
    ];
    return '<div class="cu-shell">' +
      '<aside class="cu-sidebar" aria-label="Hesap menüsü"><div class="cu-identity"><span class="cu-initials" aria-hidden="true">' + E(user.initials || user.name.slice(0, 1)) + '</span><div><strong>' + E(user.name) + '</strong><span>Örnek müşteri hesabı</span></div></div>' +
      '<nav class="cu-nav" aria-label="Hesabım">' + links.map(function (link) {
        return '<a href="' + E(routeLink(link.path)) + '" class="cu-nav-link' + (link.active ? ' is-active' : '') + '"' + (link.active ? ' aria-current="page"' : '') + '>' + icon(link.icon, 19) + '<span>' + link.label + '</span></a>';
      }).join('') + '</nav><div class="cu-sidebar-note">' + icon('leaf', 24) + '<p>Bir hatıradan,<br>yeni bir hayata.</p><a href="#/kapsuller" class="text-link">Kapsülleri keşfet ' + icon('arrow-up-right', 15) + '</a></div></aside>' +
      '<div class="cu-main" id="customer-content"><header class="cu-page-heading"><div><h1>' + E(heading) + '</h1>' + (description ? '<p>' + E(description) + '</p>' : '') + '</div>' + (actions ? '<div class="cu-page-actions">' + actions + '</div>' : '') + '</header>' + content + '</div></div>';
  }

  function emptyState(title, text, link, label) {
    return '<div class="cu-empty">' + icon('sprout', 34) + '<h2>' + E(title) + '</h2><p>' + E(text) + '</p>' + (link ? actionLink(link, label, false) : '') + '</div>';
  }

  function missingView(route, kind) {
    var isCapsule = kind === 'capsule';
    return {
      title: 'Kayıt bulunamadı',
      html: accountShell(route, 'Bu kayda ulaşılamıyor', 'Bağlantı değişmiş olabilir veya bu kayıt hesabınıza ait değildir.', emptyState('Kendi kayıtlarınızdan devam edin', 'Hesabınıza ait bütün kayıtları ilgili sayfada bulabilirsiniz.', isCapsule ? '/kapsullerim' : '/siparislerim', isCapsule ? 'Kapsüllerime dön' : 'Siparişlerime dön'))
    };
  }

  function orderRows(orders, compact) {
    if (!orders.length) { return emptyState('Henüz bir sipariş yok', 'İlk kapsülünüzü seçtiğinizde yolculuğunu buradan takip edebilirsiniz.', '/kapsuller', 'Kapsülleri keşfet'); }
    return '<div class="table-wrap cu-order-table"><table class="data-table"><caption class="visually-hidden">Siparişleriniz ve durumları</caption><thead><tr><th scope="col">Sipariş</th>' + (compact ? '' : '<th scope="col">İçerik</th>') + '<th scope="col">Ödeme</th><th scope="col">Teslimat</th><th scope="col" class="cu-numeric">Toplam</th><th scope="col"><span class="visually-hidden">Ayrıntılar</span></th></tr></thead><tbody>' + orders.map(function (order) {
      return '<tr><td><a class="cu-order-id" href="' + E(routeLink(orderPath(order.id))) + '">' + E(order.id) + '</a><span class="cu-table-sub">' + dateText(order.date) + '</span></td>' +
        (compact ? '' : '<td><span class="cu-order-products">' + order.items.map(function (item) { return E(item.name) + (item.quantity > 1 ? ' × ' + E(item.quantity) : ''); }).join('<br>') + '</span></td>') +
        '<td>' + C.badge(order.payment) + '</td><td>' + C.badge(order.fulfillment) + '</td><td class="cu-numeric cu-order-total">' + E(C.money(order.total)) + '</td><td><a class="icon-button" href="' + E(routeLink(orderPath(order.id))) + '" aria-label="' + E(order.id) + ' siparişinin ayrıntıları">' + icon('arrow-right', 18) + '</a></td></tr>';
    }).join('') + '</tbody></table></div>';
  }

  function capsuleCard(capsule) {
    var product = C.product(capsule.productId);
    var planting = capsule.planting;
    return '<article class="cu-capsule-card"><a class="cu-capsule-photo-link" href="' + E(routeLink(capsulePath(capsule.id))) + '"><img src="' + E(petPhoto(capsule)) + '" alt="' + E(petName(capsule)) + '" class="cu-capsule-photo" loading="lazy"><span class="cu-photo-status">' + C.badge(capsule.status) + '</span></a><div class="cu-capsule-card-body"><div class="cu-capsule-card-title"><h2><a href="' + E(routeLink(capsulePath(capsule.id))) + '">' + E(petName(capsule)) + '</a></h2><span>' + E(capsule.id) + '</span></div><p class="cu-capsule-product">' + E(product ? product.name : 'Candan Cana kapsülü') + '</p><p class="cu-location-line">' + icon(planting ? 'map-pin' : 'clock', 17) + '<span>' + E(planting ? (planting.district || planting.label || 'Dikim konumu paylaşıldı') : 'Dikim bilgisi henüz paylaşılmadı') + '</span></p><a class="cu-card-link" href="' + E(routeLink(capsulePath(capsule.id))) + '">Kapsülüme git ' + icon('arrow-right', 18) + '</a></div></article>';
  }

  function dashboard(route) {
    var user = current();
    var capsules = ownCapsules();
    var orders = ownOrders();
    var awaiting = capsules.filter(function (capsule) { return capsule.status === 'awaiting_planting'; });
    var planted = capsules.filter(function (capsule) { return Boolean(capsule.planting); });
    var featured = capsules.find(function (capsule) { return capsule.status === 'planted'; }) || capsules[0];
    var welcome = featured ? '<section class="cu-welcome"><div class="cu-welcome-copy"><h2>Sevginiz, büyümeye<br>devam ediyor.</h2><p>' + E(petName(featured)) + ' için oluşturduğunuz hatırayı, kapsülünüzün yolculuğunu ve bakım notlarını bir arada bulabilirsiniz.</p><a class="btn btn-primary" href="' + E(routeLink(capsulePath(featured.id))) + '">Kapsülü görüntüle ' + icon('arrow-right', 17) + '</a></div><div class="cu-welcome-image"><img src="assets/paw-tree.jpg" alt="Doğayla buluşan bir hatıra" fetchpriority="high"></div></section>' : emptyState('Yeni bir hatıranın başlangıcı', 'Size uygun kapsülü keşfedin; hatıranızın yolculuğunu birlikte şekillendirelim.', '/kapsuller', 'Kapsülleri keşfet');
    var pending = awaiting.length ? '<section class="cu-next-step" aria-label="Sıradaki adım"><span class="cu-next-icon">' + icon('map-pin', 23) + '</span><div><h2>' + E(petName(awaiting[0])) + ' için dikim yerini paylaşın</h2><p>Kapsülünüzü diktiyseniz, haritada yerini işaretleyebilirsiniz.</p></div><a class="btn btn-secondary btn-sm" href="' + E(routeLink(capsulePath(awaiting[0].id, 'dikim'))) + '">Konum bildir ' + icon('arrow-right', 16) + '</a></section>' : '';
    var garden = '<section class="cu-section"><div class="cu-section-heading"><div><h2>Hatıra bahçem</h2><p>' + E(capsules.length) + ' kapsülünüzden ' + E(planted.length) + ' tanesinin dikim konumu kayıtlı.</p></div><a class="text-link" href="#/kapsullerim">Tüm kapsüllerim ' + icon('arrow-right', 16) + '</a></div>' + (planted.length ? C.map(mapMarkers(planted), { id: 'customer-garden-map', height: 330 }) : '<div class="cu-map-empty">' + icon('map-pin', 25) + '<p>İlk dikim konumunuz paylaşıldığında burada görünecek.</p></div>') + '</section>';
    var recent = '<section class="cu-section"><div class="cu-section-heading"><h2>Son siparişlerim</h2><a class="text-link" href="#/siparislerim">Tümünü gör ' + icon('arrow-right', 16) + '</a></div>' + orderRows(orders.slice(0, 3), true) + '</section>';
    return { title: 'Hesabım', html: accountShell(route, 'Merhaba ' + user.name.split(' ')[0] + ',', 'Hatıralarınızın ve yeni filizlerinize uzanan yolculuğunuzun yanındayız.', welcome + pending + garden + recent), bind: function () {
      if (planted.length) { C.mountMap('customer-garden-map', { onSelect: function (id) { if (ownCapsule(id)) { C.go(capsulePath(id)); } } }); }
    } };
  }

  function ordersView(route) {
    var orders = ownOrders();
    var filter = route.query.get('durum') || 'tumu';
    var filtered = orders.filter(function (order) { return filter === 'devam' ? order.fulfillment !== 'delivered' : filter === 'teslim' ? order.fulfillment === 'delivered' : true; });
    var filters = [{ id: 'tumu', label: 'Tümü', count: orders.length }, { id: 'devam', label: 'Devam eden', count: orders.filter(function (o) { return o.fulfillment !== 'delivered'; }).length }, { id: 'teslim', label: 'Teslim edilen', count: orders.filter(function (o) { return o.fulfillment === 'delivered'; }).length }];
    var tabs = '<nav class="cu-filter-tabs" aria-label="Siparişleri filtrele">' + filters.map(function (item) { return '<a href="#/siparislerim?durum=' + item.id + '" class="' + (filter === item.id ? 'is-active' : '') + '"' + (filter === item.id ? ' aria-current="page"' : '') + '>' + item.label + '<span>' + item.count + '</span></a>'; }).join('') + '</nav>';
    var content = filtered.length || !orders.length ? orderRows(filtered, false) : emptyState('Bu grupta siparişiniz yok', 'Diğer siparişlerinizi görmek için tüm siparişlere dönebilirsiniz.', '/siparislerim', 'Tüm siparişlerim');
    return { title: 'Siparişlerim', html: accountShell(route, 'Siparişlerim', 'Ödeme ve teslimat bilgilerini her sipariş için ayrı ayrı takip edin.', tabs + content, actionLink('/kapsuller', 'Kapsülleri keşfet', true)) };
  }

  function orderDetail(route) {
    var order = ownOrder(route.parts[1]);
    if (!order) { return missingView(route, 'order'); }
    var customer = C.customer(order.customerId) || current();
    var contact = order.contact || {};
    var recipient = {
      name: contact.name || customer.name || 'Alıcı bilgisi belirtilmedi',
      phone: contact.phone || customer.phone || 'Telefon bilgisi eklenmedi',
      email: contact.email || customer.email || '',
      city: contact.city || ''
    };
    var capsules = ownCapsules().filter(function (capsule) { return capsule.orderId === order.id; });
    var subtotal = order.items.reduce(function (sum, item) { return sum + Number(item.quantity) * Number(item.unitPrice); }, 0);
    var difference = Number(order.total) - subtotal;
    var statusBlock = '<div class="cu-order-status-bar"><div><span>Ödeme</span>' + C.badge(order.payment) + '</div><div><span>Teslimat</span>' + C.badge(order.fulfillment) + '</div><div><span>Sipariş tarihi</span><strong>' + dateText(order.date) + '</strong></div></div>';
    var items = '<section class="cu-surface cu-order-items"><h2>Sipariş içeriği</h2>' + order.items.map(function (item) {
      var product = C.product(item.productId);
      return '<div class="cu-order-item"><img src="' + E(product ? product.image : 'assets/capsule.jpg') + '" alt="' + E(item.name) + '" loading="lazy"><div><h3>' + E(item.name) + '</h3><p>' + E(item.quantity) + ' adet · Birim fiyat ' + E(C.money(item.unitPrice)) + '</p></div><strong>' + E(C.money(item.quantity * item.unitPrice)) + '</strong></div>';
    }).join('') + '<div class="cu-order-totals"><div><span>Ürünler toplamı</span><span>' + E(C.money(subtotal)) + '</span></div>' + (Math.abs(difference) > 0.009 ? '<div><span>' + (difference < 0 ? 'Sipariş indirimi' : 'Teslimat ve hizmet') + '</span><span>' + E(C.money(difference)) + '</span></div>' : '') + '<div class="cu-total-line"><strong>Sipariş toplamı</strong><strong>' + E(C.money(order.total)) + '</strong></div><p>Siparişinizin verildiği tarihteki fiyatlar geçerlidir.</p></div></section>';
    var side = '<aside class="cu-surface cu-order-address"><h2>Teslimat bilgileri</h2><strong>' + E(recipient.name) + '</strong><p>' + E(order.address || 'Teslimat adresi belirtilmedi.').replace(/\n/g, '<br>') + '</p>' + (recipient.city ? '<p>Şehir: ' + E(recipient.city) + '</p>' : '') + '<p class="cu-contact-line">' + icon('phone', 16) + '<span>' + E(recipient.phone) + '</span></p>' + (recipient.email ? '<p class="cu-contact-line">' + icon('mail', 16) + '<span>' + E(recipient.email) + '</span></p>' : '') + (order.note ? '<div class="cu-order-note"><h3>Sipariş notunuz</h3><p>' + E(order.note).replace(/\n/g, '<br>') + '</p></div>' : '') + '<a class="text-link" href="#/iletisim">Bize ulaşın ' + icon('arrow-up-right', 15) + '</a></aside>';
    var capsuleList = capsules.length ? '<section class="cu-section"><div class="cu-section-heading"><div><h2>Bu siparişin kapsülleri</h2><p>Her kapsülün dikim ve anı bilgileri kendine özeldir.</p></div></div><div class="cu-order-capsules">' + capsules.map(function (capsule) { return '<a class="cu-capsule-row" href="' + E(routeLink(capsulePath(capsule.id))) + '"><img src="' + E(petPhoto(capsule)) + '" alt="" loading="lazy"><span><strong>' + E(petName(capsule)) + '</strong><small>' + E(capsule.id) + '</small></span>' + C.badge(capsule.status) + icon('chevron-right', 18) + '</a>'; }).join('') + '</div></section>' : '<p class="cu-muted-note">Kapsülleriniz hazırlanmaya başladığında bu siparişe ait kayıtlar burada görünecek.</p>';
    return { title: order.id + ' — Siparişim', html: accountShell(route, order.id, 'Siparişinizin bütün ayrıntıları bir arada.', statusBlock + '<div class="cu-order-detail-grid">' + items + side + '</div>' + capsuleList, '<a class="btn btn-secondary" href="#/siparislerim">' + icon('arrow-left', 17) + 'Siparişlerime dön</a>') };
  }

  function capsulesView(route) {
    var capsules = ownCapsules();
    return { title: 'Kapsüllerim', html: accountShell(route, 'Kapsüllerim', 'Her bir kapsül, kendine ait bir hatırayı ve yeni bir yaşamı taşıyor.', capsules.length ? '<div class="cu-capsule-grid">' + capsules.map(capsuleCard).join('') + '</div>' : emptyState('Hatıra bahçeniz burada başlayacak', 'İlk kapsülünüzün kaydı oluştuğunda, dikim sürecini ve anı sayfasını buradan yönetebilirsiniz.', '/kapsuller', 'Kapsülleri keşfet'), capsules.length ? actionLink('/kapsuller', 'Yeni kapsül keşfet', true) : '') };
  }

  function careSection(capsule) {
    var care = (capsule.care || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    return '<section class="cu-section"><div class="cu-section-heading"><div><h2>Fidanın günlüğü</h2><p>Küçük gelişmeler ve bakım notları.</p></div></div>' +
      (care.length ? '<ol class="cu-care-list">' + care.map(function (entry) { return '<li><span class="cu-care-icon" aria-hidden="true">' + icon(entry.type === 'Sulama' ? 'leaf' : 'sprout', 18) + '</span><div class="cu-care-body"><div class="cu-care-title"><h3>' + E(entry.type || 'Bakım notu') + '</h3><time datetime="' + E(isoDay(entry.date)) + '">' + dateText(entry.date) + '</time></div><p>' + E(entry.note || '').replace(/\n/g, '<br>') + '</p>' + (entry.image ? '<img class="cu-care-image" src="' + E(entry.image) + '" alt="Fidandan paylaşılan görüntü" loading="lazy">' : '') + '<span class="cu-care-by">' + E(entry.by || 'Candan Cana ekibi') + '</span></div></li>'; }).join('') + '</ol>' : '<p class="cu-muted-note">İlk bakım veya gözlem notu paylaşıldığında burada görünecek.</p>') +
      '<details class="cu-add-care"><summary>' + icon('plus', 18) + 'Bir bakım notu ekle</summary><form data-form="customer-care" data-id="' + E(capsule.id) + '" class="cu-inline-form"><div class="form-grid"><div class="field"><label class="field-label" for="cu-care-type">Not türü</label><select class="select" id="cu-care-type" name="type"><option>Gözlem</option><option>Sulama</option><option>Ziyaret</option></select></div><div class="field"><label class="field-label" for="cu-care-date">Tarih</label><input class="input" id="cu-care-date" name="date" type="date" value="' + today() + '" max="' + today() + '" required></div></div><div class="field"><label class="field-label" for="cu-care-note">Paylaşmak istediğiniz not</label><textarea class="textarea" id="cu-care-note" name="note" rows="3" maxlength="1200" placeholder="Fidanınızda gördüğünüz küçük bir gelişme…" required></textarea></div><p class="cu-field-hint">Bu günlük hesabınızda ve ekibin bakım kayıtlarında görünür.</p>' + errorBox() + '<button class="btn btn-primary" type="submit">Notu kaydet ' + icon('check', 17) + '</button></form></details></section>';
  }

  function overviewPanel(capsule) {
    var planting = capsule.planting;
    var product = C.product(capsule.productId);
    var memorial = capsule.memorial || {};
    var location = '<section class="cu-surface cu-location-summary"><div class="cu-section-heading"><div><h2>Dikim yolculuğu</h2><p>' + E(planting ? (planting.verified ? 'Dikim bilgisi ekibimiz tarafından doğrulandı.' : 'Paylaştığınız dikim bilgisi kaydedildi.') : 'Dikim bilgilerinizi buradan takip edebilirsiniz.') + '</p></div></div>' + (planting ? C.map(mapMarkers([capsule]), { id: 'customer-capsule-map', height: 300, selected: capsule.id }) + '<div class="cu-location-meta"><div>' + icon('map-pin', 19) + '<span><strong>' + E(planting.label || planting.district || 'Dikim yeri') + '</strong><small>' + E(planting.district || '') + '</small></span></div><time datetime="' + E(isoDay(planting.date)) + '">' + dateText(planting.date) + '</time></div>' : '<div class="cu-location-wait">' + icon('sprout', 34) + '<h3>' + (capsule.status === 'awaiting_planting' ? 'Toprakla buluşmaya hazır' : 'Yeni yaşamına doğru') + '</h3><p>' + (capsule.status === 'awaiting_planting' ? 'Dikimi yaptıysanız, yerini ve tarihini paylaşabilirsiniz.' : 'Kapsülünüzün hazırlanma ve teslimat adımlarını siparişinizden takip edebilirsiniz.') + '</p></div>') + '<a class="text-link" href="' + E(routeLink(capsulePath(capsule.id, 'dikim'))) + '">' + (planting ? 'Dikim bilgilerine git' : 'Dikim bilgisi paylaş') + ' ' + icon('arrow-right', 16) + '</a></section>';
    var memorialPreview = '<aside class="cu-memorial-preview"><span class="cu-preview-icon">' + icon('heart', 26) + '</span><h2>Birlikte geçen<br>güzel günlere.</h2><p>' + E(memorial.story ? excerpt(memorial.story, 200) : 'Dostunuzun hikâyesini, sevdiğiniz bir anıyı veya ona söylemek istediklerinizi paylaşın.') + '</p><div class="cu-privacy-label">' + icon(memorial.isPublic ? 'external-link' : 'shield', 16) + E(memorial.isPublic ? 'Bağlantıyla görüntülenebilir' : 'Yalnızca size özel') + '</div><a class="btn btn-secondary" href="' + E(routeLink(capsulePath(capsule.id, 'ani'))) + '">Anı sayfasını düzenle ' + icon('edit', 16) + '</a></aside>';
    var facts = '<dl class="cu-capsule-facts"><div><dt>Kapsül numarası</dt><dd>' + E(capsule.id) + '</dd></div><div><dt>Seçtiğiniz kapsül</dt><dd>' + E(product ? product.name : 'Candan Cana') + '</dd></div><div><dt>Sipariş</dt><dd><a class="text-link" href="' + E(routeLink(orderPath(capsule.orderId))) + '">' + E(capsule.orderId) + ' ' + icon('arrow-up-right', 13) + '</a></dd></div></dl>';
    return '<div class="cu-capsule-overview">' + location + memorialPreview + '</div>' + facts + careSection(capsule);
  }

  function plantingPanel(capsule) {
    var planting = capsule.planting;
    var canReport = ['awaiting_planting', 'reported', 'planted'].indexOf(capsule.status) !== -1;
    if (!canReport) { return '<section class="cu-surface cu-planting-locked">' + icon('truck', 32) + '<h2>Önce kapsülünüz size ulaşsın</h2><p>Hazırlık ve teslimat tamamlandığında, dikim yerini bu sayfadan bildirebilirsiniz.</p>' + actionLink(orderPath(capsule.orderId), 'Siparişimi takip et', true) + '</section>'; }
    return '<section class="cu-surface cu-planting-panel"><div class="cu-section-heading"><div><h2>' + (planting ? 'Dikim bilgileri' : 'Dikim yerini paylaşın') + '</h2><p>' + (planting && planting.verified ? 'Konumu değiştirdiğinizde yeni bilginiz ekibin kontrolüne iletilir.' : 'Haritadan yaklaşık bir nokta seçin ve dikim bilgilerini tamamlayın.') + '</p></div>' + (planting ? C.badge(capsule.status) : '') + '</div>' + C.map(planting ? mapMarkers([capsule]) : [], { id: 'customer-planting-map', height: 340, picker: true, selected: planting ? capsule.id : null }) +
      '<form data-form="customer-planting" data-id="' + E(capsule.id) + '" class="cu-planting-form"><p class="cu-field-hint cu-map-selection" id="cu-map-selection" aria-live="polite">' + (planting ? 'Kayıtlı noktanız yüklendi. Haritaya dokunarak değiştirebilirsiniz.' : 'Bir nokta seçmek için haritaya tıklayın veya koordinatları yazın.') + '</p><div class="form-grid"><div class="field"><label class="field-label" for="cu-latitude">Enlem</label><input class="input" id="cu-latitude" name="lat" type="number" step="any" min="-90" max="90" value="' + E(planting ? planting.lat : '') + '" placeholder="Örn. 41.0365" data-change="customer-coordinate" aria-describedby="cu-map-selection" required></div><div class="field"><label class="field-label" for="cu-longitude">Boylam</label><input class="input" id="cu-longitude" name="lng" type="number" step="any" min="-180" max="180" value="' + E(planting ? planting.lng : '') + '" placeholder="Örn. 29.1452" data-change="customer-coordinate" aria-describedby="cu-map-selection" required></div><div class="field"><label class="field-label" for="cu-district">İlçe</label><input class="input" id="cu-district" name="district" value="' + E(planting ? planting.district : '') + '" maxlength="80" placeholder="Örn. Çekmeköy" list="cu-district-options" required><datalist id="cu-district-options"><option value="Ataşehir"><option value="Beykoz"><option value="Çekmeköy"><option value="Kadıköy"><option value="Kartal"><option value="Maltepe"><option value="Pendik"><option value="Sancaktepe"><option value="Üsküdar"></datalist></div><div class="field"><label class="field-label" for="cu-plant-date">Dikim tarihi</label><input class="input" id="cu-plant-date" name="date" type="date" value="' + E(planting ? isoDay(planting.date) : today()) + '" max="' + today() + '" required></div></div><div class="field"><label class="field-label" for="cu-plant-label">Bu yere verdiğiniz isim</label><input class="input" id="cu-plant-label" name="label" value="' + E(planting ? planting.label : '') + '" maxlength="120" placeholder="Örn. Luna’nın bahçesi" required></div><div class="cu-form-note">' + icon('shield', 19) + '<p>Bu kayıt hesabınız ve ekibimiz içindir. Konumun anı sayfasında görünmesini <a class="text-link" href="' + E(routeLink(capsulePath(capsule.id, 'ani'))) + '">anı ayarlarından</a> ayrıca seçebilirsiniz.</p></div>' + errorBox() + '<div class="cu-form-actions"><button class="btn btn-primary" type="submit">' + (planting ? 'Dikim bilgisini güncelle' : 'Dikim bilgisini gönder') + ' ' + icon('check', 17) + '</button></div></form></section>';
  }

  function memorialPanel(capsule) {
    var memorial = capsule.memorial || {};
    return '<div class="cu-memorial-editor-grid"><section class="cu-surface cu-memorial-editor"><h2>Onun hikâyesi, sizin sözlerinizle.</h2><p class="cu-intro-copy">İstediğiniz kadar yazın. Bazen tek bir cümle bile çok şey anlatır.</p><form data-form="customer-memorial" data-id="' + E(capsule.id) + '"><div class="form-grid"><div class="field"><label class="field-label" for="cu-pet-name">Dostunuzun adı</label><input class="input" id="cu-pet-name" name="petName" value="' + E(capsule.petName) + '" maxlength="60" required></div><div class="field"><label class="field-label" for="cu-pet-type">Dostunuzun türü</label><input class="input" id="cu-pet-type" name="petType" value="' + E(capsule.petType) + '" maxlength="40" placeholder="Örn. Kedi"></div><div class="field"><label class="field-label" for="cu-birth-date">Doğum tarihi <span>(isteğe bağlı)</span></label><input class="input" id="cu-birth-date" name="birthDate" type="date" value="' + E(isoDay(memorial.birthDate)) + '" max="' + today() + '"></div><div class="field"><label class="field-label" for="cu-loss-date">Veda tarihi <span>(isteğe bağlı)</span></label><input class="input" id="cu-loss-date" name="lossDate" type="date" value="' + E(isoDay(memorial.lossDate)) + '" max="' + today() + '"></div></div><div class="field"><label class="field-label" for="cu-memory-story">Hatırlamak istediğiniz hikâye</label><textarea class="textarea cu-story-input" id="cu-memory-story" name="story" rows="8" maxlength="5000" placeholder="Birlikte geçirdiğiniz güzel günler, küçük alışkanlıkları, size bıraktığı iz…">' + E(memorial.story) + '</textarea><span class="cu-field-hint">En fazla 5.000 karakter. Bu hikâyeyi dilediğiniz zaman değiştirebilirsiniz.</span></div><fieldset class="cu-privacy-options"><legend>Paylaşım tercihleri</legend><label class="cu-check-row"><input type="checkbox" name="isPublic"' + (memorial.isPublic ? ' checked' : '') + '><span><strong>Anı sayfasını bağlantıya sahip kişiler görebilsin</strong><small>Kapalı olduğunda hikâye ve fotoğraf anı bağlantısında gösterilmez.</small></span></label><label class="cu-check-row"><input type="checkbox" name="showLocation"' + (memorial.showLocation ? ' checked' : '') + '><span><strong>Dikim konumu anı sayfasında da görünsün</strong><small>Sayfa paylaşımını açsanız da konumunu gizli tutabilirsiniz.</small></span></label></fieldset>' + errorBox() + '<div class="cu-form-actions"><button type="submit" class="btn btn-primary">Anıyı kaydet ' + icon('check', 17) + '</button><a class="btn btn-ghost" href="' + E(routeLink(capsulePath(capsule.id))) + '">Vazgeç</a></div></form></section><aside class="cu-editor-preview"><img src="' + E(petPhoto(capsule)) + '" alt="' + E(petName(capsule)) + '"><div><h3>' + E(petName(capsule)) + '</h3><p>Kalbimizde bir hatıra,<br>toprakta yeni bir hayat.</p><span class="cu-privacy-label">' + icon(memorial.isPublic ? 'external-link' : 'shield', 16) + E(memorial.isPublic ? 'Bağlantıyla paylaşılabilir' : 'Size özel') + '</span>' + (memorial.isPublic ? '<a class="text-link" href="' + E(routeLink(memorialPath(capsule))) + '">Anı sayfasını görüntüle ' + icon('arrow-up-right', 16) + '</a>' : '<p class="cu-field-hint">Anı bağlantısı şu an özel. Buradaki bilgiler yalnızca sizin hesabınızda görünür.</p>') + '</div></aside></div>';
  }

  function capsuleDetail(route) {
    var capsule = ownCapsule(route.parts[1]);
    if (!capsule) { return missingView(route, 'capsule'); }
    var tab = route.query.get('tab') || 'genel';
    if (['genel', 'dikim', 'ani'].indexOf(tab) === -1) { tab = 'genel'; }
    var tabs = '<nav class="cu-detail-tabs" aria-label="Kapsül ayrıntıları">' + [{ id: 'genel', label: 'Genel bakış', icon: 'sprout' }, { id: 'dikim', label: 'Dikim ve konum', icon: 'map-pin' }, { id: 'ani', label: 'Anı sayfası', icon: 'heart' }].map(function (item) { return '<a class="' + (tab === item.id ? 'is-active' : '') + '" href="' + E(routeLink(capsulePath(capsule.id, item.id))) + '"' + (tab === item.id ? ' aria-current="page"' : '') + '>' + icon(item.icon, 17) + item.label + '</a>'; }).join('') + '</nav>';
    var hero = '<div class="cu-capsule-identity"><img src="' + E(petPhoto(capsule)) + '" alt="' + E(petName(capsule)) + '"><div><h2>' + E(petName(capsule)) + '</h2><p>' + E(capsule.petType || 'Can dostumuz') + ' <span aria-hidden="true">·</span> ' + E(capsule.id) + '</p></div><div class="cu-capsule-identity-status">' + C.badge(capsule.status) + '</div></div>';
    var content = tab === 'dikim' ? plantingPanel(capsule) : tab === 'ani' ? memorialPanel(capsule) : overviewPanel(capsule);
    return { title: petName(capsule) + ' — Kapsülüm', html: accountShell(route, 'Kapsülüm', '', hero + tabs + content, '<a class="btn btn-secondary" href="#/kapsullerim">' + icon('arrow-left', 17) + 'Kapsüllerime dön</a>'), bind: function () {
      if (tab === 'genel' && capsule.planting) { C.mountMap('customer-capsule-map'); }
      if (tab === 'dikim' && ['awaiting_planting', 'reported', 'planted'].indexOf(capsule.status) !== -1) {
        C.mountMap('customer-planting-map', { onPick: function (point) {
          var form = document.querySelector('[data-form="customer-planting"]');
          if (!form || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) { return; }
          form.elements.namedItem('lat').value = point.lat.toFixed(5);
          form.elements.namedItem('lng').value = point.lng.toFixed(5);
          var text = document.getElementById('cu-map-selection');
          if (text) { text.textContent = 'Konum seçildi. İlçe, dikim tarihi ve yer adını tamamlayıp kaydedebilirsiniz.'; }
          clearError(form);
        } });
      }
    } };
  }

  function profileView(route) {
    var user = current();
    var form = '<section class="cu-surface cu-profile-form"><h2>İletişim bilgileriniz</h2><p class="cu-intro-copy">Bu örnek hesapta yaptığınız değişiklikler yalnızca bu tarayıcıda saklanır.</p><form data-form="customer-profile"><div class="form-grid"><div class="field"><label class="field-label" for="cu-profile-name">Ad soyad</label><input id="cu-profile-name" name="name" class="input" value="' + E(user.name) + '" autocomplete="name" maxlength="100" required></div><div class="field"><label class="field-label" for="cu-profile-phone">Telefon</label><input id="cu-profile-phone" name="phone" class="input" type="tel" value="' + E(user.phone) + '" autocomplete="tel" maxlength="30"></div></div><div class="field"><label class="field-label" for="cu-profile-email">E-posta</label><input id="cu-profile-email" name="email" class="input" type="email" value="' + E(user.email) + '" autocomplete="email" maxlength="160" required></div><div class="field"><label class="field-label" for="cu-profile-address">Adres</label><textarea id="cu-profile-address" name="address" class="textarea" rows="3" autocomplete="street-address" maxlength="500">' + E(user.address) + '</textarea></div><p class="cu-field-hint">Adres değişikliği, daha önce verilen siparişlerin teslimat adresini değiştirmez.</p>' + errorBox() + '<button class="btn btn-primary" type="submit">Bilgilerimi kaydet ' + icon('check', 17) + '</button></form></section>';
    return { title: 'Bilgilerim', html: accountShell(route, 'Bilgilerim', 'Sizinle nasıl iletişim kurabileceğimizi buradan düzenleyin.', form) };
  }

  function publicMemorial(route) {
    var capsule = C.db.capsules.find(function (item) { return item.memorialSlug === route.parts[1]; });
    if (!capsule) { return { title: 'Anı bulunamadı', html: '<div class="cu-public-message">' + icon('leaf', 42) + '<h1>Bu anıya ulaşılamıyor.</h1><p>Bağlantı değişmiş olabilir. Size gönderilen adresi kontrol edebilirsiniz.</p>' + actionLink('/', 'Candan Cana’ya dön', true) + '</div>' }; }
    var memorial = capsule.memorial || {};
    if (!memorial.isPublic) {
      var isOwner = capsule.customerId === current().id;
      return { title: 'Özel bir hatıra', html: '<div class="cu-public-message cu-private-memorial">' + icon('shield', 38) + '<h1>Bazı hatıralar,<br>kalbe özeldir.</h1><p>Bu anı sayfası paylaşıma açık değil.</p>' + (isOwner ? '<p class="cu-private-owner">Bu anı sizin hesabınıza ait. İçeriğini ve paylaşım tercihlerini hesabınızdan düzenleyebilirsiniz.</p>' + actionLink(capsulePath(capsule.id, 'ani'), 'Anı ayarlarıma git', false) : actionLink('/', 'Candan Cana’ya dön', true)) + '</div>' };
    }
    var dates = [memorial.birthDate ? C.date(memorial.birthDate) : '', memorial.lossDate ? C.date(memorial.lossDate) : ''].filter(Boolean).join(' — ');
    var visibleLocation = Boolean(memorial.showLocation && capsule.planting);
    var story = memorial.story ? E(memorial.story).replace(/\n/g, '<br>') : 'Bazı sevgiler sözcüklere sığmaz. ' + E(petName(capsule)) + ' için paylaşılan bu hatıra, onu sevenlerin kalbinde yaşamaya devam ediyor.';
    var mapSection = visibleLocation ? '<section class="cu-memory-place"><div class="cu-memory-place-copy">' + icon('sprout', 32) + '<h2>Bir hatıranın<br>kök saldığı yer.</h2><p>' + E(capsule.planting.label || capsule.planting.district || 'Dikim yeri') + '</p><span>' + E(capsule.planting.district || '') + (capsule.planting.date ? ' · ' + C.date(capsule.planting.date) : '') + '</span><small>' + (capsule.planting.verified ? 'Ekibin doğruladığı dikim kaydı' : 'Ailesinin paylaştığı dikim konumu') + '</small></div><div>' + C.map(mapMarkers([capsule]), { id: 'customer-public-memorial-map', selected: capsule.id, height: 360 }) + '</div></section>' : '<section class="cu-memory-nature"><img src="assets/paw-tree.jpg" alt="Doğada büyüyen yeni bir yaşam" loading="lazy"><div>' + icon('leaf', 30) + '<h2>Sevginin izi kalır.</h2><p>Birlikte geçen günlerin hatırası,<br>yaşamın içinde kendine yeni bir yer bulur.</p></div></section>';
    return { title: petName(capsule) + ' — Anı Sayfası', html: '<div class="cu-memorial"><section class="cu-memory-hero"><div class="cu-memory-intro"><span class="cu-memory-leaf" aria-hidden="true">' + icon('leaf', 30) + '</span><h1>' + E(petName(capsule)) + '</h1>' + (dates ? '<p class="cu-memory-dates">' + E(dates) + '</p>' : '') + '<p class="cu-memory-dedication">Kalbimizde bir hatıra,<br>toprakta yeni bir hayat.</p><button class="btn btn-secondary" data-action="customer-share" data-id="' + E(capsule.id) + '">' + icon('external-link', 17) + 'Anı bağlantısını kopyala</button></div><figure class="cu-memory-portrait"><img src="' + E(petPhoto(capsule)) + '" alt="' + E(petName(capsule)) + '" fetchpriority="high"></figure></section><section class="cu-memory-story"><div class="cu-memory-story-symbol" aria-hidden="true">' + icon('heart', 24) + '</div><h2>Daima bizimle.</h2><div class="cu-memory-prose">' + story + '</div></section>' + mapSection + '<section class="cu-memory-closing"><span aria-hidden="true">' + icon('sprout', 30) + '</span><p>Bir candan, bir cana.</p><a class="text-link" href="#/kapsuller">Candan Cana’yı keşfedin ' + icon('arrow-right', 17) + '</a></section></div>', bind: function () { if (visibleLocation) { C.mountMap('customer-public-memorial-map'); } } };
  }

  C.customerView = function (route) {
    if (route.parts[0] === 'ani') { return publicMemorial(route); }
    if (route.path === '/hesabim') { return route.query.get('tab') === 'profil' ? profileView(route) : dashboard(route); }
    if (route.path === '/siparislerim') { return ordersView(route); }
    if (route.parts[0] === 'siparis') { return orderDetail(route); }
    if (route.path === '/kapsullerim') { return capsulesView(route); }
    if (route.parts[0] === 'kapsulum') { return capsuleDetail(route); }
    return null;
  };

  C.changes['customer-coordinate'] = function (input) {
    var form = input.closest('[data-form="customer-planting"]');
    if (!form || typeof C.setMapPickedPoint !== 'function') { return; }
    var latitude = form.elements.namedItem('lat').value;
    var longitude = form.elements.namedItem('lng').value;
    if (!latitude.trim() || !longitude.trim()) { return; }
    var valid = C.setMapPickedPoint('customer-planting-map', { lat: Number(latitude), lng: Number(longitude) });
    var feedback = document.getElementById('cu-map-selection');
    if (feedback) { feedback.textContent = valid ? 'Yazdığınız konum haritada işaretlendi. Bilgileri tamamlayıp kaydedebilirsiniz.' : 'Koordinatlar örnek İstanbul haritasının dışında. Haritadan bir nokta seçebilirsiniz.'; }
    if (valid) { clearError(form); }
  };

  C.forms['customer-planting'] = function (form, event) {
    event.preventDefault();
    clearError(form);
    var capsule = ownCapsule(form.dataset.id);
    if (!capsule || ['awaiting_planting', 'reported', 'planted'].indexOf(capsule.status) === -1) { formError(form, 'Bu kapsül için henüz dikim bilgisi paylaşılamıyor. Siparişinizin durumunu kontrol edin.'); return; }
    var data = new FormData(form);
    var lat = Number(data.get('lat'));
    var lng = Number(data.get('lng'));
    var district = String(data.get('district') || '').trim();
    var label = String(data.get('label') || '').trim();
    var date = String(data.get('date') || '');
    if (!String(data.get('lat') || '').trim() || !String(data.get('lng') || '').trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { formError(form, 'Haritadan bir nokta seçin veya geçerli enlem ve boylam girin.', form.elements.namedItem('lat')); return; }
    var point = C.mapPoint(lng, lat);
    if (point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) { formError(form, 'Bu örnekte İstanbul haritasının içinden bir konum seçebilirsiniz.', form.elements.namedItem('lat')); return; }
    if (!district || !label) { formError(form, 'İlçeyi ve dikim yerine verdiğiniz ismi yazın.', form.elements.namedItem(!district ? 'district' : 'label')); return; }
    if (!date || date > today()) { formError(form, 'Dikim tarihi bugün veya geçmiş bir gün olmalı.', form.elements.namedItem('date')); return; }
    var previous = capsule.planting;
    if (previous && Number(previous.lat) === lat && Number(previous.lng) === lng && previous.district === district && previous.label === label && isoDay(previous.date) === date) { C.toast('Dikim bilgileriniz zaten güncel.'); return; }
    capsule.planting = { lat: lat, lng: lng, district: district, label: label, date: date, verified: false, source: 'customer' };
    capsule.status = 'reported';
    C.audit('Müşteri dikim bildirimi', capsule.id + ' için ' + district + ' ilçesindeki dikim bilgisi paylaşıldı.');
    C.commit('Dikim bilginiz kaydedildi. Ekibimiz kayıtlarınızda görebilir.');
  };

  C.forms['customer-memorial'] = function (form, event) {
    event.preventDefault();
    clearError(form);
    var capsule = ownCapsule(form.dataset.id);
    if (!capsule) { formError(form, 'Bu anı kaydını düzenleyemiyorsunuz. Kapsüllerinizden yeniden açın.'); return; }
    var data = new FormData(form);
    var name = String(data.get('petName') || '').trim();
    var birthDate = String(data.get('birthDate') || '');
    var lossDate = String(data.get('lossDate') || '');
    if (!name) { formError(form, 'Dostunuzun adını yazın.', form.elements.namedItem('petName')); return; }
    if ((birthDate && birthDate > today()) || (lossDate && lossDate > today())) { formError(form, 'Tarihler bugün veya geçmiş bir gün olmalı.', form.elements.namedItem(birthDate > today() ? 'birthDate' : 'lossDate')); return; }
    if (birthDate && lossDate && birthDate > lossDate) { formError(form, 'Doğum tarihi veda tarihinden sonra olamaz.', form.elements.namedItem('birthDate')); return; }
    capsule.petName = name;
    capsule.petType = String(data.get('petType') || '').trim();
    capsule.memorial = Object.assign({}, capsule.memorial || {}, { story: String(data.get('story') || '').trim(), birthDate: birthDate, lossDate: lossDate, isPublic: data.has('isPublic'), showLocation: data.has('showLocation') });
    C.audit('Anı sayfası düzenlendi', capsule.id + ' için hikâye ve paylaşım tercihleri müşteri tarafından güncellendi.');
    C.commit('Anınız ve paylaşım tercihleriniz kaydedildi.');
  };

  C.forms['customer-care'] = function (form, event) {
    event.preventDefault();
    clearError(form);
    var capsule = ownCapsule(form.dataset.id);
    if (!capsule) { formError(form, 'Bu kapsül için not eklenemiyor.'); return; }
    var data = new FormData(form);
    var note = String(data.get('note') || '').trim();
    var date = String(data.get('date') || '');
    if (!note) { formError(form, 'Kaydetmeden önce bir not yazın.', form.elements.namedItem('note')); return; }
    if (!date || date > today()) { formError(form, 'Not tarihi bugün veya geçmiş bir gün olmalı.', form.elements.namedItem('date')); return; }
    if (!Array.isArray(capsule.care)) { capsule.care = []; }
    capsule.care.push({ id: makeId('CARE'), date: date, type: String(data.get('type') || 'Gözlem'), note: note, by: current().name, image: '' });
    C.audit('Bakım notu eklendi', capsule.id + ' için müşteri bir günlük notu ekledi.');
    C.commit('Notunuz fidanın günlüğüne eklendi.');
  };

  C.forms['customer-profile'] = function (form, event) {
    event.preventDefault();
    clearError(form);
    var user = C.customer(current().id);
    var data = new FormData(form);
    var name = String(data.get('name') || '').trim();
    if (!name) { formError(form, 'Adınızı ve soyadınızı yazın.', form.elements.namedItem('name')); return; }
    user.name = name;
    user.email = String(data.get('email') || '').trim();
    user.phone = String(data.get('phone') || '').trim();
    user.address = String(data.get('address') || '').trim();
    user.initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) { return part[0]; }).join('').toLocaleUpperCase('tr-TR');
    C.audit('Müşteri bilgileri güncellendi', 'Örnek müşteri hesabının iletişim bilgileri güncellendi.');
    C.commit('Bilgileriniz kaydedildi.');
  };

  C.actions['customer-share'] = async function (element) {
    var capsule = C.capsule(element.dataset.id);
    if (!capsule || !(capsule.memorial && capsule.memorial.isPublic)) { C.toast('Bu anı sayfası şu anda paylaşıma kapalı.', 'warning'); return; }
    var url = new URL(window.location.href);
    url.hash = '#' + memorialPath(capsule);
    var link = url.toString();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(link); }
      else {
        var input = document.createElement('textarea');
        input.value = link;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        var copied;
        try { copied = document.execCommand('copy'); }
        finally { input.remove(); }
        if (!copied) { throw new Error('Clipboard unavailable'); }
        element.focus();
      }
      C.toast('Anı bağlantısı kopyalandı.');
    } catch (error) {
      C.openModal({ title: 'Anı bağlantısı', body: '<p>Tarayıcınız panoya otomatik kopyalamaya izin vermedi. Bağlantıyı seçerek kopyalayabilirsiniz.</p><div class="field"><label class="field-label" for="cu-share-link">Anı sayfasının adresi</label><input class="input" id="cu-share-link" value="' + E(link) + '" readonly></div><div class="cu-form-actions"><button class="btn btn-primary" data-action="customer-select-link">Bağlantıyı seç</button><button class="btn btn-secondary" data-action="close-modal">Kapat</button></div>' });
    }
  };

  C.actions['customer-select-link'] = function () {
    var input = document.getElementById('cu-share-link');
    if (input) { input.focus(); input.select(); }
  };
})();
