const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/api/subs/:channelId", async (req, res) => {
  const { channelId } = req.params;
  const { bypassCache, cacheTTL = 5000 } = req.query;

  try {
    // Prepare request headers for socialcounts.org
    const headers = {
      'x-use-cache': bypassCache === 'false' ? 'false' : 'true',
      'x-cache-ttl': cacheTTL.toString(),
    };

    // Fetch data from SocialCounts API
    const response = await axios.get(
      `https://api.socialcounts.org/youtube-live-subscriber-count/${channelId}`,
      { headers }
    );

    const subCount = response.data.est_sub;
    const fromCache = response.headers['x-from-cache'] === 'true';

    // ✅ Forward the cache info to frontend
    res.set('x-from-cache', String(fromCache));

    // ✅ Optional: include in body too
    res.json({
      subscriberCount: subCount,
      fromCache: fromCache
    });

  } catch (error) {
    console.error("❌ Error fetching sub count:", error.message);
    res.status(500).json({ error: "Failed to fetch subscriber count" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
