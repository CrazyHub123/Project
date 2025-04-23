export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  // Internal webhook map
  const WEBHOOKS = {
    aura: process.env.AURA_WEBHOOK_URL,
    royal: process.env.ROYAL_WEBHOOK_URL,
    egg: process.env.EGG_WEBHOOK_URL,
  };

  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const authKey = req.headers["x-auth-key"];
  if (authKey !== SECRET_KEY) return res.status(403).send("Forbidden");

  const { category, ...payload } = req.body;
  const selectedUrl = WEBHOOKS[category];

  if (!selectedUrl) return res.status(400).send("Invalid category");

  try {
    const response = await fetch(selectedUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.text();
    res.status(200).send("Message sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send webhook");
  }
}
