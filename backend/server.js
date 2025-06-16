const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/api/subs/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    const response = await axios.get(
      `https://api.socialcounts.org/youtube-live-subscriber-count/${channelId}`
    );
    const subCount = response.data.est_sub;
    res.json({ subscriberCount: subCount });
  } catch (error) {
    console.error("Error fetching sub count:", error.message);
    res.status(500).json({ error: "Failed to fetch subscriber count" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});