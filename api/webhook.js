import { Buffer } from 'buffer';

export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  const TAG_ROUTING = {
    event1: process.env.AURA_WEBHOOK_URL,
    event2: process.env.ROYAL_WEBHOOK_URL,
  };

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const authKey = req.headers["x-auth-key"];
  if (authKey !== SECRET_KEY) {
    return res.status(403).send("Forbidden: Invalid key");
  }

  try {
    // Decode base64 payload
    const decodedJson = Buffer.from(req.body.data, "base64").toString("utf8");
    const { tag, ...payload } = JSON.parse(decodedJson);

    // Check if the tag is valid and send to the correct webhook
    const webhookUrl = TAG_ROUTING[tag];
    if (!webhookUrl) {
      return res.status(400).send("Invalid tag");
    }

    // Send the decoded message to the relevant webhook URL
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.text();
    res.status(200).send(`Message sent to ${tag}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send message");
  }
}
