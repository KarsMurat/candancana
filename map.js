(function () {
  'use strict';

  const CC = window.CC;
  const bounds = { west: 28.5, east: 29.75, south: 40.78, north: 41.34 };
  const instances = new WeakMap();
  const esc = value => CC.esc(value);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const finitePoint = point => point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));
  const inBounds = point => finitePoint(point) && Number(point.lng) >= bounds.west && Number(point.lng) <= bounds.east && Number(point.lat) >= bounds.south && Number(point.lat) <= bounds.north;

  CC.mapPoint = function (lng, lat) {
    return {
      x: (Number(lng) - bounds.west) / (bounds.east - bounds.west) * 100,
      y: (bounds.north - Number(lat)) / (bounds.north - bounds.south) * 100
    };
  };

  const districts = [
    ['Beylikdüzü', 28.62, 41.015], ['Avcılar', 28.71, 41.06],
    ['Başakşehir', 28.8, 41.125], ['Bakırköy', 28.835, 41.008],
    ['Eyüpsultan', 28.87, 41.077], ['Şişli', 28.96, 41.08],
    ['Sarıyer', 29.04, 41.18], ['Beşiktaş', 28.982, 41.04],
    ['Beykoz', 29.16, 41.135], ['Üsküdar', 29.085, 41.017],
    ['Çekmeköy', 29.255, 41.08], ['Kadıköy', 29.075, 40.975],
    ['Pendik', 29.25, 40.88], ['Şile', 29.62, 41.175],
    ['Arnavutköy', 28.735, 41.21]
  ];

  function cartography(prefix) {
    return `<svg class="cc-map-geography" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="${prefix}-city-blocks" width="47" height="39" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)"><path d="M0 0H47M0 0V39" fill="none" stroke="#deded2" stroke-width=".7" opacity=".6"/></pattern>
        <clipPath id="${prefix}-land-clip"><path d="M0 0H540L523 51 501 100 492 138 463 170 451 203 455 229 436 266 426 296 405 328 388 329 365 314 339 287 313 281 326 299 351 324 375 344 357 367 319 389 274 397 227 425 188 436 146 421 131 394 114 378 93 390 67 390 52 365 0 374Z M574 0H1000V600H719L693 572 650 558 632 526 590 498 553 468 519 450 494 413 460 392 435 358 441 323 455 302 469 275 470 244 465 212 480 183 509 155 518 113 545 70Z"/></clipPath>
      </defs>
      <rect width="1000" height="600" fill="#dce9e7"/>
      <g clip-path="url(#${prefix}-land-clip)">
        <rect width="1000" height="600" fill="#efeee4"/>
        <rect x="0" y="200" width="1000" height="400" fill="url(#${prefix}-city-blocks)"/>
        <g fill="#dce5d2">
          <path d="M8 0H400L433 37 399 94 360 116 348 151 289 140 262 111 210 144 153 124 117 80 80 108 24 70Z"/>
          <path d="M348 85L412 60 458 103 442 149 428 179 392 197 351 171 328 136Z"/>
          <path d="M596 0H1000V184L946 213 885 173 848 205 796 173 741 205 702 162 639 180 586 133 554 85Z"/>
          <path d="M570 170L618 188 656 231 637 276 590 267 571 241 534 225Z"/>
          <path d="M759 266L840 242 887 278 864 350 825 377 773 338 747 307Z"/>
          <path d="M145 230L178 206 198 247 186 279 157 277Z"/>
          <path d="M247 284L270 266 293 291 284 320 257 314Z"/>
          <path d="M491 336L510 315 535 336 525 356 503 359Z"/>
          <path d="M625 358L674 344 703 385 687 421 650 421 620 394Z"/>
        </g>
        <g fill="none" stroke="#fffefa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 258C120 230 174 282 265 264S373 258 429 285"/>
          <path d="M0 335C113 306 165 378 243 363S359 332 395 322"/>
          <path d="M41 143C91 201 95 250 126 303S196 364 221 421"/>
          <path d="M166 59C141 143 191 204 243 246S278 324 300 391"/>
          <path d="M304 10C286 100 342 164 367 205S412 244 429 288"/>
          <path d="M500 9C445 80 421 115 403 168S391 250 405 302"/>
          <path d="M555 196C606 213 616 289 665 306S831 310 1000 261"/>
          <path d="M452 310C535 288 570 370 650 399S829 418 1000 426"/>
          <path d="M469 367C545 399 580 448 649 477S816 509 1000 555"/>
          <path d="M597 44C563 124 618 154 645 211S700 322 719 430 791 539 817 600"/>
          <path d="M814 15C777 118 821 187 789 274S780 391 778 495"/>
          <path d="M973 119C888 175 915 296 880 335S876 462 905 600"/>
        </g>
        <g fill="none" stroke="#d3c8a8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M-20 296C101 261 157 317 252 298S359 241 437 251"/>
          <path d="M470 254C572 244 572 327 671 346S859 339 1020 383"/>
          <path d="M270 -15C262 106 340 151 404 190L457 210"/>
          <path d="M475 210C575 177 637 114 758 124S908 75 1020 103"/>
        </g>
        <g fill="none" stroke="#f6f2df" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M-20 296C101 261 157 317 252 298S359 241 437 251"/>
          <path d="M470 254C572 244 572 327 671 346S859 339 1020 383"/>
          <path d="M270 -15C262 106 340 151 404 190L457 210"/>
          <path d="M475 210C575 177 637 114 758 124S908 75 1020 103"/>
        </g>
      </g>
      <g fill="none" stroke="#bcb599" stroke-width="4"><path d="M435 251L471 254"/><path d="M451 207L478 209"/></g>
      <g fill="none" stroke="#fffaf0" stroke-width="1.6"><path d="M435 251L471 254"/><path d="M451 207L478 209"/></g>
      <g fill="#e9e9dd" stroke="#d4dccc" stroke-width="1"><path d="M511 495l9-6 10 9-5 11-9-2Z"/><path d="M535 520l10-5 11 9-5 13-13-1Z"/><path d="M565 542l8-4 9 7-4 9-9-2Z"/></g>
    </svg>`;
  }

  CC.map = function (markers, options) {
    const opts = Object.assign({ id: 'map', selected: null, height: 460, picker: false }, options || {});
    const visible = (Array.isArray(markers) ? markers : []).filter(inBounds);
    const height = clamp(Number(opts.height) || 460, 240, 1000);
    const prefix = 'cc-map-' + String(opts.id).replace(/[^a-zA-Z0-9_-]/g, '-');
    const labels = districts.map(([name, lng, lat]) => {
      const p = CC.mapPoint(lng, lat);
      return `<span class="cc-map-district" style="left:${p.x}%;top:${p.y}%">${esc(name)}</span>`;
    }).join('');
    const pins = visible.map(marker => {
      const p = CC.mapPoint(marker.lng, marker.lat);
      const selected = String(marker.id) === String(opts.selected);
      const status = marker.status === 'reported' ? ' cc-map-marker-reported' : '';
      const picture = marker.image ? `<img src="${esc(marker.image)}" alt="" loading="lazy" draggable="false">` : CC.icon('sprout', 22);
      const label = [marker.title || marker.id, marker.subtitle].filter(Boolean).join(' · ');
      return `<button type="button" class="cc-map-marker${status}${selected ? ' is-selected' : ''}" data-map-marker="${esc(marker.id)}" data-map-label="${esc(label)}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(label)}" aria-pressed="${selected}"><span class="cc-map-pin">${picture}</span><span class="cc-map-marker-label">${esc(marker.title || marker.id)}</span></button>`;
    }).join('');
    return `<div class="cc-map${opts.picker ? ' cc-map-picker' : ''}" id="${esc(opts.id)}" data-map-root data-map-picker="${opts.picker ? 'true' : 'false'}" style="--map-height:${height}px;--map-zoom:1" role="region" aria-label="İstanbul dikim haritası">
      <div class="cc-map-viewport" tabindex="0" role="group" aria-label="Harita. Artı ve eksi tuşlarıyla yakınlaştırın, ok tuşlarıyla hareket edin.${opts.picker ? ' Enter tuşuyla görünen alanın merkezini seçin.' : ''}">
        <div class="cc-map-surface">${cartography(prefix)}<div class="cc-map-labels" aria-hidden="true">${labels}<span class="cc-map-area cc-map-europe">AVRUPA YAKASI</span><span class="cc-map-area cc-map-asia">ANADOLU YAKASI</span><span class="cc-map-water-label cc-map-sea">MARMARA DENİZİ</span><span class="cc-map-water-label cc-map-strait">İstanbul Boğazı</span></div><div class="cc-map-markers">${pins}<span class="cc-map-picked" hidden aria-hidden="true">${CC.icon('map-pin', 32)}</span></div></div>
      </div>
      <div class="cc-map-heading" aria-hidden="true">${CC.icon('map', 17)}<span>İstanbul çevresi<small>${opts.picker ? 'Konum seçimi' : `${visible.length} dikim konumu`}</small></span></div>
      <div class="cc-map-compass" aria-hidden="true"><span>K</span><svg width="14" height="24" viewBox="0 0 14 24"><path d="M7 1L13 23 7 18 1 23Z" fill="currentColor"/><path d="M7 1V18L1 23Z" fill="#a0aba0"/></svg></div>
      <div class="cc-map-controls" aria-label="Harita kontrolleri"><button type="button" data-map-command="in" aria-label="Haritayı yakınlaştır" title="Yakınlaştır">${CC.icon('plus', 19)}</button><button type="button" data-map-command="out" aria-label="Haritayı uzaklaştır" title="Uzaklaştır" disabled>${CC.icon('minus', 19)}</button><button type="button" data-map-command="reset" aria-label="Haritayı başlangıç görünümüne getir" title="Görünümü sıfırla">${CC.icon('navigation', 18)}</button></div>
      <div class="cc-map-instruction">${opts.picker ? 'Dokunarak bir dikim noktası seçin' : 'Yakınlaştırın ve sürükleyin'}</div><span class="cc-map-attribution">Şematik demo haritası</span><span class="cc-map-feedback visually-hidden" role="status" aria-live="polite"></span>
    </div>`;
  };

  CC.selectMapMarker = function (id, markerId) {
    const root = document.getElementById(id);
    if (!root) return false;
    let found = false;
    root.querySelectorAll('[data-map-marker]').forEach(button => {
      const selected = button.dataset.mapMarker === String(markerId);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      if (selected) {
        found = true;
        root.querySelector('.cc-map-feedback').textContent = `${button.dataset.mapLabel} seçildi.`;
      }
    });
    return found;
  };

  CC.setMapPickedPoint = function (id, point) {
    const root = document.getElementById(id);
    if (!root || !inBounds(point)) return false;
    const marker = root.querySelector('.cc-map-picked');
    const p = CC.mapPoint(point.lng, point.lat);
    marker.style.left = `${p.x}%`;
    marker.style.top = `${p.y}%`;
    marker.hidden = false;
    root.querySelector('.cc-map-feedback').textContent = `Dikim noktası seçildi: ${Number(point.lat).toFixed(5)}, ${Number(point.lng).toFixed(5)}.`;
    root.querySelector('.cc-map-instruction').textContent = 'Konum seçildi · değiştirmek için dokunun';
    return true;
  };

  CC.mountMap = function (id, callbacks) {
    const root = document.getElementById(id);
    if (!root) return null;
    const previous = instances.get(root);
    if (previous) { previous.callbacks = callbacks || {}; return previous; }
    const controller = { callbacks: callbacks || {}, zoom: 1, x: 0, y: 0, pointer: null };
    const viewport = root.querySelector('.cc-map-viewport');
    const surface = root.querySelector('.cc-map-surface');
    const isPicker = root.dataset.mapPicker === 'true';
    const feedback = root.querySelector('.cc-map-feedback');

    const paint = () => {
      const maxX = viewport.clientWidth * (controller.zoom - 1) / 2;
      const maxY = viewport.clientHeight * (controller.zoom - 1) / 2;
      controller.x = clamp(controller.x, -maxX, maxX);
      controller.y = clamp(controller.y, -maxY, maxY);
      surface.style.transform = `translate(${controller.x}px, ${controller.y}px) scale(${controller.zoom})`;
      root.style.setProperty('--map-zoom', controller.zoom);
      root.querySelector('[data-map-command="out"]').disabled = controller.zoom <= 1;
      root.querySelector('[data-map-command="in"]').disabled = controller.zoom >= 3.5;
    };
    const zoom = increment => {
      controller.zoom = clamp(Math.round((controller.zoom + increment) * 100) / 100, 1, 3.5);
      paint();
      feedback.textContent = `Harita yakınlığı yüzde ${Math.round(controller.zoom * 100)}.`;
    };
    const reset = () => {
      controller.zoom = 1; controller.x = 0; controller.y = 0; paint();
      feedback.textContent = 'Harita başlangıç görünümüne döndü.';
    };
    const pick = (clientX, clientY) => {
      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const point = {
        lng: Number((bounds.west + clamp((clientX - rect.left) / rect.width, 0, 1) * (bounds.east - bounds.west)).toFixed(6)),
        lat: Number((bounds.north - clamp((clientY - rect.top) / rect.height, 0, 1) * (bounds.north - bounds.south)).toFixed(6))
      };
      CC.setMapPickedPoint(id, point);
      if (typeof controller.callbacks.onPick === 'function') controller.callbacks.onPick(point);
    };

    root.addEventListener('click', event => {
      const command = event.target.closest('[data-map-command]');
      if (command) {
        if (command.dataset.mapCommand === 'in') zoom(.4);
        if (command.dataset.mapCommand === 'out') zoom(-.4);
        if (command.dataset.mapCommand === 'reset') reset();
        return;
      }
      const marker = event.target.closest('[data-map-marker]');
      if (marker) {
        CC.selectMapMarker(id, marker.dataset.mapMarker);
        if (typeof controller.callbacks.onSelect === 'function') controller.callbacks.onSelect(marker.dataset.mapMarker);
      }
    });

    viewport.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button') || controller.pointer) return;
      controller.pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: controller.x, y: controller.y, dragged: false };
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      const pointer = controller.pointer;
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.startX;
      const dy = event.clientY - pointer.startY;
      if (Math.abs(dx) + Math.abs(dy) > 5) pointer.dragged = true;
      if (pointer.dragged) {
        root.classList.add('is-dragging');
        controller.x = pointer.x + dx; controller.y = pointer.y + dy; paint();
      }
    });
    viewport.addEventListener('pointerup', event => {
      const pointer = controller.pointer;
      if (!pointer || pointer.id !== event.pointerId) return;
      controller.pointer = null;
      root.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (isPicker && !pointer.dragged) pick(event.clientX, event.clientY);
    });
    viewport.addEventListener('pointercancel', () => {
      controller.pointer = null; root.classList.remove('is-dragging');
    });
    viewport.addEventListener('keydown', event => {
      if (event.target !== viewport) return;
      const distance = event.shiftKey ? 100 : 40;
      const key = event.key;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home', 'Enter', ' '].includes(key)) return;
      if ((key === 'Enter' || key === ' ') && !isPicker) return;
      event.preventDefault();
      if (key === '+' || key === '=') zoom(.4);
      else if (key === '-') zoom(-.4);
      else if (key === 'Home') reset();
      else if (key === 'Enter' || key === ' ') {
        const rect = viewport.getBoundingClientRect(); pick(rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else {
        if (key === 'ArrowLeft') controller.x += distance;
        if (key === 'ArrowRight') controller.x -= distance;
        if (key === 'ArrowUp') controller.y += distance;
        if (key === 'ArrowDown') controller.y -= distance;
        paint();
      }
    });
    instances.set(root, controller);
    paint();
    return controller;
  };
})();
