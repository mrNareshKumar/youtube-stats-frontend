// utils/youtube.js

const API_KEY = import.meta.env.VITE_YT_API_KEY; // Replace with your actual key

export async function fetchChannelInfo(query) {
  const base = 'https://www.googleapis.com/youtube/v3';
  let channelId = query;

  if (!query.startsWith('UC')) {
    // Not a channel ID, search for channel
    const searchRes = await fetch(`${base}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&key=${API_KEY}`);
    const searchData = await searchRes.json();
    if (!searchData.items || !searchData.items.length) return null;
    channelId = searchData.items[0].snippet.channelId;
  }

  const detailsRes = await fetch(`${base}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`);
  const detailsData = await detailsRes.json();
  const latestVideoId = detailsData.items?.[0]?.id?.videoId || null;
  const channel = detailsData.items?.[0];

  if (!channel) return null;

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    countryCode: channel.snippet?.country?.toLowerCase() || null,
    thumbnail: channel.snippet.thumbnails.default.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount),  
    viewCount: parseInt(channel.statistics.viewCount),
    videoCount: parseInt(channel.statistics.videoCount),
    latestVideoId,
  };
  
}


