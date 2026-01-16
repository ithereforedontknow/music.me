export class YouTubeService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async searchVideo(query, maxResults = 1) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) throw new Error('YouTube API error');

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        return {
          videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: data.items[0].snippet.thumbnails.medium.url,
        };
      }
      return null;
    } catch (error) {
      console.error('YouTube search failed:', error);
      return null;
    }
  }
}

// In your recommendation service, add YouTube preview URLs:
async addYouTubePreviews(tracks) {
  const youtubeKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!youtubeKey) return tracks;

  const youtubeService = new YouTubeService(youtubeKey);

  // Process only a few tracks to avoid rate limiting
  const tracksToProcess = tracks.slice(0, 5);

  for (const track of tracksToProcess) {
    try {
      const query = `${track.name} ${track.artist?.name} official audio`;
      const videoInfo = await youtubeService.searchVideo(query);
      if (videoInfo) {
        track.preview = videoInfo.url;
        track.youtubeId = videoInfo.videoId;
      }
    } catch (error) {
      console.error(`Failed to get YouTube preview for ${track.name}:`, error);
    }
  }

  return tracks;
}
