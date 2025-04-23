const webhookMap = {
  royal: process.env.ROYAL_WEBHOOK,
  aura: process.env.AURA_WEBHOOK,
  eggs: process.env.EGG_WEBHOOK
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const authKey = req.headers["x-auth-key"];
  if (authKey !== process.env.SECRET_KEY) return res.status(403).send("Forbidden");

  const body = await req.json();

  const webhookId = body.webhookId;
  if (!webhookMap[webhookId]) return res.status(400).send("Invalid webhookId");

  const { webhookId: _, ...cleanBody } = body; // Remove the routing key from payload

  await fetch(webhookMap[webhookId], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanBody)
  });

  res.status(200).send("Sent!");
}
