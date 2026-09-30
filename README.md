# dinner_request

A date invitation page. It asks "要不要跟我去約會？", then lets the invitee pick a day and a food, and ends with WhatsApp and Telegram buttons that fill in the answer. It's plain HTML, CSS and JS, with no build step and nothing to install.

- `index.html`: the four steps (invite → date → food → done)
- `script.js`: page logic. Everything you'd normally change (phone number, Telegram username, food options, tease lines, message text) is in the `CONFIG` block at the top.
- `style.css`: styles

Run it locally:

```bash
python3 -m http.server 8765
```

To get each answer in a Google Sheet, follow the setup steps at the top of `apps-script/Code.gs`, then paste the Web app URL into `CONFIG.resultUrl`.

To deploy on Vercel, import this GitHub repo at vercel.com/new. Leave Framework as **Other** and don't set a build command. Every push to `main` then deploys automatically.
