(() => {
  'use strict';

  const C = window.CC;
  const e = value => C.esc(value == null ? '' : String(value));
  const i = (name, size = 18) => C.icon(name, size);
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const roles = { admin: 'Yönetici', operations: 'Operasyon', field: 'Saha ekibi' };
  const capsuleStates = ['preparing', 'shipped', 'awaiting_planting', 'reported', 'planted'];
  const paymentStates = ['paid', 'pending', 'failed', 'refunded'];
  const deliveryStates = ['preparing', 'shipped', 'delivered'];
  const taskStates = ['open', 'in_progress', 'done'];
  const taskTypes = { planting: 'Dikim', care: 'Bakım', check: 'Kontrol', contact: 'Müşteri iletişimi' };
  const ui = { queries: {}, productFilter: 'all', paymentFilter: 'all', deliveryFilter: 'all', capsuleFilter: 'all', capsuleStaff: 'all', mapFilter: 'all', mapDistrict: 'all', mapSelected: null, taskStaff: 'all', taskPriority: 'all', memorialFilter: 'all', overviewPeriod: 'all', incoming: '' };
  const staff = () => C.currentStaff() || { id: 'staff-1', name: 'Ekip', initials: 'CC', role: 'admin' };
  const role = () => C.db.settings.staffRole || staff().role || 'admin';
  const member = id => C.db.team.find(person => person.id === id);
  const customerName = id => (C.customer(id) || {}).name || 'Müşteri kaydı yok';
  const orderContact = order => { const owner = C.customer(order.customerId) || {}; const contact = order.contact || {}; return { name: contact.name || owner.name || 'Müşteri kaydı yok', email: contact.email || owner.email || '', phone: contact.phone || owner.phone || '', city: contact.city || '' }; };
  const memberName = id => (member(id) || {}).name || 'Atanmadı';
  const label = value => C.status(value).label;
  const typeLabel = value => taskTypes[value] || value || 'Genel';
  const activeTeam = () => C.db.team.filter(person => person.active !== false);
  const can = (permission, record) => {
    if (role() === 'admin') return true;
    if (permission === 'catalog' || permission === 'team') return false;
    if (role() === 'operations') return true;
    if (permission === 'capsule') return !!record && record.staffId === staff().id;
    if (permission === 'task') return !!record && record.assignedTo === staff().id;
    return false;
  };
  const denied = () => C.toast('Bu işlem için yönetici veya ilgili ekip görünümüne geçin.', 'error');
  const matches = (section, ...values) => !ui.queries[section] || values.join(' ').toLocaleLowerCase('tr-TR').includes(ui.queries[section].toLocaleLowerCase('tr-TR'));
  const byDate = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));
  const option = (value, text, selected) => `<option value="${e(value)}"${String(value) === String(selected) ? ' selected' : ''}>${e(text)}</option>`;
  const statusOptions = (values, current, all) => (all ? option('all', all, current) : '') + values.map(value => option(value, label(value), current)).join('');
  const staffOptions = (current, all) => (all ? option('all', all, current) : option('', 'Henüz atanmadı', current)) + activeTeam().map(person => option(person.id, person.name, current)).join('');
  const avatar = (name, initials, small = false) => `<span class="avatar${small ? ' admin-avatar-small' : ''}" aria-label="${e(name)}">${e(initials || String(name || '').split(' ').map(part => part[0]).slice(0, 2).join(''))}</span>`;
  const pet = (capsule, small = false) => `<span class="admin-pet${small ? ' admin-pet-small' : ''}">${capsule.petImage ? `<img src="${e(capsule.petImage)}" alt="" loading="lazy">` : i('heart', small ? 18 : 24)}</span>`;
  const empty = (title, detail, action = '') => `<div class="empty-state admin-empty">${i('search', 30)}<h3>${e(title)}</h3><p>${e(detail)}</p>${action}</div>`;
  const button = (action, text, id = '', kind = 'secondary', icon = '') => `<button type="button" class="btn btn-${kind} btn-sm" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}>${icon ? i(icon) : ''}${e(text)}</button>`;
  const iconButton = (action, text, id, icon = 'arrow-up-right') => `<button type="button" class="icon-button" data-action="${action}" data-id="${e(id)}" aria-label="${e(text)}" title="${e(text)}">${i(icon)}</button>`;
  const footer = (text = 'Değişiklikleri kaydet') => `<div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Vazgeç</button><button type="submit" class="btn btn-primary">${i('check')}${e(text)}</button></div>`;
  const field = (title, id, content, hint = '') => `<div class="field"><label class="field-label" for="${id}">${e(title)}</label>${content}${hint ? `<small class="admin-field-hint">${e(hint)}</small>` : ''}</div>`;
  const search = (section, placeholder) => `<label class="admin-search"><span class="visually-hidden">${e(placeholder)}</span>${i('search')}<input type="search" placeholder="${e(placeholder)}" value="${e(ui.queries[section] || '')}" data-input="admin-search" data-section="${section}" data-focus-key="admin-${section}-search" autocomplete="off"></label>`;
  const filter = (name, text, content) => `<label class="admin-filter"><span class="visually-hidden">${e(text)}</span><select class="select" data-change="admin-filter" data-filter="${name}" aria-label="${e(text)}">${content}</select></label>`;
  const heading = (title, description, action = '') => `<div class="admin-page-heading"><div><h1>${e(title)}</h1><p>${e(description)}</p></div>${action ? `<div class="admin-heading-actions">${action}</div>` : ''}</div>`;
  const panelHead = (title, description = '', action = '') => `<div class="admin-panel-heading"><div><h2>${e(title)}</h2>${description ? `<p>${e(description)}</p>` : ''}</div>${action}</div>`;
  const due = value => {
    const delta = Math.round((new Date(`${value}T12:00:00`) - new Date(`${today()}T12:00:00`)) / 86400000);
    if (!Number.isFinite(delta)) return { text: 'Tarih belirtilmedi', late: false };
    return { text: delta < 0 ? `${Math.abs(delta)} gün gecikti` : delta === 0 ? 'Bugün' : delta === 1 ? 'Yarın' : C.date(value), late: delta < 0 };
  };
  const filteredOrders = () => C.db.orders.filter(order => matches('orders', order.id, customerName(order.customerId), orderContact(order).name, orderContact(order).email, ...order.items.map(item => item.name)) && (ui.paymentFilter === 'all' || order.payment === ui.paymentFilter) && (ui.deliveryFilter === 'all' || order.fulfillment === ui.deliveryFilter)).slice().sort(byDate);
  const filteredCapsules = () => C.db.capsules.filter(capsule => matches('capsules', capsule.id, capsule.petName, customerName(capsule.customerId), capsule.planting && capsule.planting.district) && (ui.capsuleFilter === 'all' || capsule.status === ui.capsuleFilter) && (ui.capsuleStaff === 'all' || capsule.staffId === ui.capsuleStaff));
  const filteredMapCapsules = () => C.db.capsules.filter(capsule => capsule.planting && ['reported', 'planted'].includes(capsule.status) && matches('map', capsule.id, capsule.petName, customerName(capsule.customerId), capsule.planting.district, capsule.planting.label) && (ui.mapFilter === 'all' || capsule.status === ui.mapFilter) && (ui.mapDistrict === 'all' || capsule.planting.district === ui.mapDistrict));

  function shell(section, html) {
    const links = [
      ['overview', '/yonetim', 'Genel bakış', 'grid'], ['orders', '/yonetim/siparisler', 'Siparişler', 'shopping-bag'],
      ['capsules', '/yonetim/kapsuller', 'Kapsüller', 'box'], ['map', '/yonetim/harita', 'Dikim haritası', 'map'],
      ['tasks', '/yonetim/gorevler', 'Görevler', 'clipboard'], ['memorials', '/yonetim/anilar', 'Anı sayfaları', 'heart'],
      ['products', '/yonetim/urunler', 'Ürün ve fiyatlar', 'gift'], ['team', '/yonetim/ekip', 'Ekip ve roller', 'users']
    ];
    const pending = C.db.capsules.filter(capsule => capsule.status === 'reported').length;
    const linkHtml = list => list.map(([key, href, text, symbol]) => `<a href="#${href}" class="admin-nav-link${section === key ? ' is-active' : ''}"${section === key ? ' aria-current="page"' : ''}>${i(symbol, 19)}<span>${text}</span>${key === 'capsules' && pending ? `<span class="admin-nav-count" aria-label="${pending} doğrulama bekliyor">${pending}</span>` : ''}</a>`).join('');
    const selectedLink = links.find(link => link[0] === section);
    return `<div class="admin-shell" data-admin-shell>
      <div class="admin-mobile-shade" data-action="admin-menu-close" aria-hidden="true"></div>
      <aside class="admin-sidebar" id="admin-sidebar" aria-label="Yönetim menüsü">
        <a class="admin-brand" href="#/yonetim" aria-label="Candan Cana yönetim ana sayfası"><img class="admin-brand-symbol" src="assets/brand-mark-20261015.png" alt="" width="44" height="54"><span>Candan Cana<small>Yönetim paneli</small></span></a>
        <button type="button" class="icon-button admin-sidebar-close" data-action="admin-menu-close" aria-label="Menüyü kapat">${i('close')}</button>
        <nav class="admin-nav"><p>Operasyon</p>${linkHtml(links.slice(0, 6))}<p class="admin-nav-second">Yönetim</p>${linkHtml(links.slice(6))}</nav>
        <div class="admin-sidebar-bottom"><a class="admin-site-link" href="#/">${i('arrow-up-right')}Siteyi görüntüle</a><label class="admin-role-label" for="admin-role-preview">Görünüm önizlemesi</label><select id="admin-role-preview" class="select" data-change="admin-role">${Object.entries(roles).map(([value, text]) => option(value, text, role())).join('')}</select><div class="admin-person">${avatar(staff().name, staff().initials)}<span><strong>${e(staff().name)}</strong><small>${e(roles[role()] || 'Ekip üyesi')}</small></span></div></div>
      </aside>
      <div class="admin-workspace"><header class="admin-topbar"><div class="admin-breadcrumb"><button type="button" class="icon-button admin-menu-button" data-action="admin-menu" aria-expanded="false" aria-controls="admin-sidebar" aria-label="Yönetim menüsünü aç">${i('menu')}</button><span class="admin-breadcrumb-home">Yönetim</span><span class="admin-breadcrumb-chevron">${i('chevron-right', 15)}</span><strong>${selectedLink ? selectedLink[2] : 'Sayfa bulunamadı'}</strong></div><div class="admin-topbar-actions"><span class="admin-top-date">${i('calendar', 16)}${e(C.date(today()))}</span><button type="button" class="icon-button admin-notifications" data-action="admin-notifications" aria-label="Görev ve mesaj bildirimlerini aç">${i('bell', 20)}${C.db.tasks.some(task => task.status !== 'done') || C.db.messages.length ? '<span></span>' : ''}</button><a href="#/yonetim/ekip" class="admin-profile-link" aria-label="Ekip ve roller">${avatar(staff().name, staff().initials, true)}</a></div></header>
      <main class="admin-content" id="main-content" tabindex="-1">${role() !== 'admin' ? `<div class="admin-preview-banner">${i('shield')}<p><strong>${e(roles[role()])} görünümü.</strong> Ekran işlemleri bu role göre gösteriliyor; gerçek giriş sistemi yok.</p><button type="button" class="text-link" data-action="admin-reset-role">Yöneticiye dön</button></div>` : ''}${html}</main><footer class="admin-footer"><span>Candan Cana · Her hatıraya özenle.</span><span>Örnek operasyon verileri</span></footer></div>
    </div>`;
  }

  function orderRows(orders, compact = false) {
    return orders.map(order => `<tr><td><button type="button" class="admin-record-link" data-action="admin-order-open" data-id="${e(order.id)}">${e(order.id)}</button><small class="admin-cell-secondary">${e(C.date(order.date))}</small></td><td><strong class="admin-cell-primary">${e(orderContact(order).name)}</strong><small class="admin-cell-secondary">${order.items.reduce((sum, item) => sum + item.quantity, 0)} ürün</small></td>${compact ? '' : `<td>${order.items.map(item => `<span class="admin-cell-primary">${e(item.name)}${item.quantity > 1 ? ` × ${item.quantity}` : ''}</span>`).join('')}</td>`}<td class="admin-number">${e(C.money(order.total))}</td><td>${C.badge(order.payment)}</td>${compact ? '' : `<td>${C.badge(order.fulfillment)}</td>`}<td>${iconButton('admin-order-open', `${order.id} siparişini görüntüle`, order.id, 'chevron-right')}</td></tr>`).join('');
  }

  function overviewView() {
    const allOrders = C.db.orders.slice().sort(byDate);
    const orders = ui.overviewPeriod === 'month' ? allOrders.filter(order => String(order.date).startsWith(today().slice(0, 7))) : allOrders;
    const paidTotal = orders.filter(order => order.payment === 'paid').reduce((sum, order) => sum + order.total, 0);
    const planted = C.db.capsules.filter(capsule => capsule.status === 'planted').length;
    const openTasks = C.db.tasks.filter(task => task.status !== 'done').slice().sort((a, b) => String(a.due).localeCompare(String(b.due)));
    const reported = C.db.capsules.filter(capsule => capsule.status === 'reported');
    const recent = orders.slice(0, 5);
    const stats = [
      ['Sipariş tutarı', C.money(paidTotal), `${orders.filter(order => order.payment === 'paid').length} ödenmiş sipariş`, 'credit-card', '/yonetim/siparisler'],
      ['Yaşayan hatıra', String(planted), 'Dikimi tamamlanan kapsül', 'sprout', '/yonetim/harita'],
      ['Süreçteki kapsül', String(C.db.capsules.length - planted), 'Hazırlıktan dikime', 'box', '/yonetim/kapsuller'],
      ['Açık görev', String(openTasks.length), `${openTasks.filter(task => task.assignedTo === staff().id).length} görev size atanmış`, 'clipboard', '/yonetim/gorevler']
    ];
    const html = heading(`Merhaba, ${staff().name.split(' ')[0]}.`, 'Her hatıranın yolculuğunu aynı özenle takip edin.', filter('overviewPeriod', 'Sipariş dönemi', option('all', 'Tüm kayıtlar', ui.overviewPeriod) + option('month', 'Bu ay', ui.overviewPeriod))) +
      `<div class="admin-stat-strip">${stats.map(([title, value, note, symbol, href]) => `<a class="admin-stat" href="#${href}"><span class="admin-stat-title">${title}${i(symbol, 18)}</span><strong>${e(value)}</strong><small>${e(note)}</small></a>`).join('')}</div>
      ${reported.length ? `<div class="admin-focus-strip"><div class="admin-focus-icon">${i('map-pin', 25)}</div><div><h2>${reported.length} dikim bildirimi incelemenizi bekliyor</h2><p>Ailelerin paylaştığı konumları doğrulayarak hatıralarını haritaya ekleyin.</p></div><a class="btn btn-primary btn-sm" href="#/yonetim/kapsuller?status=reported">Bildirimleri incele${i('arrow-right')}</a></div>` : `<div class="admin-focus-strip admin-focus-clear"><div class="admin-focus-icon">${i('check-circle', 25)}</div><div><h2>Dikim bildirimleri güncel</h2><p>Yeni bir bildirim geldiğinde burada görünür.</p></div><a class="btn btn-secondary btn-sm" href="#/yonetim/harita">Haritayı aç${i('arrow-right')}</a></div>`}
      <div class="admin-overview-grid"><section class="admin-panel admin-overview-orders">${panelHead('Son siparişler', 'Satın alma ve ödeme durumları', '<a class="text-link" href="#/yonetim/siparisler">Tüm siparişler'+i('arrow-right', 16)+'</a>')}${recent.length ? `<div class="table-wrap"><table class="data-table admin-table"><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Ödeme</th><th><span class="visually-hidden">İşlem</span></th></tr></thead><tbody>${orderRows(recent, true)}</tbody></table></div>` : empty('Bu dönemde sipariş yok', 'Başka bir dönem seçebilir veya mağazadan örnek sipariş oluşturabilirsiniz.')}</section>
      <section class="admin-panel admin-overview-map">${panelHead('Hatıralar büyüyor', `${C.markers(C.db.capsules).length} konum kayıtlı`, '<a class="text-link" href="#/yonetim/harita">Haritayı aç'+i('arrow-up-right', 16)+'</a>')}<div class="admin-mini-map">${C.map(C.markers(C.db.capsules), { id: 'admin-overview-map', height: 306 })}</div></section>
      <section class="admin-panel">${panelHead('Öncelikli görevler', 'Tamamlanma tarihine göre', can('task-create') ? button('admin-task-new', 'Yeni görev', '', 'ghost', 'plus') : '')}<div class="admin-compact-tasks">${openTasks.length ? openTasks.slice(0, 4).map(task => { const deadline = due(task.due); return `<div class="admin-compact-task"><button type="button" class="admin-check-button" data-action="admin-task-complete" data-id="${e(task.id)}" aria-label="${e(task.title)} görevini tamamla"${can('task', task) ? '' : ' disabled'}>${i('check', 17)}</button><div><button type="button" class="admin-record-link" data-action="admin-task-open" data-id="${e(task.id)}">${e(task.title)}</button><small>${e(memberName(task.assignedTo))} · ${e(typeLabel(task.type))}</small></div><span class="admin-due${deadline.late ? ' is-late' : ''}">${e(deadline.text)}</span></div>`; }).join('') : empty('Görevler tamamlandı', 'Yeni bir bakım veya dikim görevi planlayabilirsiniz.')}<a class="admin-panel-bottom-link" href="#/yonetim/gorevler">Tüm görevleri gör${i('arrow-right', 16)}</a></div></section>
      <section class="admin-panel">${panelHead('Son hareketler', 'Ekibin yaptığı güncellemeler')}<div class="admin-activity">${C.db.audits.length ? C.db.audits.slice().sort(byDate).slice(0, 4).map(item => `<div class="admin-activity-row"><span class="admin-activity-dot"></span><div><strong>${e(item.action)}</strong><p>${e(item.detail)}</p><small>${e(item.actor)} · ${e(C.date(item.date))}</small></div></div>`).join('') : `<p class="admin-quiet-message">Fiyat, görev ve kapsül değişiklikleri burada görünür. İlk güncellemeyle başlayabilirsiniz.</p>`}</div></section></div>`;
    return { title: 'Genel bakış', html, bind() { C.mountMap('admin-overview-map', { onSelect: id => C.go(`/yonetim/harita?capsule=${encodeURIComponent(id)}`) }); } };
  }

  function productsView() {
    const products = C.db.products.filter(product => matches('products', product.name, product.subtitle) && (ui.productFilter === 'all' || (ui.productFilter === 'active' ? product.active !== false : product.active === false)));
    const html = heading('Ürün ve fiyatlar', 'Kapsül paketlerini, satış fiyatlarını ve stok durumunu yönetin.', '<a class="btn btn-secondary" href="#/kapsuller">Mağazayı görüntüle'+i('arrow-up-right')+'</a>') +
      `<section class="admin-panel"><div class="admin-toolbar">${search('products', 'Ürün adıyla ara')}${filter('productFilter', 'Ürün görünürlüğü', option('all', 'Tüm ürünler', ui.productFilter) + option('active', 'Yayında', ui.productFilter) + option('inactive', 'Taslak', ui.productFilter))}<span class="admin-result-count">${products.length} ürün</span></div>${products.length ? `<div class="table-wrap"><table class="data-table admin-table admin-product-table"><thead><tr><th>Ürün</th><th>Satış fiyatı</th><th>Stok</th><th>Görünürlük</th><th><span class="visually-hidden">Düzenle</span></th></tr></thead><tbody>${products.map(product => `<tr><td><div class="admin-product-cell"><img src="${e(product.image)}" alt="" loading="lazy"><div><strong>${e(product.name)}</strong><small>${e(product.subtitle)}</small></div></div></td><td><strong class="admin-price">${e(C.money(product.price))}</strong><small class="admin-cell-secondary">Birim fiyat</small></td><td><strong class="admin-stock${product.stock <= 3 ? ' is-low' : ''}">${product.stock} adet</strong><small class="admin-cell-secondary">${product.stock === 0 ? 'Stok tükendi' : product.stock <= 3 ? 'Stok azalıyor' : 'Satışa hazır'}</small></td><td><button type="button" class="admin-status-toggle" data-action="admin-product-toggle" data-id="${e(product.id)}" aria-label="${e(product.name)} görünürlüğünü değiştir" aria-pressed="${product.active !== false}"${can('catalog') ? '' : ' disabled'}><span class="admin-switch${product.active !== false ? ' is-on' : ''}" aria-hidden="true"></span>${product.active !== false ? 'Yayında' : 'Taslak'}</button></td><td>${can('catalog') ? button('admin-product-open', 'Düzenle', product.id, 'secondary', 'edit') : '<span class="admin-readonly">Salt okunur</span>'}</td></tr>`).join('')}</tbody></table></div>` : empty('Eşleşen ürün bulunamadı', 'Ürün adını veya görünürlük filtresini değiştirebilirsiniz.')}</section><p class="admin-footnote">${i('shield', 16)}Fiyat güncellemeleri yeni satın almalara uygulanır. Geçmiş siparişlerin kayıtlı tutarları korunur.</p>`;
    return { title: 'Ürün ve fiyatlar', html };
  }

  function ordersView() {
    const orders = filteredOrders();
    return { title: 'Siparişler', html: heading('Siparişler', 'Satın almaları, ödemeleri ve teslimat adımlarını takip edin.', button('admin-export-orders', 'Listeyi indir', '', 'secondary', 'download')) + `<section class="admin-panel"><div class="admin-toolbar">${search('orders', 'Sipariş, müşteri veya ürün ara')}${filter('paymentFilter', 'Ödeme durumu', statusOptions(paymentStates, ui.paymentFilter, 'Tüm ödemeler'))}${filter('deliveryFilter', 'Teslimat durumu', statusOptions(deliveryStates, ui.deliveryFilter, 'Tüm teslimatlar'))}<span class="admin-result-count">${orders.length} sipariş</span></div>${orders.length ? `<div class="table-wrap"><table class="data-table admin-table"><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Ürün</th><th>Tutar</th><th>Ödeme</th><th>Teslimat</th><th><span class="visually-hidden">Ayrıntılar</span></th></tr></thead><tbody>${orderRows(orders)}</tbody></table></div>` : empty('Sipariş bulunamadı', 'Aramanızı veya durum filtrelerini değiştirin.')}</section>` };
  }

  function capsulesView() {
    const capsules = filteredCapsules();
    return { title: 'Kapsüller', html: heading('Kapsüller', 'Her kapsülün ailesini, sorumlusunu ve dikim yolculuğunu görün.', '<a class="btn btn-secondary" href="#/yonetim/harita">'+i('map')+'Haritada görüntüle</a>') + `<section class="admin-panel"><div class="admin-toolbar">${search('capsules', 'Kapsül, dost veya aile ara')}${filter('capsuleFilter', 'Kapsül durumu', statusOptions(capsuleStates, ui.capsuleFilter, 'Tüm aşamalar'))}${filter('capsuleStaff', 'Kapsül sorumlusu', staffOptions(ui.capsuleStaff, 'Tüm sorumlular'))}<span class="admin-result-count">${capsules.length} kapsül</span></div>${capsules.length ? `<div class="table-wrap"><table class="data-table admin-table"><thead><tr><th>Kapsül / dost</th><th>Ailesi</th><th>Aşama</th><th>Dikim yeri</th><th>Sorumlu</th><th><span class="visually-hidden">Ayrıntılar</span></th></tr></thead><tbody>${capsules.map(capsule => `<tr><td><div class="admin-pet-cell">${pet(capsule, true)}<div><button type="button" class="admin-record-link" data-action="admin-capsule-open" data-id="${e(capsule.id)}">${e(capsule.petName || 'İsim bekleniyor')}</button><small>${e(capsule.id)}</small></div></div></td><td>${e(customerName(capsule.customerId))}<small class="admin-cell-secondary">${e(capsule.orderId)}</small></td><td>${C.badge(capsule.status)}</td><td>${capsule.planting ? `<span class="admin-location-cell">${i('map-pin', 15)}${e(capsule.planting.district)}</span><small class="admin-cell-secondary">${capsule.planting.verified ? 'Konum doğrulandı' : 'Doğrulama bekliyor'}</small>` : '<span class="muted">Konum bekleniyor</span>'}</td><td><span class="admin-assignee">${avatar(memberName(capsule.staffId), (member(capsule.staffId) || {}).initials, true)}${e(memberName(capsule.staffId))}</span></td><td>${iconButton('admin-capsule-open', `${capsule.id} kapsül ayrıntıları`, capsule.id, 'chevron-right')}</td></tr>`).join('')}</tbody></table></div>` : empty('Bu filtrelerle kapsül bulunamadı', 'Başka bir aşama veya sorumlu seçebilirsiniz.')}</section>` };
  }

  function mapDetail(capsule) {
    if (!capsule) return `<div class="admin-map-no-selection">${i('map-pin', 28)}<h3>Bir hatıra seçin</h3><p>Haritadaki işarete veya listedeki kapsüle dokunarak ayrıntılarını görün.</p></div>`;
    const planting = capsule.planting;
    return `<div class="admin-map-detail-head">${pet(capsule)}<div><h3>${e(capsule.petName)}</h3><p>${e(capsule.id)} · ${e(customerName(capsule.customerId))}</p></div>${C.badge(capsule.status)}</div><dl class="admin-detail-grid"><div><dt>Dikim alanı</dt><dd>${e(planting.label || planting.district)}</dd></div><div><dt>Dikim tarihi</dt><dd>${e(C.date(planting.date))}</dd></div><div><dt>Sorumlu</dt><dd>${e(memberName(capsule.staffId))}</dd></div><div><dt>Konum bilgisi</dt><dd>${planting.verified ? 'Ekip tarafından doğrulandı' : 'Aile bildirimi · inceleme bekliyor'}</dd></div></dl><div class="admin-map-detail-actions">${button('admin-capsule-open', 'Kapsül ayrıntıları', capsule.id, 'primary', 'arrow-up-right')}${can('capsule', capsule) && capsule.status === 'reported' ? button('admin-planting-confirm', 'Dikimi doğrula', capsule.id, 'secondary', 'check-circle') : can('capsule', capsule) ? button('admin-care-new', 'Bakım kaydı ekle', capsule.id, 'secondary', 'plus') : ''}</div>`;
  }

  function selectMapCapsule(id) {
    const capsule = filteredMapCapsules().find(item => item.id === id);
    if (!capsule) return;
    ui.mapSelected = id;
    if (C.selectMapMarker) C.selectMapMarker('admin-main-map', id);
    document.querySelectorAll('[data-admin-map-card]').forEach(element => {
      const selected = element.dataset.id === id;
      element.classList.toggle('is-selected', selected);
      element.setAttribute('aria-pressed', String(selected));
    });
    const detail = document.getElementById('admin-map-detail');
    if (detail) detail.innerHTML = mapDetail(capsule);
  }

  function mapView() {
    const capsules = filteredMapCapsules();
    const districts = [...new Set(C.db.capsules.filter(capsule => capsule.planting).map(capsule => capsule.planting.district))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr'));
    if (!capsules.some(capsule => capsule.id === ui.mapSelected)) ui.mapSelected = capsules.length ? capsules[0].id : null;
    const selected = capsules.find(capsule => capsule.id === ui.mapSelected);
    const html = heading('Dikim haritası', 'Hatıraların konumlarını ve bakım süreçlerini bir arada izleyin.', '<a class="btn btn-secondary" href="#/yonetim/kapsuller">'+i('box')+'Kapsül listesi</a>') + `<section class="admin-panel admin-map-panel"><div class="admin-toolbar">${search('map', 'Dost, aile veya konum ara')}${filter('mapFilter', 'Harita aşaması', statusOptions(['planted', 'reported'], ui.mapFilter, 'Tüm konumlar'))}${filter('mapDistrict', 'İlçe', option('all', 'Tüm ilçeler', ui.mapDistrict) + districts.map(district => option(district, district, ui.mapDistrict)).join(''))}<span class="admin-result-count">${capsules.length} konum</span></div><div class="admin-map-layout"><div class="admin-map-canvas">${C.map(C.markers(capsules), { id: 'admin-main-map', selected: ui.mapSelected, height: 544 })}</div><aside class="admin-map-list" aria-label="Haritadaki kapsüller"><div class="admin-map-list-heading"><h2>Kayıtlı hatıralar</h2><span>${capsules.length}</span></div><div class="admin-map-list-scroll">${capsules.length ? capsules.map(capsule => `<button type="button" class="admin-map-record${capsule.id === ui.mapSelected ? ' is-selected' : ''}" data-action="admin-map-select" data-admin-map-card data-id="${e(capsule.id)}" aria-pressed="${capsule.id === ui.mapSelected}">${pet(capsule, true)}<span><strong>${e(capsule.petName)}</strong><small>${e(capsule.planting.district)} · ${e(capsule.id)}</small><span class="admin-map-record-status">${capsule.status === 'reported' ? 'Doğrulama bekliyor' : 'Dikildi'}</span></span>${i('chevron-right', 16)}</button>`).join('') : empty('Konum bulunamadı', 'Filtreleri değiştirerek diğer kayıtları görebilirsiniz.')}</div></aside></div><section id="admin-map-detail" class="admin-map-detail" aria-label="Seçili kapsül ayrıntısı" aria-live="polite">${mapDetail(selected)}</section></section>`;
    return { title: 'Dikim haritası', html, bind() { C.mountMap('admin-main-map', { onSelect: selectMapCapsule }); } };
  }

  function taskCard(task) {
    const capsule = C.capsule(task.capsuleId);
    const deadline = due(task.due);
    return `<article class="admin-task-card"><div class="admin-task-top"><span class="admin-task-type">${e(typeLabel(task.type))}</span>${task.priority === 'high' ? '<span class="admin-priority">Öncelikli</span>' : ''}${iconButton('admin-task-open', `${task.title} görev ayrıntıları`, task.id, 'more')}</div><h3><button type="button" data-action="admin-task-open" data-id="${e(task.id)}">${e(task.title)}</button></h3>${capsule ? `<button type="button" class="admin-task-capsule" data-action="admin-capsule-open" data-id="${e(capsule.id)}">${i('heart', 14)}${e(capsule.petName)}<span>${e(capsule.id)}</span></button>` : '<p class="admin-task-general">Genel ekip görevi</p>'}${task.note ? `<p class="admin-task-note">${e(task.note)}</p>` : ''}<div class="admin-task-meta"><span class="admin-due${deadline.late && task.status !== 'done' ? ' is-late' : ''}">${i('calendar', 14)}${e(task.status === 'done' ? C.date(task.due) : deadline.text)}</span>${avatar(memberName(task.assignedTo), (member(task.assignedTo) || {}).initials, true)}</div>${can('task', task) ? `<div class="admin-task-actions">${task.status === 'open' ? button('admin-task-start', 'Görevi başlat', task.id, 'secondary', 'arrow-right') : task.status === 'in_progress' ? button('admin-task-complete', 'Tamamla', task.id, 'primary', 'check') : button('admin-task-reopen', 'Yeniden aç', task.id, 'ghost', 'refresh')}</div>` : ''}</article>`;
  }

  function tasksView() {
    const tasks = C.db.tasks.filter(task => matches('tasks', task.title, task.note, (C.capsule(task.capsuleId) || {}).petName, memberName(task.assignedTo)) && (ui.taskStaff === 'all' || task.assignedTo === ui.taskStaff) && (ui.taskPriority === 'all' || task.priority === ui.taskPriority));
    return { title: 'Görevler', html: heading('Görevler', 'Dikim, bakım ve aile iletişimi için ekibin çalışma alanı.', can('task-create') ? button('admin-task-new', 'Yeni görev', '', 'primary', 'plus') : '') + `<div class="admin-toolbar admin-toolbar-standalone">${search('tasks', 'Görev veya dost adı ara')}${filter('taskStaff', 'Görev sorumlusu', staffOptions(ui.taskStaff, 'Tüm ekip'))}${filter('taskPriority', 'Görev önceliği', option('all', 'Tüm öncelikler', ui.taskPriority) + option('high', 'Öncelikli', ui.taskPriority) + option('normal', 'Normal', ui.taskPriority))}</div><div class="admin-task-board">${taskStates.map(status => { const subset = tasks.filter(task => task.status === status).sort((a, b) => String(a.due).localeCompare(String(b.due))); return `<section class="admin-task-column"><div class="admin-task-column-heading"><h2><span class="admin-task-dot admin-task-dot-${status}"></span>${e(label(status))}</h2><span>${subset.length}</span></div><div class="admin-task-column-body">${subset.length ? subset.map(taskCard).join('') : `<div class="admin-task-column-empty">${i(status === 'done' ? 'check-circle' : 'clipboard', 24)}<p>${status === 'done' ? 'Tamamlanan görevler burada görünür.' : 'Bu aşamada görev bulunmuyor.'}</p></div>`}</div></section>`; }).join('')}</div>` };
  }

  function memorialsView() {
    const capsules = C.db.capsules.filter(capsule => matches('memorials', capsule.petName, capsule.id, customerName(capsule.customerId)) && (ui.memorialFilter === 'all' || (ui.memorialFilter === 'public' ? capsule.memorial.isPublic : !capsule.memorial.isPublic)));
    return { title: 'Anı sayfaları', html: heading('Anı sayfaları', 'Ailelerin hatıralarını ve paylaşım tercihlerini özenle yönetin.') + `<section class="admin-panel"><div class="admin-toolbar">${search('memorials', 'Dost veya aile adı ara')}${filter('memorialFilter', 'Anı sayfası görünürlüğü', option('all', 'Tüm anılar', ui.memorialFilter) + option('public', 'Paylaşıma açık', ui.memorialFilter) + option('private', 'Aileye özel', ui.memorialFilter))}<span class="admin-result-count">${capsules.length} anı sayfası</span></div>${capsules.length ? `<div class="table-wrap"><table class="data-table admin-table"><thead><tr><th>Evcil dost</th><th>Ailesi</th><th>Anı sayfası</th><th>Konum paylaşımı</th><th>İşlemler</th></tr></thead><tbody>${capsules.map(capsule => `<tr><td><div class="admin-pet-cell">${pet(capsule, true)}<div><strong>${e(capsule.petName || 'İsim bekleniyor')}</strong><small>${e(capsule.id)}</small></div></div></td><td>${e(customerName(capsule.customerId))}</td><td><span class="badge badge-${capsule.memorial.isPublic ? 'success' : 'muted'}">${i(capsule.memorial.isPublic ? 'external-link' : 'shield', 13)}${capsule.memorial.isPublic ? 'Paylaşıma açık' : 'Aileye özel'}</span></td><td>${capsule.memorial.showLocation ? 'Açık' : 'Gizli'}${!capsule.memorial.isPublic && capsule.memorial.showLocation ? '<small class="admin-cell-secondary">Sayfa paylaşılırsa görünür</small>' : ''}</td><td><div class="admin-row-actions">${button('admin-memorial-open', can('memorial') ? 'Düzenle' : 'Ayrıntılar', capsule.id, 'secondary', 'edit')}${iconButton('admin-memorial-link', 'Anı sayfası bağlantısını al', capsule.id, 'external-link')}</div></td></tr>`).join('')}</tbody></table></div>` : empty('Eşleşen anı sayfası yok', 'Aramayı veya paylaşım filtresini değiştirin.')}</section><div class="admin-note">${i('shield', 20)}<p><strong>Paylaşım, ailenin tercihidir.</strong> Anı sayfasının görünürlüğü ile dikim konumunun paylaşılması ayrı ayrı yönetilir.</p></div>` };
  }

  function teamView() {
    return { title: 'Ekip ve roller', html: heading('Ekip ve roller', 'Sorumlulukları paylaşın, her hatıranın doğru kişiye ulaşmasını sağlayın.', can('team') ? button('admin-team-new', 'Ekip üyesi ekle', '', 'primary', 'plus') : '') + `<section class="admin-panel">${panelHead('Çalışma ekibi', `${C.db.team.filter(person => person.active !== false).length} aktif ekip üyesi`)}<div class="table-wrap"><table class="data-table admin-table"><thead><tr><th>Ekip üyesi</th><th>Rol</th><th>Kapsüller</th><th>Açık görevler</th><th>Durum</th><th><span class="visually-hidden">İşlemler</span></th></tr></thead><tbody>${C.db.team.map(person => `<tr><td><div class="admin-assignee">${avatar(person.name, person.initials)}<div><strong>${e(person.name)}</strong><small class="admin-cell-secondary">${e(person.email)}</small></div></div></td><td>${e(roles[person.role] || person.role)}</td><td>${C.db.capsules.filter(capsule => capsule.staffId === person.id).length} kayıt</td><td>${C.db.tasks.filter(task => task.assignedTo === person.id && task.status !== 'done').length} görev</td><td><span class="badge badge-${person.active !== false ? 'success' : 'muted'}">${person.active !== false ? 'Aktif' : 'Pasif'}</span></td><td><div class="admin-row-actions">${can('team') ? iconButton('admin-team-open', `${person.name} kişisini düzenle`, person.id, 'edit') : ''}${person.active !== false ? button('admin-team-preview', 'Görünüm', person.id, 'ghost', 'user') : ''}</div></td></tr>`).join('')}</tbody></table></div></section><section class="admin-role-section"><div><h2>Üç rol, ortak bir özen</h2><p>Demo roller arasında geçiş yaparak ekibin kullanacağı ekranları inceleyin.</p></div><div class="admin-role-grid">${[['admin', 'shield', 'Yönetici', 'Ürün ve fiyatları, ekip üyelerini ve tüm operasyonu yönetir.'], ['operations', 'clipboard', 'Operasyon', 'Siparişleri, kapsül süreçlerini, anıları ve görev atamalarını yönetir.'], ['field', 'sprout', 'Saha ekibi', 'Kendisine atanan kapsüllerin dikim ve bakım kayıtlarını, kendi görevlerini günceller.']].map(([value, symbol, title, description]) => `<div class="admin-role-card${role() === value ? ' is-current' : ''}">${i(symbol, 23)}<h3>${title}</h3><p>${description}</p><button type="button" class="text-link" data-action="admin-preview-role" data-role="${value}"${role() === value ? ' disabled' : ''}>${role() === value ? 'Bu görünüm açık' : 'Görünümü dene'}${i('arrow-right', 15)}</button></div>`).join('')}</div><p class="admin-footnote">Bu alandaki rol değişimi yalnızca demo görünümünü değiştirir. Hesap açılmaz veya davet gönderilmez.</p></section>` };
  }

  C.adminView = route => {
    if (!(route.path === '/yonetim' || route.path.startsWith('/yonetim/'))) return null;
    const incoming = `${route.path}?${route.query.toString()}`;
    if (incoming !== ui.incoming) {
      ui.incoming = incoming;
      if (route.query.has('status') && capsuleStates.includes(route.query.get('status'))) ui.capsuleFilter = route.query.get('status');
      if (route.query.has('capsule')) ui.mapSelected = route.query.get('capsule');
    }
    const key = route.parts[1] || '';
    const views = { '': ['overview', overviewView], urunler: ['products', productsView], siparisler: ['orders', ordersView], kapsuller: ['capsules', capsulesView], harita: ['map', mapView], gorevler: ['tasks', tasksView], anilar: ['memorials', memorialsView], ekip: ['team', teamView] };
    const entry = views[key];
    if (!entry || route.parts.length > 2) return { title: 'Sayfa bulunamadı', html: shell('', empty('Bu yönetim sayfası bulunamadı', 'Çalışma alanına dönerek devam edebilirsiniz.', '<a class="btn btn-primary" href="#/yonetim">Genel bakışa dön</a>')) };
    const view = entry[1]();
    return { title: view.title, html: shell(entry[0], view.html), bind: view.bind };
  };

  function showModal(options) {
    C.closeModal();
    C.openModal(options);
  }

  function finish(action, detail, message) {
    C.audit(action, detail);
    C.closeModal();
    C.commit(message);
  }

  function invalid(form, name, message) {
    C.toast(message, 'error');
    const input = form.elements.namedItem(name);
    if (input && input.focus) {
      input.setCustomValidity(message);
      input.reportValidity();
      input.setCustomValidity('');
      input.focus();
    }
    return false;
  }

  function openProduct(id) {
    const product = C.product(id);
    if (!product) return C.toast('Ürün kaydı bulunamadı.', 'error');
    if (!can('catalog')) return denied();
    showModal({ title: `${product.name} · Ürün düzenle`, body: `<form class="admin-form" data-form="admin-product" data-id="${e(id)}"><div class="admin-editor-product"><img src="${e(product.image)}" alt=""><p>${e(product.description)}</p></div><div class="form-grid">${field('Ürün adı', 'admin-product-name', `<input class="input" id="admin-product-name" name="name" value="${e(product.name)}" required maxlength="80">`)}${field('Kısa açıklama', 'admin-product-subtitle', `<input class="input" id="admin-product-subtitle" name="subtitle" value="${e(product.subtitle)}" required maxlength="140">`)}${field('Birim satış fiyatı (₺)', 'admin-product-price', `<input class="input" id="admin-product-price" name="price" type="number" inputmode="decimal" min="0" max="10000000" step="0.01" value="${e(product.price)}" required>`)}${field('Stok adedi', 'admin-product-stock', `<input class="input" id="admin-product-stock" name="stock" type="number" inputmode="numeric" min="0" max="100000" step="1" value="${e(product.stock)}" required>`)}</div>${field('Ürün açıklaması', 'admin-product-description', `<textarea class="textarea" id="admin-product-description" name="description" rows="3" maxlength="2000" required>${e(product.description)}</textarea>`)}<label class="admin-checkbox"><input type="checkbox" name="active"${product.active !== false ? ' checked' : ''}><span>Ürünü mağazada göster</span></label><p class="admin-form-note">Kayıtlı siparişlerin tutarları bu düzenlemeden etkilenmez.</p>${footer('Ürünü kaydet')}</form>` });
  }

  function addressText(value) {
    if (!value) return 'Adres belirtilmedi';
    return typeof value === 'object' ? Object.values(value).filter(Boolean).join(', ') : value;
  }

  function openOrder(id) {
    const order = C.order(id);
    if (!order) return C.toast('Sipariş kaydı bulunamadı.', 'error');
    const customer = C.customer(order.customerId) || {};
    const contact = orderContact(order);
    const capsules = C.db.capsules.filter(capsule => capsule.orderId === id);
    const editable = can('order');
    showModal({ title: `Sipariş ${order.id}`, wide: true, body: `<div class="admin-order-summary"><span>${e(C.date(order.date))}</span><div>${C.badge(order.payment)}${C.badge(order.fulfillment)}</div></div><div class="admin-order-details-grid"><section><h3 class="admin-section-title">Müşteri ve teslimat</h3><div class="admin-address"><strong>${e(contact.name)}</strong><span>${e(contact.email)}</span><span>${e(contact.phone)}</span><p>${e(addressText(order.address || customer.address))}</p>${contact.city ? `<span>${e(contact.city)}</span>` : ''}</div>${order.note ? `<div class="admin-order-note"><strong>Sipariş notu</strong><p>${e(order.note)}</p></div>` : ''}</section><section><h3 class="admin-section-title">Satın alınanlar</h3><div class="admin-order-lines">${order.items.map(item => `<div><span><strong>${e(item.name)}</strong><small>${item.quantity} adet × ${e(C.money(item.unitPrice))}</small></span><strong>${e(C.money(item.quantity * item.unitPrice))}</strong></div>`).join('')}</div><div class="admin-order-total"><span>Sipariş toplamı</span><strong>${e(C.money(order.total))}</strong></div><p class="admin-field-hint">Satın alma anında kaydedilen fiyatlar.</p></section></div>${capsules.length ? `<section class="admin-linked-capsules"><h3 class="admin-section-title">Bu siparişteki kapsüller</h3>${capsules.map(capsule => `<button type="button" data-action="admin-capsule-open" data-id="${e(capsule.id)}">${pet(capsule, true)}<span><strong>${e(capsule.petName || 'İsim bekleniyor')}</strong><small>${e(capsule.id)}</small></span>${C.badge(capsule.status)}${i('chevron-right')}</button>`).join('')}</section>` : ''}<form class="admin-form admin-order-form" data-form="admin-order" data-id="${e(id)}"><h3 class="admin-section-title">Sipariş durumu</h3><div class="form-grid">${field('Ödeme durumu', 'admin-order-payment', `<select class="select" id="admin-order-payment" name="payment"${editable ? '' : ' disabled'}>${statusOptions(paymentStates, order.payment)}</select>`)}${field('Teslimat durumu', 'admin-order-delivery', `<select class="select" id="admin-order-delivery" name="fulfillment"${editable ? '' : ' disabled'}>${statusOptions(deliveryStates, order.fulfillment)}</select>`)}</div><p class="admin-form-note">Bu ekrandaki ödeme değişiklikleri yalnızca demo kaydını günceller. Dikim aşaması kapsül kaydından yönetilir.</p>${editable ? footer('Siparişi güncelle') : '<div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Kapat</button></div>'}</form>` });
  }

  function openCapsule(id) {
    const capsule = C.capsule(id);
    if (!capsule) return C.toast('Kapsül kaydı bulunamadı.', 'error');
    const editable = can('capsule', capsule);
    const assignment = can('assignment');
    const planting = capsule.planting || {};
    const disabled = editable ? '' : ' disabled';
    showModal({ title: `${capsule.petName || 'Evcil dost'} · ${capsule.id}`, wide: true, body: `<div class="admin-capsule-summary">${pet(capsule)}<div><h3>${e(capsule.petName || 'İsim bekleniyor')}</h3><p>${e(customerName(capsule.customerId))} · ${e(capsule.petType || 'Evcil dost')}</p><button type="button" class="text-link" data-action="admin-order-open" data-id="${e(capsule.orderId)}">${e(capsule.orderId)} siparişini aç${i('arrow-up-right', 15)}</button></div>${C.badge(capsule.status)}</div><form class="admin-form" id="admin-capsule-form" data-form="admin-capsule" data-id="${e(id)}"><div class="form-grid">${field('Evcil dostun adı', 'admin-capsule-name', `<input class="input" id="admin-capsule-name" name="petName" value="${e(capsule.petName)}" required maxlength="60"${disabled}>`)}${field('Evcil dostun türü', 'admin-capsule-type', `<input class="input" id="admin-capsule-type" name="petType" value="${e(capsule.petType)}" required maxlength="40"${disabled}>`)}${field('Kapsül aşaması', 'admin-capsule-status', `<select class="select" id="admin-capsule-status" name="status"${disabled}>${statusOptions(capsuleStates, capsule.status)}</select>`)}${field('Sorumlu ekip üyesi', 'admin-capsule-staff', `<select class="select" id="admin-capsule-staff" name="staffId"${assignment && editable ? '' : ' disabled'}>${staffOptions(capsule.staffId)}</select>`)}</div><div class="admin-form-section-heading"><h3>Konum ve dikim</h3><span>${planting.source === 'customer' ? 'Ailenin bildirdiği konum' : planting.source === 'team' ? 'Ekip kaydı' : 'Henüz bildirilmedi'}</span></div><div class="admin-capsule-map">${C.map(C.markers([capsule]), { id: 'admin-capsule-picker', selected: capsule.id, height: 250, picker: editable })}</div>${editable ? '<p class="admin-field-hint">Harita üzerinde bir nokta seçebilir veya koordinatları aşağıya yazabilirsiniz.</p>' : ''}<div class="form-grid admin-location-fields">${field('İlçe', 'admin-capsule-district', `<input class="input" id="admin-capsule-district" name="district" value="${e(planting.district)}" placeholder="Örn. Beykoz" maxlength="80"${disabled}>`)}${field('Alan / konum adı', 'admin-capsule-location', `<input class="input" id="admin-capsule-location" name="locationLabel" value="${e(planting.label)}" placeholder="Örn. Anı bahçesi, A bölümü" maxlength="140"${disabled}>`)}${field('Enlem', 'admin-capsule-lat', `<input class="input" id="admin-capsule-lat" name="lat" type="number" step="any" min="-90" max="90" value="${e(planting.lat)}" placeholder="41.12" data-input="admin-coordinate"${disabled}>`)}${field('Boylam', 'admin-capsule-lng', `<input class="input" id="admin-capsule-lng" name="lng" type="number" step="any" min="-180" max="180" value="${e(planting.lng)}" placeholder="29.10" data-input="admin-coordinate"${disabled}>`)}${field('Dikim tarihi', 'admin-capsule-date', `<input class="input" id="admin-capsule-date" name="plantingDate" type="date" value="${e(planting.date)}"${disabled}>`)}<div class="field admin-verified-field"><label class="admin-checkbox"><input type="checkbox" name="verified"${planting.verified ? ' checked' : ''}${disabled}><span>Konum ekip tarafından doğrulandı</span></label></div></div>${editable ? footer('Kapsülü güncelle') : '<div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Kapat</button></div>'}</form><section class="admin-care-history"><div class="admin-form-section-heading"><h3>Bakım günlüğü</h3>${editable ? button('admin-care-new', 'Bakım kaydı ekle', capsule.id, 'ghost', 'plus') : ''}</div>${capsule.care.length ? capsule.care.slice().sort(byDate).map(entry => `<div class="admin-care-entry"><span>${i('sprout', 18)}</span><div><strong>${e(typeLabel(entry.type))}</strong><p>${e(entry.note)}</p><small>${e(C.date(entry.date))} · ${e(entry.by)}</small></div></div>`).join('') : '<p class="admin-quiet-message">İlk bakım veya kontrol kaydı eklendiğinde burada görünür.</p>'}</section>` });
    const form = document.getElementById('admin-capsule-form');
    if (form) form.dataset.initial = new URLSearchParams(new FormData(form)).toString();
    C.mountMap('admin-capsule-picker', { onPick(point) { if (!editable || !form) return; form.elements.lat.value = Number(point.lat).toFixed(6); form.elements.lng.value = Number(point.lng).toFixed(6); } });
    if (planting.lat != null && planting.lng != null && C.setMapPickedPoint) C.setMapPickedPoint('admin-capsule-picker', planting);
  }

  function openCare(id) {
    const capsule = C.capsule(id);
    if (!capsule) return C.toast('Kapsül kaydı bulunamadı.', 'error');
    if (!can('capsule', capsule)) return denied();
    const previous = document.querySelector('dialog[open] #admin-capsule-form');
    if (previous && previous.dataset.initial !== new URLSearchParams(new FormData(previous)).toString()) return C.toast('Bakım kaydı eklemeden önce kapsül formundaki değişiklikleri kaydedin.', 'error');
    showModal({ title: `${capsule.petName} · Yeni bakım kaydı`, body: `<form class="admin-form" data-form="admin-care" data-id="${e(id)}"><p class="admin-form-intro">Yapılan işlemi aile ve ekip için bakım günlüğüne ekleyin.</p><div class="form-grid">${field('İşlem türü', 'admin-care-type', '<select class="select" id="admin-care-type" name="type"><option>Sulama</option><option>Sağlık kontrolü</option><option>Toprak bakımı</option><option>Dikim kontrolü</option><option>Genel not</option></select>')}${field('İşlem tarihi', 'admin-care-date', `<input class="input" id="admin-care-date" name="date" type="date" value="${today()}" required>`)}</div>${field('Bakım notu', 'admin-care-note', '<textarea class="textarea" id="admin-care-note" name="note" rows="4" maxlength="1500" required placeholder="Fidanın durumu ve yapılan işlem hakkında kısa bir not..."></textarea>')}<p class="admin-form-note">Kaydı ekleyen: ${e(staff().name)}</p>${footer('Bakım kaydını ekle')}</form>` });
  }

  function openTask(id) {
    const task = id ? C.db.tasks.find(item => item.id === id) : null;
    if (id && !task) return C.toast('Görev kaydı bulunamadı.', 'error');
    if (!task && !can('task-create')) return denied();
    const editable = task ? can('task', task) : true;
    const manager = can('task-create');
    const current = task || { title: '', type: 'care', capsuleId: '', assignedTo: staff().id, due: today(), status: 'open', priority: 'normal', note: '' };
    const managerDisabled = manager ? '' : ' disabled';
    const types = Object.entries(taskTypes).map(([value, text]) => option(value, text, current.type)).join('') + (taskTypes[current.type] ? '' : option(current.type, current.type, current.type));
    showModal({ title: task ? 'Görev ayrıntıları' : 'Yeni görev', body: `<form class="admin-form" data-form="admin-task"${id ? ` data-id="${e(id)}"` : ''}>${field('Görev başlığı', 'admin-task-title', `<input class="input" id="admin-task-title" name="title" value="${e(current.title)}" required maxlength="100" placeholder="Örn. Luna için aylık fidan kontrolü"${managerDisabled}>`)}<div class="form-grid">${field('Görev türü', 'admin-task-type', `<select class="select" id="admin-task-type" name="type"${managerDisabled}>${types}</select>`)}${field('İlgili kapsül', 'admin-task-capsule', `<select class="select" id="admin-task-capsule" name="capsuleId"${managerDisabled}>${option('', 'Genel ekip görevi', current.capsuleId)}${C.db.capsules.map(capsule => option(capsule.id, `${capsule.petName || 'İsim bekleniyor'} · ${capsule.id}`, current.capsuleId)).join('')}</select>`)}${field('Sorumlu', 'admin-task-assignee', `<select class="select" id="admin-task-assignee" name="assignedTo" required${managerDisabled}>${activeTeam().map(person => option(person.id, person.name, current.assignedTo)).join('')}</select>`)}${field('Tamamlanma tarihi', 'admin-task-due', `<input class="input" id="admin-task-due" name="due" type="date" value="${e(current.due)}" required${managerDisabled}>`)}${field('Öncelik', 'admin-task-priority', `<select class="select" id="admin-task-priority" name="priority"${managerDisabled}>${option('normal', 'Normal', current.priority)}${option('high', 'Öncelikli', current.priority)}</select>`)}${field('Görev aşaması', 'admin-task-status', `<select class="select" id="admin-task-status" name="status"${editable ? '' : ' disabled'}>${statusOptions(taskStates, current.status)}</select>`)}</div>${field('Ekip notu', 'admin-task-note', `<textarea class="textarea" id="admin-task-note" name="note" rows="3" maxlength="1500" placeholder="Ekibin bilmesi gereken ayrıntılar..."${editable ? '' : ' disabled'}>${e(current.note)}</textarea>`)}${editable ? footer(task ? 'Görevi güncelle' : 'Görevi oluştur') : '<div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Kapat</button></div>'}</form>` });
  }

  function openMemorial(id) {
    const capsule = C.capsule(id);
    if (!capsule) return C.toast('Anı sayfası kaydı bulunamadı.', 'error');
    const memorial = capsule.memorial;
    const editable = can('memorial');
    const disabled = editable ? '' : ' disabled';
    showModal({ title: `${capsule.petName} · Anı sayfası`, body: `<form class="admin-form" data-form="admin-memorial" data-id="${e(id)}"><div class="admin-capsule-summary">${pet(capsule)}<div><h3>${e(capsule.petName)}</h3><p>${e(customerName(capsule.customerId))}</p></div></div>${field('Hikâyesi', 'admin-memorial-story', `<textarea class="textarea" id="admin-memorial-story" name="story" rows="6" maxlength="5000"${disabled}>${e(memorial.story)}</textarea>`)}<div class="form-grid">${field('Doğum tarihi', 'admin-memorial-birth', `<input class="input" id="admin-memorial-birth" name="birthDate" type="date" value="${e(memorial.birthDate)}"${disabled}>`)}${field('Veda tarihi', 'admin-memorial-loss', `<input class="input" id="admin-memorial-loss" name="lossDate" type="date" value="${e(memorial.lossDate)}"${disabled}>`)}</div><div class="admin-sharing-options"><label class="admin-checkbox"><input type="checkbox" name="isPublic"${memorial.isPublic ? ' checked' : ''}${disabled}><span><strong>Anı sayfası paylaşıma açık</strong><small>Bağlantıya sahip olan kişiler hikâyeyi görebilir.</small></span></label><label class="admin-checkbox"><input type="checkbox" name="showLocation"${memorial.showLocation ? ' checked' : ''}${disabled}><span><strong>Dikim konumunu göster</strong><small>Sayfa paylaşıma açıksa konumu da görünür olur.</small></span></label></div>${editable ? footer('Anı sayfasını güncelle') : '<div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Kapat</button></div>'}</form>` });
  }

  function openTeam(id) {
    if (!can('team')) return denied();
    const person = id ? member(id) : null;
    if (id && !person) return C.toast('Ekip üyesi bulunamadı.', 'error');
    const current = person || { name: '', email: '', role: 'operations', active: true };
    showModal({ title: person ? 'Ekip üyesini düzenle' : 'Örnek ekip üyesi ekle', body: `<form class="admin-form" data-form="admin-team"${id ? ` data-id="${e(id)}"` : ''}>${field('Ad ve soyad', 'admin-team-name', `<input class="input" id="admin-team-name" name="name" value="${e(current.name)}" required maxlength="80" autocomplete="off">`)}${field('Demo e-posta adresi', 'admin-team-email', `<input class="input" id="admin-team-email" name="email" type="email" value="${e(current.email)}" required maxlength="180" placeholder="isim@candancana.test" autocomplete="off">`, 'Örnek kayıt için .test uzantılı bir adres kullanın.')}${field('Ekip rolü', 'admin-team-role', `<select class="select" id="admin-team-role" name="role">${Object.entries(roles).map(([value, text]) => option(value, text, current.role)).join('')}</select>`)}<label class="admin-checkbox"><input type="checkbox" name="active"${current.active !== false ? ' checked' : ''}><span>Ekip üyesi aktif</span></label><p class="admin-form-note">Bu işlem demo ekibine kayıt ekler; giriş hesabı veya e-posta daveti oluşturmaz.</p>${footer(person ? 'Ekip üyesini kaydet' : 'Ekip üyesini ekle')}</form>` });
  }

  function previewRole(value, personId) {
    if (!Object.prototype.hasOwnProperty.call(roles, value)) return;
    const person = activeTeam().find(item => item.id === personId) || activeTeam().find(item => item.role === value) || activeTeam()[0];
    if (!person) return C.toast('Önizleme için aktif ekip üyesi bulunamadı.', 'error');
    closeMenu(false);
    C.db.settings.staffRole = value;
    C.db.settings.staffId = person.id;
    C.closeModal();
    C.commit(`${roles[value]} görünümü açıldı.`);
  }

  function closeMenu(restoreFocus = true) {
    const shellElement = document.querySelector('[data-admin-shell]');
    const sidebar = document.getElementById('admin-sidebar');
    if (shellElement) delete shellElement.dataset.menuOpen;
    if (sidebar) { sidebar.removeAttribute('role'); sidebar.removeAttribute('aria-modal'); }
    document.body.classList.remove('admin-menu-is-open');
    const trigger = document.querySelector('[data-action="admin-menu"]');
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); if (restoreFocus) trigger.focus(); }
  }

  C.actions['admin-menu'] = () => {
    const shellElement = document.querySelector('[data-admin-shell]');
    if (!shellElement) return;
    if (shellElement.dataset.menuOpen === 'true') return closeMenu();
    shellElement.dataset.menuOpen = 'true';
    document.body.classList.add('admin-menu-is-open');
    const trigger = document.querySelector('[data-action="admin-menu"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) { sidebar.setAttribute('role', 'dialog'); sidebar.setAttribute('aria-modal', 'true'); const first = sidebar.querySelector('a,button,select'); if (first) first.focus(); }
  };
  C.actions['admin-menu-close'] = () => closeMenu();
  window.addEventListener('hashchange', () => closeMenu(false));
  document.addEventListener('keydown', event => {
    const shellElement = document.querySelector('[data-admin-shell][data-menu-open="true"]');
    if (!shellElement) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
    if (event.key !== 'Tab') return;
    const elements = [...document.querySelectorAll('#admin-sidebar a, #admin-sidebar button:not([disabled]), #admin-sidebar select:not([disabled])')].filter(element => element.getClientRects().length);
    if (!elements.length) return;
    if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements[elements.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) { event.preventDefault(); elements[0].focus(); }
  });

  C.inputs['admin-search'] = input => {
    ui.queries[input.dataset.section] = input.value;
    const key = input.dataset.focusKey;
    const position = input.selectionStart;
    C.render();
    const replacement = document.querySelector(`[data-focus-key="${key}"]`);
    if (replacement) { replacement.focus(); try { replacement.setSelectionRange(position, position); } catch (_) { /* Search selection is not available on every browser. */ } }
  };
  C.inputs['admin-coordinate'] = () => {
    const form = document.getElementById('admin-capsule-form');
    if (!form || !form.elements.lat.value.trim() || !form.elements.lng.value.trim()) return;
    const lat = Number(form.elements.lat.value);
    const lng = Number(form.elements.lng.value);
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && C.setMapPickedPoint) C.setMapPickedPoint('admin-capsule-picker', { lat, lng });
  };
  C.changes['admin-filter'] = input => { if (Object.prototype.hasOwnProperty.call(ui, input.dataset.filter)) { ui[input.dataset.filter] = input.value; C.render(); } };
  C.changes['admin-role'] = input => previewRole(input.value);
  C.actions['admin-preview-role'] = element => previewRole(element.dataset.role);
  C.actions['admin-reset-role'] = () => previewRole('admin');
  C.actions['admin-team-preview'] = element => { const person = member(element.dataset.id); if (person && person.active !== false) previewRole(person.role, person.id); };
  C.actions['admin-product-open'] = element => openProduct(element.dataset.id);
  C.actions['admin-order-open'] = element => openOrder(element.dataset.id);
  C.actions['admin-capsule-open'] = element => openCapsule(element.dataset.id);
  C.actions['admin-care-new'] = element => openCare(element.dataset.id);
  C.actions['admin-task-new'] = () => openTask();
  C.actions['admin-task-open'] = element => openTask(element.dataset.id);
  C.actions['admin-memorial-open'] = element => openMemorial(element.dataset.id);
  C.actions['admin-team-new'] = () => openTeam();
  C.actions['admin-team-open'] = element => openTeam(element.dataset.id);
  C.actions['admin-map-select'] = element => selectMapCapsule(element.dataset.id);

  C.actions['admin-product-toggle'] = element => {
    if (!can('catalog')) return denied();
    const product = C.product(element.dataset.id);
    if (!product) return C.toast('Ürün kaydı bulunamadı.', 'error');
    product.active = product.active === false;
    finish('Ürün görünürlüğü değişti', `${product.name}: ${product.active ? 'Yayında' : 'Taslak'}`, `${product.name} ${product.active ? 'yayına alındı' : 'taslağa alındı'}.`);
  };

  C.forms['admin-product'] = form => {
    if (!can('catalog')) return denied();
    const product = C.product(form.dataset.id);
    if (!product) return C.toast('Ürün kaydı bulunamadı.', 'error');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const subtitle = String(data.get('subtitle') || '').trim();
    const description = String(data.get('description') || '').trim();
    const price = Number(data.get('price'));
    const stock = Number(data.get('stock'));
    if (!name) return invalid(form, 'name', 'Ürün adını yazın.');
    if (!subtitle) return invalid(form, 'subtitle', 'Kısa açıklama yazın.');
    if (!description) return invalid(form, 'description', 'Ürün açıklamasını yazın.');
    if (!String(data.get('price') || '').trim() || !Number.isFinite(price) || price < 0 || price > 10000000) return invalid(form, 'price', '0 ile 10.000.000 arasında geçerli bir fiyat yazın.');
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return invalid(form, 'stock', 'Stok için 0 ile 100.000 arasında bir tam sayı yazın.');
    const oldPrice = product.price;
    Object.assign(product, { name, subtitle, description, price: Math.round(price * 100) / 100, stock, active: data.has('active') });
    if (product.price === 0 || (product.oldPrice != null && product.oldPrice <= product.price)) product.oldPrice = null;
    finish('Ürün güncellendi', `${name}: ${C.money(oldPrice)} → ${C.money(product.price)}, stok ${stock} adet`, 'Ürün bilgileri kaydedildi.');
  };

  C.forms['admin-order'] = form => {
    if (!can('order')) return denied();
    const order = C.order(form.dataset.id);
    if (!order) return C.toast('Sipariş kaydı bulunamadı.', 'error');
    const data = new FormData(form);
    const payment = String(data.get('payment'));
    const fulfillment = String(data.get('fulfillment'));
    if (!paymentStates.includes(payment) || !deliveryStates.includes(fulfillment)) return C.toast('Geçerli bir sipariş durumu seçin.', 'error');
    if (payment === 'paid') {
      try { C.ensureOrderCapsules(order); }
      catch (error) { return C.toast(error.message || 'Kapsül kaydı oluşturulamadı. Ürün stoklarını kontrol edin.', 'error'); }
    }
    order.payment = payment;
    order.fulfillment = fulfillment;
    finish('Sipariş güncellendi', `${order.id}: ${label(payment)} / ${label(fulfillment)}`, 'Sipariş durumu güncellendi.');
  };

  C.forms['admin-capsule'] = form => {
    const capsule = C.capsule(form.dataset.id);
    if (!capsule) return C.toast('Kapsül kaydı bulunamadı.', 'error');
    if (!can('capsule', capsule)) return denied();
    const data = new FormData(form);
    const petName = String(data.get('petName') || '').trim();
    const petType = String(data.get('petType') || '').trim();
    const status = String(data.get('status'));
    if (!petName) return invalid(form, 'petName', 'Evcil dostun adını yazın.');
    if (!petType) return invalid(form, 'petType', 'Evcil dostun türünü yazın.');
    if (!capsuleStates.includes(status)) return C.toast('Geçerli bir kapsül aşaması seçin.', 'error');
    const staffId = can('assignment') ? String(data.get('staffId') || '') : capsule.staffId;
    if (staffId && !activeTeam().some(person => person.id === staffId) && staffId !== capsule.staffId) return invalid(form, 'staffId', 'Aktif bir ekip üyesi seçin.');
    const rawLat = String(data.get('lat') || '').trim();
    const rawLng = String(data.get('lng') || '').trim();
    const needsLocation = ['reported', 'planted'].includes(status);
    let planting = null;
    if (needsLocation || rawLat || rawLng) {
      const lat = Number(rawLat);
      const lng = Number(rawLng);
      const district = String(data.get('district') || '').trim();
      const date = String(data.get('plantingDate') || '');
      if (!rawLat || !Number.isFinite(lat) || lat < -90 || lat > 90) return invalid(form, 'lat', 'Haritadan bir nokta seçin veya geçerli enlem girin.');
      if (!rawLng || !Number.isFinite(lng) || lng < -180 || lng > 180) return invalid(form, 'lng', 'Geçerli boylam girin.');
      if (!district) return invalid(form, 'district', 'Dikim yapılan ilçeyi yazın.');
      if (!date || !Number.isFinite(new Date(`${date}T12:00:00`).getTime())) return invalid(form, 'plantingDate', 'Geçerli bir dikim tarihi seçin.');
      const changed = !capsule.planting || capsule.planting.lat !== lat || capsule.planting.lng !== lng;
      planting = { lat, lng, district, label: String(data.get('locationLabel') || '').trim() || district, date, verified: status === 'planted' || data.has('verified'), source: changed ? 'team' : capsule.planting.source };
      if (status === 'reported') planting.verified = false;
    }
    capsule.petName = petName;
    capsule.petType = petType;
    capsule.status = status;
    capsule.staffId = staffId;
    capsule.planting = planting;
    finish('Kapsül güncellendi', `${capsule.id} · ${petName}: ${label(status)}${planting ? `, ${planting.district}` : ''}`, 'Kapsül kaydı güncellendi.');
  };

  C.actions['admin-planting-confirm'] = element => {
    const capsule = C.capsule(element.dataset.id);
    if (!capsule || !capsule.planting) return C.toast('Doğrulanacak bir konum kaydı bulunamadı.', 'error');
    if (!can('capsule', capsule)) return denied();
    showModal({ title: 'Dikim kaydını doğrula', body: `<div class="admin-confirm"><div class="admin-capsule-summary">${pet(capsule)}<div><h3>${e(capsule.petName)}</h3><p>${e(capsule.id)} · ${e(capsule.planting.district)}</p></div></div><p>${e(capsule.planting.label)} konumundaki, ${e(C.date(capsule.planting.date))} tarihli dikim kaydını kontrol ettiğinizi onaylayın.</p><div class="admin-form-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Vazgeç</button><button type="button" class="btn btn-primary" data-action="admin-planting-approve" data-id="${e(capsule.id)}">${i('check-circle')}Dikimi doğrula</button></div></div>` });
  };
  C.actions['admin-planting-approve'] = element => {
    const capsule = C.capsule(element.dataset.id);
    if (!capsule || !capsule.planting) return C.toast('Konum kaydı bulunamadı.', 'error');
    if (!can('capsule', capsule)) return denied();
    capsule.status = 'planted';
    capsule.planting.verified = true;
    finish('Dikim doğrulandı', `${capsule.petName} · ${capsule.id}, ${capsule.planting.district}`, 'Dikim kaydı doğrulandı.');
  };
  C.forms['admin-care'] = form => {
    const capsule = C.capsule(form.dataset.id);
    if (!capsule) return C.toast('Kapsül kaydı bulunamadı.', 'error');
    if (!can('capsule', capsule)) return denied();
    const data = new FormData(form);
    const note = String(data.get('note') || '').trim();
    const date = String(data.get('date') || '');
    const type = String(data.get('type') || 'Genel not');
    if (!note) return invalid(form, 'note', 'Yapılan bakımı açıklayan bir not yazın.');
    if (!date || !Number.isFinite(new Date(`${date}T12:00:00`).getTime())) return invalid(form, 'date', 'Geçerli bir işlem tarihi seçin.');
    capsule.care.push({ id: uid('care'), date, type, note, by: staff().name, image: '' });
    finish('Bakım kaydı eklendi', `${capsule.petName} · ${capsule.id}: ${type}`, 'Bakım kaydı aile ve ekip görünümüne eklendi.');
  };

  C.forms['admin-task'] = form => {
    const task = form.dataset.id ? C.db.tasks.find(item => item.id === form.dataset.id) : null;
    if (form.dataset.id && !task) return C.toast('Görev kaydı bulunamadı.', 'error');
    if (task ? !can('task', task) : !can('task-create')) return denied();
    const manager = can('task-create');
    const data = new FormData(form);
    const status = String(data.get('status'));
    const note = String(data.get('note') || '').trim();
    if (!taskStates.includes(status)) return C.toast('Geçerli bir görev aşaması seçin.', 'error');
    let update = { status, note };
    if (manager) {
      const title = String(data.get('title') || '').trim();
      const assignedTo = String(data.get('assignedTo') || '');
      const capsuleId = String(data.get('capsuleId') || '');
      const date = String(data.get('due') || '');
      const priority = String(data.get('priority'));
      if (!title) return invalid(form, 'title', 'Görev için kısa bir başlık yazın.');
      if (!activeTeam().some(person => person.id === assignedTo)) return invalid(form, 'assignedTo', 'Aktif bir görev sorumlusu seçin.');
      if (capsuleId && !C.capsule(capsuleId)) return invalid(form, 'capsuleId', 'Listeden geçerli bir kapsül seçin.');
      if (!date || !Number.isFinite(new Date(`${date}T12:00:00`).getTime())) return invalid(form, 'due', 'Geçerli bir tamamlanma tarihi seçin.');
      if (!['normal', 'high'].includes(priority)) return C.toast('Geçerli bir öncelik seçin.', 'error');
      update = { ...update, title, assignedTo, capsuleId, due: date, priority, type: String(data.get('type') || 'care') };
    }
    if (task) Object.assign(task, update);
    else C.db.tasks.push({ id: uid('task'), ...update });
    finish(task ? 'Görev güncellendi' : 'Görev oluşturuldu', `${task ? task.title : update.title} · ${memberName(task ? task.assignedTo : update.assignedTo)}`, task ? 'Görev güncellendi.' : 'Yeni görev oluşturuldu.');
  };
  const changeTaskState = (element, status) => {
    const task = C.db.tasks.find(item => item.id === element.dataset.id);
    if (!task) return C.toast('Görev kaydı bulunamadı.', 'error');
    if (!can('task', task)) return denied();
    task.status = status;
    finish('Görev aşaması değişti', `${task.title}: ${label(status)}`, status === 'done' ? 'Görev tamamlandı.' : status === 'in_progress' ? 'Görev başlatıldı.' : 'Görev yeniden açıldı.');
  };
  C.actions['admin-task-start'] = element => changeTaskState(element, 'in_progress');
  C.actions['admin-task-complete'] = element => changeTaskState(element, 'done');
  C.actions['admin-task-reopen'] = element => changeTaskState(element, 'open');

  C.forms['admin-memorial'] = form => {
    if (!can('memorial')) return denied();
    const capsule = C.capsule(form.dataset.id);
    if (!capsule) return C.toast('Anı sayfası kaydı bulunamadı.', 'error');
    const data = new FormData(form);
    const birthDate = String(data.get('birthDate') || '');
    const lossDate = String(data.get('lossDate') || '');
    if (birthDate && lossDate && birthDate > lossDate) return invalid(form, 'lossDate', 'Veda tarihi doğum tarihinden önce olamaz.');
    Object.assign(capsule.memorial, { story: String(data.get('story') || '').trim(), birthDate, lossDate, isPublic: data.has('isPublic'), showLocation: data.has('showLocation') });
    finish('Anı sayfası güncellendi', `${capsule.petName}: ${capsule.memorial.isPublic ? 'Paylaşıma açık' : 'Aileye özel'}, konum ${capsule.memorial.showLocation ? 'açık' : 'gizli'}`, 'Anı sayfası tercihleri kaydedildi.');
  };
  C.actions['admin-memorial-link'] = element => {
    const capsule = C.capsule(element.dataset.id);
    if (!capsule) return C.toast('Anı sayfası kaydı bulunamadı.', 'error');
    const hash = `#/ani/${encodeURIComponent(capsule.memorialSlug || capsule.id)}`;
    const url = `${window.location.href.split('#')[0]}${hash}`;
    showModal({ title: `${capsule.petName} · Anı bağlantısı`, body: `<div class="admin-form"><p class="admin-form-intro">${capsule.memorial.isPublic ? 'Bu anı sayfası bağlantıyla paylaşılabilir.' : 'Anı sayfası aileye özel. Bağlantı, görünürlük tercihini değiştirmez.'}</p>${field('Anı sayfası bağlantısı', 'admin-memorial-url', `<input class="input" id="admin-memorial-url" type="text" value="${e(url)}" readonly>`)}<div class="admin-form-footer"><a class="btn btn-secondary" href="${e(hash)}">Sayfayı aç${i('arrow-up-right')}</a><button type="button" class="btn btn-primary" data-action="admin-copy-link">${i('clipboard')}Bağlantıyı kopyala</button></div></div>` });
  };
  C.actions['admin-copy-link'] = async () => {
    const input = document.getElementById('admin-memorial-url');
    if (!input) return;
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(input.value); C.toast('Anı sayfası bağlantısı kopyalandı.'); return; } catch (_) { /* The selected text below remains available without clipboard permission. */ }
    }
    input.focus(); input.select();
    C.toast('Bağlantı seçildi. Kopyalamak için Ctrl+C veya ⌘C kullanın.', 'info');
  };

  C.forms['admin-team'] = form => {
    if (!can('team')) return denied();
    const person = form.dataset.id ? member(form.dataset.id) : null;
    if (form.dataset.id && !person) return C.toast('Ekip üyesi bulunamadı.', 'error');
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const selectedRole = String(data.get('role'));
    const active = data.has('active');
    if (!name) return invalid(form, 'name', 'Ekip üyesinin adını yazın.');
    if (!/^[^\s@]+@[^\s@]+\.test$/i.test(email)) return invalid(form, 'email', 'Örnek kayıt için isim@candancana.test biçiminde bir adres yazın.');
    if (C.db.team.some(item => item.id !== (person && person.id) && item.email.toLowerCase() === email)) return invalid(form, 'email', 'Bu e-posta zaten bir ekip üyesinde kullanılıyor.');
    if (!Object.prototype.hasOwnProperty.call(roles, selectedRole)) return C.toast('Geçerli bir ekip rolü seçin.', 'error');
    if (person && person.role === 'admin' && (!active || selectedRole !== 'admin') && !C.db.team.some(item => item.id !== person.id && item.role === 'admin' && item.active !== false)) return C.toast('En az bir aktif yönetici bulunmalıdır.', 'error');
    const initials = name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toLocaleUpperCase('tr-TR');
    const record = { name, email, role: selectedRole, active, initials };
    if (person) Object.assign(person, record);
    else C.db.team.push({ id: uid('staff'), ...record });
    if (person && person.id === C.db.settings.staffId) {
      if (!active) { const next = activeTeam().find(item => item.role === 'admin') || activeTeam()[0]; C.db.settings.staffId = next.id; C.db.settings.staffRole = next.role; }
      else C.db.settings.staffRole = selectedRole;
    }
    finish(person ? 'Ekip üyesi güncellendi' : 'Ekip üyesi eklendi', `${name} · ${roles[selectedRole]} · ${active ? 'Aktif' : 'Pasif'}`, 'Ekip kaydı kaydedildi.');
  };

  C.actions['admin-notifications'] = () => {
    const tasks = C.db.tasks.filter(task => task.status !== 'done').sort((a, b) => String(a.due).localeCompare(String(b.due)));
    const messages = C.db.messages.slice().sort(byDate).slice(0, 5);
    showModal({ title: 'Görevler ve yeni mesajlar', body: `<div class="admin-notification-content"><h3 class="admin-section-title">Açık görevler <span>${tasks.length}</span></h3>${tasks.length ? tasks.slice(0, 5).map(task => `<button type="button" class="admin-notification-row" data-action="admin-task-open" data-id="${e(task.id)}">${i('clipboard', 20)}<span><strong>${e(task.title)}</strong><small>${e(memberName(task.assignedTo))} · ${e(due(task.due).text)}</small></span>${i('chevron-right', 16)}</button>`).join('') : '<p class="admin-quiet-message">Açık görev bulunmuyor.</p>'}<h3 class="admin-section-title admin-notification-messages">İletişim formları <span>${C.db.messages.length}</span></h3>${messages.length ? messages.map(message => `<article class="admin-message"><div><strong>${e(message.name)}</strong><small>${e(C.date(message.date))}</small></div><span>${e(message.email)}</span><p>${e(message.message)}</p></article>`).join('') : '<p class="admin-quiet-message">Siteden gönderilen örnek iletişim formları burada görünür.</p>'}</div>` });
  };

  C.actions['admin-export-orders'] = () => {
    const orders = filteredOrders();
    if (!orders.length) return C.toast('İndirilecek sipariş bulunamadı. Filtreleri değiştirin.', 'info');
    const cell = value => { let text = String(value == null ? '' : value); if (/^[=+@\-]/.test(text)) text = `'${text}`; return `"${text.replace(/"/g, '""')}"`; };
    const rows = [['Sipariş', 'Tarih', 'Müşteri', 'Ürünler', 'Toplam TRY', 'Ödeme', 'Teslimat'], ...orders.map(order => [order.id, order.date, orderContact(order).name, order.items.map(item => `${item.name} × ${item.quantity}`).join(' / '), order.total.toFixed(2), label(order.payment), label(order.fulfillment)])];
    const csv = '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url; link.download = `candan-cana-siparisler-${today()}.csv`; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    C.toast(`${orders.length} siparişin listesi indirildi.`);
  };
})();
