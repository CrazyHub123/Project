export default async function handler(req, res) {
   const SECRET_KEY = process.env.SECRET_KEY;
   const DISCORD_WEBHOOK_URL = process.env.ROYAL_WEBHOOK_URL;
 
   if (req.method !== "POST") {
     return res.status(405).send("Only POST allowed");
   }
 
   const authKey = req.headers["x-auth-key"];
   if (authKey !== SECRET_KEY) {
     return res.status(403).send("Forbidden: Invalid key");
   }
 
   try {
     const response = await fetch(DISCORD_WEBHOOK_URL, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(req.body),
     });
 
     const result = await response.text();
     res.status(200).send(result);
   } catch (error) {
     res.status(500).send("Failed to send webhook");
   }
 }
