// 收 App 的 {meta, props}，轉成 Notion properties 寫進「餐點評分紀錄（試作）」
const DB_ID = "aa21e46d-3c91-425c-b0f2-9b3e431bdbe9";
const MULTI = ["一票否決", "外觀問題", "口感問題", "調味方向", "飲品問題", "外送問題", "扣分原因"];
const NUM = ["送達分鐘數", "實測重量（g）"];
const TEXT = ["照片連結", "外觀描述", "口感描述", "風味描述", "份量描述", "外送描述"];
const TITLE = "評論總結";

function toNotion(props) {
  const out = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (v === "" || v == null || (Array.isArray(v) && !v.length)) continue;
    if (k === TITLE) out[k] = { title: [{ text: { content: String(v).slice(0, 2000) } }] };
    else if (MULTI.includes(k)) out[k] = { multi_select: [].concat(v).map(name => ({ name: String(name) })) };
    else if (NUM.includes(k)) { const n = Number(v); if (!isNaN(n)) out[k] = { number: n }; }
    else if (TEXT.includes(k)) out[k] = { rich_text: [{ text: { content: String(v).slice(0, 2000) } }] };
    else out[k] = { select: { name: String(v) } }; // 評測員、店別、品項、取餐方式、份量感受、會想再點嗎、各維度手動分數
  }
  return out;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  if (!process.env.NOTION_TOKEN) return res.status(500).json({ ok: false, error: "伺服器沒設 NOTION_TOKEN" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const properties = toNotion(body.props);
  if (!properties[TITLE] || !properties["品項"]) return res.status(400).json({ ok: false, error: "缺評論總結或品項" });
  try {
    const r = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ ok: false, error: `Notion ${r.status}: ${j.message || ""}`.slice(0, 300) });
    return res.status(200).json({ ok: true, url: j.url });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e.message || e).slice(0, 200) });
  }
};

module.exports.toNotion = toNotion;
