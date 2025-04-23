export default async function handler(req, res) {
  const SECRET_KEY = process.env.SECRET_KEY;

  // Define the available webhooks in a map
  const webhookMap = {
    royal: process.env.ROYAL_WEBHOOK_URL,  // Define the URL for the 'royal' webhook
    aura: process.env.AURA_WEBHOOK_URL,    // Define the URL for the 'aura' webhook
    eggs: process.env.EGG_WEBHOOK_URL      // Define the URL for the 'eggs' webhook
  };

  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const authKey = req.headers["x-auth-key"];
  if (authKey !== SECRET_KEY) {
    return res.status(403).send("Forbidden: Invalid key");
  }

  // Extract the 'webhookId' from the request body
  const { webhookId, ...messageBody } = req.body;

  // Check if the webhookId is valid
  if (!webhookMap[webhookId]) {
    return res.status(400).send("Invalid webhookId");
  }

  // Get the webhook URL based on the provided webhookId
  const webhookUrl = webhookMap[webhookId];

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageBody),
    });

    const result = await response.text();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Failed to send webhook");
  }
}
