import { Buffer } from 'buffer';

export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  // Define routing based on 'tag' value
  const TAG_ROUTING = {
    event1: process.env.AURA_WEBHOOK_URL,
    event2: process.env.EGG_WEBHOOK_URL,
  };

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const authKey = req.headers["x-auth-key"];
  if (authKey !== SECRET_KEY) {
    return res.status(403).send("Forbidden: Invalid key");
  }

  try {
    // Decode the Base64-encoded message and URL
    const decodedPayload = Buffer.from(req.body.data, 'base64').toString('utf8');
    const decodedUrl = Buffer.from(req.body.url, 'base64').toString('utf8');
    
    // Parse the decoded payload as JSON
    const parsedPayload = JSON.parse(decodedPayload);
    
    // Extract tag from parsed payload
    const { tag, ...rest } = parsedPayload;

    // Get the correct webhook URL based on tag, fallback to decoded URL if needed
    const webhookUrl = TAG_ROUTING[tag] || decodedUrl;
    if (!webhookUrl) {
      return res.status(400).send("Invalid tag or URL");
    }

    // Forward the message to the correct webhook URL
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rest),
    });

    const result = await response.text();
    res.status(200).send(`Message sent to ${tag}: ${result}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send message");
  }
}
