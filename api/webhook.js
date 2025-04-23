export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  // Tag-to-webhook routing
  const TAG_ROUTING = {
    event1: process.env.AURA_WEBHOOK_URL,
    event2: process.env.ROYAL_WEBHOOK_URL,
    event3: process.env.EGG_WEBHOOK_URL,
  };

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  // Optional: check secret key (you can disable this if needed)
  const authKey = req.headers["x-auth-key"];
  if (authKey !== SECRET_KEY) {
    return res.status(403).send("Forbidden");
  }

  const { tag, ...payload } = req.body;
  const webhookUrl = TAG_ROUTING[tag];

  if (!webhookUrl) {
    return res.status(400).send("Invalid tag");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.text();
    res.status(200).send(`Message sent to tag "${tag}"`);
  } catch (error) {
    console.error("Failed to send webhook:", error);
    res.status(500).send("Webhook failed");
  }
}
