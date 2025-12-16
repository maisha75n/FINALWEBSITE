import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.json({
      reply: "How can I help you with your prescriptions or wellness today?",
    });
  }

  const text = message.toLowerCase();
  let reply = "I'm here to help. You can ask about refills, delivery, pharmacies, or wellness tracking.";

  if (text.includes("refill")) {
    reply =
      "If a medication is due soon, you'll see it highlighted on your Dashboard. You can request a refill directly from there.";
  } else if (text.includes("delivery")) {
    reply =
      "Some pharmacies offer prescription delivery. Check the Pharmacies section to see which locations support delivery near you.";
  } else if (text.includes("side effect")) {
    reply =
      "If you're experiencing side effects, it's best to contact your pharmacist or healthcare provider for guidance.";
  } else if (text.includes("pharmacy")) {
    reply =
      "You can browse nearby pharmacies, view hours, and get directions in the Pharmacies section.";
  } else if (text.includes("wellness") || text.includes("mood") || text.includes("water")) {
    reply =
      "The Wellness section helps you track mood, hydration, and daily habits to support overall health.";
  } else if (text.includes("help")) {
    reply =
      "I can help you manage prescriptions, refills, delivery options, and wellness tracking.";
  }

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`PharmaCare backend running on http://localhost:${PORT}`);
});
