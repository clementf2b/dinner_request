(() => {
  // ---- Edit these ----
  const CONFIG = {
    // ponytail: Base64 only hides these from scrapers, anyone reading the source can decode them.
    // Upgrade path: a Vercel function that redirects using env vars.
    // 👉 Put your WhatsApp number here, Base64-encoded:
    //    1. In Terminal run: printf 85291234567 | base64   (your number: country code + digits only)
    //    2. Paste the output (e.g. ODUyOTEyMzQ1Njc=) between the quotes: phoneB64: 'ODUyOTEyMzQ1Njc='
    //    Leave empty = WhatsApp button opens the share sheet and the invitee picks who to send to
    phoneB64: 'ODUyOTQzMjM0MTY=',
    telegramB64: 'bmcyYjMw', // Telegram username without @, encode with: printf yourname | base64
    teases: ['真的嗎？', '再想想嘛', '按不到的啦', '你確定？', '不可以說不要', '好啦好啦就答應吧'],
    maxFoods: 2, // how many foods the invitee can pick
    // [icon, name]: icon is an emoji or inline SVG markup (trusted, rendered as HTML)
    foods: [
      ['🍲', '火鍋'],
      ['🧋', '台式美食'],
      ['<svg width="24" height="24" viewBox="0 0 26 26"><ellipse cx="12" cy="22.5" rx="10" ry="2" fill="#e9d6c8"/><path d="M18.5 10.5 q5 0 4.5 3.8 q-.5 3 -5 3" stroke="#fff" stroke-width="2.2" fill="none"/><path d="M18.5 10.5 q5 0 4.5 3.8 q-.5 3 -5 3" stroke="#c9b3a3" stroke-width="1" fill="none"/><path d="M3 9 h18 q0 12 -9 12.5 q-9 -.5 -9 -12.5 Z" fill="#fff" stroke="#c9b3a3" stroke-width="1"/><ellipse cx="12" cy="9.2" rx="8.6" ry="2.6" fill="#b07a52"/><path d="M12 11 c-2.6 -1.6 -2.2 -3.4 -.8 -3.4 c.5 0 .8 .4 .8 .7 c0 -.3 .3 -.7 .8 -.7 c1.4 0 1.8 1.8 -.8 3.4 Z" fill="#f6ead8"/><path d="M9 5.5 q-1 -1.5 0 -3 M12 5.5 q-1 -1.5 0 -3 M15 5.5 q-1 -1.5 0 -3" stroke="#c9b3a3" stroke-width=".9" fill="none" stroke-linecap="round"/></svg>', 'Cafe'],
      ['🍣', '壽司'],
      ['<svg width="24" height="24" viewBox="0 0 26 26"><ellipse cx="13" cy="12" rx="11.5" ry="3.6" fill="#8fb24a"/><path d="M1.5 12 h23 q-1 9.5 -11.5 10 q-10.5 -.5 -11.5 -10 Z" fill="#fff" stroke="#d8c8bc" stroke-width="1"/><path d="M4 19.5 q9 3 18 0" stroke="#7b9fd0" stroke-width="1.2" fill="none"/><ellipse cx="13" cy="12" rx="10" ry="2.8" fill="#9cc15a"/><ellipse cx="9" cy="11.6" rx="2" ry="1" fill="#f3e3c4"/><ellipse cx="16" cy="12.6" rx="1.8" ry=".9" fill="#f3e3c4"/><circle cx="12.5" cy="12.8" r=".9" fill="#e0402f"/><circle cx="18.5" cy="11.4" r=".8" fill="#e0402f"/><path d="M12 10.5 q2.4 -3.6 5.2 -2.4 q-1.6 3 -5.2 2.4 Z" fill="#2f7d32"/><path d="M12 10.5 q2 -1.4 4.4 -2" stroke="#1f5d24" stroke-width=".5" fill="none"/></svg>', '泰式美食'], // Thai green curry
      ['🍜', '拉麵'],
    ],
    message: (date, time, food) => `我答應咗同你去約會 ♥\n日期：${date}\n時間：${time}\n想食：${food}`,
  };
  // --------------------

  const $ = id => document.getElementById(id);
  const card = $('card'), yes = $('yes'), no = $('no'), tease = $('tease');
  const steps = ['s1', 's2', 's3', 's4'].map($);
  const show = i => steps.forEach((s, k) => { s.hidden = k !== i; });

  // Step 1: the "No" button runs away
  let tries = 0;
  function flee(e) {
    e.preventDefault();
    const cr = card.getBoundingClientRect();
    if (!no.classList.contains('loose')) {
      const nr = no.getBoundingClientRect();
      no.style.left = (nr.left - cr.left) + 'px';
      no.style.top = (nr.top - cr.top) + 'px';
      no.classList.add('loose');
    }
    const w = no.offsetWidth, h = no.offsetHeight, pad = 12;
    const yr = yes.getBoundingClientRect();
    let x, y, hitYes, n = 0;
    do {
      x = pad + Math.random() * (cr.width - w - pad * 2);
      y = pad + Math.random() * (cr.height - h - pad * 2);
      n++;
      hitYes = x < yr.right - cr.left + 8 && x + w > yr.left - cr.left - 8 &&
                   y < yr.bottom - cr.top + 8 && y + h > yr.top - cr.top - 8;
    } while (hitYes && n < 30);
    no.style.left = x + 'px';
    no.style.top = y + 'px';
    tease.textContent = CONFIG.teases[tries % CONFIG.teases.length];
    tries++;
    yes.style.transform = `scale(${Math.min(1 + tries * 0.08, 1.6)})`;
  }
  no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') flee(e); });
  no.addEventListener('pointerdown', flee);
  no.addEventListener('click', flee); // keyboard / anything else: still never proceeds

  yes.addEventListener('click', () => {
    no.classList.remove('loose'); no.style.left = no.style.top = '';
    show(1);
  });

  // Step 2: date
  const date = $('date'), toFood = $('toFood');
  // Built by hand: toLocaleDateString('en-CA') isn't YYYY-MM-DD on iOS Safari
  const t = new Date(), pad2 = n => String(n).padStart(2, '0');
  date.min = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  // iOS Safari's picker ignores `min` and its checkValidity() doesn't enforce it, so compare directly
  // (YYYY-MM-DD strings sort the same as dates)
  const dateOk = () => !!date.value && date.value >= date.min;
  const week = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = () => { const [Y, M, D] = date.value.split('-').map(Number); return week[new Date(Y, M - 1, D).getDay()]; };
  const slots = [...document.querySelectorAll('input[name="slot"]')];
  const slotStr = () => slots.filter(c => c.checked).map(c => c.value).join('、');
  // Needs a valid date and at least one time slot
  const syncDateStep = () => { toFood.disabled = !dateOk() || !slotStr(); };
  slots.forEach(c => c.addEventListener('change', syncDateStep));
  date.addEventListener('input', () => {
    syncDateStep();
    $('dateHint').hidden = !date.value || dateOk();
    $('weekday').textContent = date.value ? `（星期${weekday()}）` : '';
  });
  toFood.addEventListener('click', () => show(2)); // only enabled when the date is valid

  // Step 3: food
  const grid = $('foods'), toDone = $('toDone');
  let picked = []; // in pick order, so the oldest is dropped when over the limit
  const syncFoods = () => {
    grid.querySelectorAll('.food').forEach(x => x.setAttribute('aria-pressed', picked.includes(x.dataset.name)));
    toDone.disabled = !picked.length;
  };
  CONFIG.foods.forEach(([ic, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'food'; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="ic" aria-hidden="true">${ic}</span><span></span>`;
    b.lastChild.textContent = name; b.dataset.name = name;
    b.addEventListener('click', () => {
      if (picked.includes(name)) picked = picked.filter(x => x !== name);
      else picked = [...picked, name].slice(-CONFIG.maxFoods);
      syncFoods();
    });
    grid.appendChild(b);
  });

  // Step 4: summary + WhatsApp
  const decode = b64 => { try { return atob(b64); } catch { return ''; } };
  toDone.addEventListener('click', () => {
    const [, M, D] = date.value.split('-').map(Number);
    const dStr = `${M}月${D}日（星期${weekday()}）`;
    $('outDate').textContent = dStr;
    const foodStr = picked.join('、');
    $('outFood').textContent = foodStr;
    $('outTime').textContent = slotStr();
    const text = CONFIG.message(dStr, slotStr(), foodStr);
    $('msg').textContent = text;
    // Empty or malformed number → WhatsApp share sheet instead of a dead link
    const phone = decode(CONFIG.phoneB64);
    $('wa').href = `https://wa.me/${/^\d{8,15}$/.test(phone) ? phone : ''}?text=` + encodeURIComponent(text);
    // Opens a chat with the username; clients that ignore ?text= still open the chat, and the copy button covers the text
    $('tg').href = `https://t.me/${decode(CONFIG.telegramB64)}?text=` + encodeURIComponent(text);
    show(3);
  });

  $('copy').addEventListener('click', async () => {
    const txt = $('msg').textContent, btn = $('copy');
    try { await navigator.clipboard.writeText(txt); btn.textContent = '已複製'; }
    catch { const r = document.createRange(); r.selectNodeContents($('msg')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = '已選取，請手動複製'; }
  });

  // 重新揀 (steps 2–4): back to the date step with date and food cleared; the invite's "yes" stays answered
  document.querySelectorAll('.restart').forEach(b => b.addEventListener('click', () => {
    date.value = ''; $('weekday').textContent = ''; $('dateHint').hidden = true; toFood.disabled = true;
    slots.forEach(c => { c.checked = true; });
    picked = []; syncFoods();
    $('copy').textContent = '複製訊息';
    show(1);
  }));
})();
