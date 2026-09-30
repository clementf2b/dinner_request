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
    foods: [['🍲', '火鍋'], ['🍜', '牛肉麵'], ['🍻', '酒吧'], ['🍢', '夜市小吃'], ['🥩', '烤肉'], ['🍥', '拉麵']],
    message: (date, food) => `我答應咗同你去約會 ♥\n日期：${date}\n想食：${food}`,
  };
  // --------------------

  const $ = id => document.getElementById(id);
  const card = $('card'), yes = $('yes'), no = $('no'), tease = $('tease');
  const steps = ['s1', 's2', 's3', 's4'].map($);
  const show = i => steps.forEach((s, k) => { s.hidden = k !== i; });

  // Step 1: the "No" button runs away
  let tries = 0;
  function flee(e) {
    if (e) e.preventDefault();
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
  const pad2 = n => String(n).padStart(2, '0');
  const t = new Date();
  date.min = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  // checkValidity() also rejects a past date typed in by hand, which `min` alone doesn't block
  const dateOk = () => !!date.value && date.checkValidity();
  date.addEventListener('input', () => { toFood.disabled = !dateOk(); });
  toFood.addEventListener('click', () => { if (dateOk()) show(2); });

  // Step 3: food
  const grid = $('foods'), toDone = $('toDone');
  let picked = null;
  CONFIG.foods.forEach(([ic, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'food'; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="ic" aria-hidden="true">${ic}</span><span></span>`;
    b.lastChild.textContent = name;
    b.addEventListener('click', () => {
      grid.querySelectorAll('.food').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      picked = name; toDone.disabled = false;
    });
    grid.appendChild(b);
  });

  // Step 4: summary + WhatsApp
  const decode = b64 => { try { return atob(b64); } catch { return ''; } };
  const week = ['日', '一', '二', '三', '四', '五', '六'];
  toDone.addEventListener('click', () => {
    if (!picked || !dateOk()) return;
    const [Y, M, D] = date.value.split('-').map(Number);
    const wd = week[new Date(Y, M - 1, D).getDay()];
    const dStr = `${M}月${D}日（星期${wd}）`;
    $('outDate').textContent = dStr;
    $('outFood').textContent = picked;
    const text = CONFIG.message(dStr, picked);
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

  $('restart').addEventListener('click', () => {
    tries = 0; tease.textContent = ''; yes.style.transform = '';
    date.value = ''; toFood.disabled = true;
    picked = null; toDone.disabled = true;
    grid.querySelectorAll('.food').forEach(x => x.setAttribute('aria-pressed', 'false'));
    $('copy').textContent = '複製訊息';
    show(0);
  });
})();
