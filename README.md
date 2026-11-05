# 好初四店餐點評分 App

手機開網址 → PIN 登入 → 評分 → 送出 → 寫進 Notion「餐點評分紀錄（試作）」。

- `index.html`：App 本體（純靜態）
- `api/submit.js`：Vercel function，呼叫 Notion API
- 環境變數：`NOTION_TOKEN`（Notion 整合「評分 App」的 secret，只放 Vercel，不進 git）
- 部署：Vercel，Framework Preset = Other
- 交接書：Notion「🚀 評分 App 部署交接書」
