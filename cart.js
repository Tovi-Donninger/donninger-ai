(() => {
  const STORAGE_KEY = 'donningerAiCartV1';
  const catalog = {
    sales: 'Sales & Lead Generation',
    marketing: 'Marketing',
    'customer-service': 'Customer Service',
    'hr-recruitment': 'HR & Recruitment',
    finance: 'Finance & Accounting',
    operations: 'Operations & Administration',
    'stock-logistics': 'Stock, Suppliers & Logistics',
    management: 'Management & Reporting'
  };
  let items = [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) items = saved.filter(x => x && catalog[x.id]);
  } catch (_) {}

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
    render();
  };
  const pricing = () => items.length === 8
    ? { setup: 1000, monthly: 100, label: 'Complete platform bundle' }
    : { setup: items.length * 200, monthly: items.length * 20, label: 'Individual function pricing' };
  const money = value => ' String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = message => {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cartToast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'cart-launcher';
  launcher.setAttribute('aria-label', 'Open quote request cart');
  launcher.innerHTML = '<span class="cart-launcher-icon" aria-hidden="true">▣</span><span>My cart</span><b id="cartCount">0</b>';
  document.body.appendChild(launcher);

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<section class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle"><div class="cart-drawer-head"><div><span class="cart-eyebrow">DONNINGER.AI</span><h2 id="cartTitle">Your automation cart</h2><p>Build a tailored implementation request.</p></div><button type="button" class="cart-close" aria-label="Close cart">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-pricing" id="cartPricing" hidden></div><div class="cart-empty" id="cartEmpty"><span>＋</span><strong>Your cart is empty</strong><p>Add automation functions from an assessment report or a function page.</p></div><div class="cart-request-form" id="cartRequestForm"><h3>Where should we send the quote?</h3><label>Your name<input id="cartName" type="text" autocomplete="name" placeholder="Full name"></label><label>Work email<input id="cartEmail" type="email" autocomplete="email" placeholder="you@company.com"></label><label>Business name <span>(optional)</span><input id="cartCompany" type="text" autocomplete="organization" placeholder="Company name"></label><label>Anything we should know? <span>(optional)</span><textarea id="cartNotes" rows="3" placeholder="Tell us about your priorities or existing tools."></textarea></label><button type="button" class="button button-primary cart-copy-request" id="cartCopyRequest">Copy quote request</button><p class="cart-disclaimer">Prices are in USD. Monthly subscription includes maintenance, support, upkeep and additions to Donninger.AI\u2019s product offering. Third-party software, messaging and AI usage charges are separate where applicable. This is a quote-request basket, not a payment checkout; no payment is taken.</p></div></section>';
  document.body.appendChild(overlay);

  const open = () => {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    overlay.querySelector('.cart-close').focus();
  };
  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    launcher.focus();
  };
  launcher.addEventListener('click', open);
  overlay.querySelector('.cart-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  const add = id => {
    if (!catalog[id]) return;
    if (items.some(item => item.id === id)) {
      toast(catalog[id] + ' is already in your cart.');
      open();
      return;
    }
    items.push({ id, title: catalog[id] });
    save();
    toast(catalog[id] + ' added to your cart.');
  };
  const remove = id => { items = items.filter(item => item.id !== id); save(); };

  function render() {
    const count = document.getElementById('cartCount');
    if (count) count.textContent = String(items.length);
    const list = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const form = document.getElementById('cartRequestForm');
    const pricingBox = document.getElementById('cartPricing');
    if (!list) return;
    list.innerHTML = items.map(item => '<article class="cart-item"><span class="cart-item-mark">✓</span><div><strong>' + escapeHtml(item.title) + '</strong><small>$200 setup · $20/month</small></div><button type="button" data-cart-remove="' + escapeHtml(item.id) + '" aria-label="Remove ' + escapeHtml(item.title) + '">Remove</button></article>').join('');
    empty.hidden = items.length > 0;
    form.hidden = items.length === 0;
    if (pricingBox) {
      const total = pricing();
      pricingBox.hidden = items.length === 0;
      pricingBox.innerHTML = '<div><span>' + total.label + '</span><small>' + (items.length === 8 ? 'Discounted all-functions bundle' : items.length + ' function' + (items.length === 1 ? '' : 's') + ' selected') + '</small></div><dl><dt>One-time setup</dt><dd>' + money(total.setup) + '</dd><dt>Monthly subscription</dt><dd>' + money(total.monthly) + ' / month</dd></dl>';
    }
    document.querySelectorAll('[data-cart-add]').forEach(button => {
      const selected = items.some(item => item.id === button.dataset.cartAdd);
      button.classList.toggle('is-in-cart', selected);
      button.textContent = selected ? 'Added to cart ✓' : 'Add to cart';
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-cart-add]');
    if (addButton) { add(addButton.dataset.cartAdd); render(); return; }
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) remove(removeButton.dataset.cartRemove);
  });

  const copyButton = overlay.querySelector('#cartCopyRequest');
  copyButton.addEventListener('click', async () => {
    const name = overlay.querySelector('#cartName').value.trim();
    const email = overlay.querySelector('#cartEmail').value.trim();
    const company = overlay.querySelector('#cartCompany').value.trim();
    const notes = overlay.querySelector('#cartNotes').value.trim();
    if (!items.length) return;
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Please enter your name and a valid work email.');
      (!name ? overlay.querySelector('#cartName') : overlay.querySelector('#cartEmail')).focus();
      return;
    }
    const summary = [
      'DONNINGER.AI — IMPLEMENTATION QUOTE REQUEST',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Business: ' + (company || 'Not provided'),
      '',
      'Automation functions requested:',
      ...items.map((item, i) => (i + 1) + '. ' + item.title + ' — $200 setup + $20/month'),
      '',
      'Pricing: ' + (items.length === 8 ? 'All-functions bundle — $1,000 one-time setup + $100/month' : money(pricing().setup) + ' one-time setup + ' + money(pricing().monthly) + '/month'),
      'Monthly subscription includes maintenance, support, upkeep and additions to Donninger.AI product offering.',
      'Third-party software, messaging and AI usage charges are separate where applicable.',
      '',
      'Additional information: ' + (notes || 'None provided'),
      '',
      'Please confirm scope, any applicable third-party costs and the implementation timeline.'
    ].join('\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(summary);
      else {
        const temp = document.createElement('textarea');
        temp.value = summary;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      toast('Quote request copied. You can now paste and send it.');
    } catch (_) {
      toast('Could not copy automatically. Please try again or copy the details manually.');
    }
  });
  render();
  window.DonningerCart = { add, open, getItems: () => items.slice() };
})(); + value.toLocaleString('en-US');
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = message => {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cartToast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  };

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'cart-launcher';
  launcher.setAttribute('aria-label', 'Open quote request cart');
  launcher.innerHTML = '<span class="cart-launcher-icon" aria-hidden="true">▣</span><span>My cart</span><b id="cartCount">0</b>';
  document.body.appendChild(launcher);

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<section class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle"><div class="cart-drawer-head"><div><span class="cart-eyebrow">DONNINGER.AI</span><h2 id="cartTitle">Your automation cart</h2><p>Build a tailored implementation request.</p></div><button type="button" class="cart-close" aria-label="Close cart">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-empty" id="cartEmpty"><span>＋</span><strong>Your cart is empty</strong><p>Add automation functions from an assessment report or a function page.</p></div><div class="cart-request-form" id="cartRequestForm"><h3>Where should we send the quote?</h3><label>Your name<input id="cartName" type="text" autocomplete="name" placeholder="Full name"></label><label>Work email<input id="cartEmail" type="email" autocomplete="email" placeholder="you@company.com"></label><label>Business name <span>(optional)</span><input id="cartCompany" type="text" autocomplete="organization" placeholder="Company name"></label><label>Anything we should know? <span>(optional)</span><textarea id="cartNotes" rows="3" placeholder="Tell us about your priorities or existing tools."></textarea></label><button type="button" class="button button-primary cart-copy-request" id="cartCopyRequest">Copy quote request</button><p class="cart-disclaimer">This is a request basket, not a payment checkout. No order is placed and no payment is taken. Copy the request summary to send it to Donninger.AI.</p></div></section>';
  document.body.appendChild(overlay);

  const open = () => {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    overlay.querySelector('.cart-close').focus();
  };
  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    launcher.focus();
  };
  launcher.addEventListener('click', open);
  overlay.querySelector('.cart-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  const add = id => {
    if (!catalog[id]) return;
    if (items.some(item => item.id === id)) {
      toast(catalog[id] + ' is already in your cart.');
      open();
      return;
    }
    items.push({ id, title: catalog[id] });
    save();
    toast(catalog[id] + ' added to your cart.');
  };
  const remove = id => { items = items.filter(item => item.id !== id); save(); };

  function render() {
    const count = document.getElementById('cartCount');
    if (count) count.textContent = String(items.length);
    const list = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const form = document.getElementById('cartRequestForm');
    if (!list) return;
    list.innerHTML = items.map(item => '<article class="cart-item"><span class="cart-item-mark">✓</span><div><strong>' + escapeHtml(item.title) + '</strong><small>Custom scope and quote to be confirmed</small></div><button type="button" data-cart-remove="' + escapeHtml(item.id) + '" aria-label="Remove ' + escapeHtml(item.title) + '">Remove</button></article>').join('');
    empty.hidden = items.length > 0;
    form.hidden = items.length === 0;
    document.querySelectorAll('[data-cart-add]').forEach(button => {
      const selected = items.some(item => item.id === button.dataset.cartAdd);
      button.classList.toggle('is-in-cart', selected);
      button.textContent = selected ? 'Added to cart ✓' : 'Add to cart';
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-cart-add]');
    if (addButton) { add(addButton.dataset.cartAdd); render(); return; }
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) remove(removeButton.dataset.cartRemove);
  });

  const copyButton = overlay.querySelector('#cartCopyRequest');
  copyButton.addEventListener('click', async () => {
    const name = overlay.querySelector('#cartName').value.trim();
    const email = overlay.querySelector('#cartEmail').value.trim();
    const company = overlay.querySelector('#cartCompany').value.trim();
    const notes = overlay.querySelector('#cartNotes').value.trim();
    if (!items.length) return;
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Please enter your name and a valid work email.');
      (!name ? overlay.querySelector('#cartName') : overlay.querySelector('#cartEmail')).focus();
      return;
    }
    const summary = [
      'DONNINGER.AI — IMPLEMENTATION QUOTE REQUEST',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Business: ' + (company || 'Not provided'),
      '',
      'Automation functions requested:',
      ...items.map((item, i) => (i + 1) + '. ' + item.title),
      '',
      'Additional information: ' + (notes || 'None provided'),
      '',
      'Please review the requested functions and provide a tailored scope, setup fee and ongoing support quote.'
    ].join('\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(summary);
      else {
        const temp = document.createElement('textarea');
        temp.value = summary;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      toast('Quote request copied. You can now paste and send it.');
    } catch (_) {
      toast('Could not copy automatically. Please try again or copy the details manually.');
    }
  });
  render();
  window.DonningerCart = { add, open, getItems: () => items.slice() };
})();