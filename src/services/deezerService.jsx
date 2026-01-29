// services/deezerService.js
const DEEZER_BASE_URL = "https://api.deezer.com";

export class DeezerService {
  constructor() {
    this.baseUrl = DEEZER_BASE_URL;
  }

  async searchTracks(query, limit = 15) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      );
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return [];
      }

      return data.data.map((track) => ({
        id: track.id,
        title: track.title,
        name: track.title,
        artist: { name: track.artist.name },
        album: {
          title: track.album.title,
          cover_big: track.album.cover_big,
          cover_medium: track.album.cover_medium,
          cover_small: track.album.cover_small,
        },
        preview: track.preview,
        duration: track.duration,
        link: track.link,
        url: track.link,
        images: {
          large: track.album.cover_big,
          medium: track.album.cover_medium,
          small: track.album.cover_small,
        },
      }));
    } catch (error) {
      console.error("Deezer search error:", error);
      return [];
    }
  }

  async getTrackInfo(trackId) {
    try {
      const response = await fetch(`${this.baseUrl}/track/${trackId}`);
      const track = await response.json();

      return {
        id: track.id,
        title: track.title,
        name: track.title,
        artist: { name: track.artist.name },
        album: {
          title: track.album.title,
          cover_big: track.album.cover_big,
          cover_medium: track.album.cover_medium,
          cover_small: track.album.cover_small,
        },
        preview: track.preview,
        duration: track.duration,
        link: track.link,
        images: {
          large: track.album.cover_big,
          medium: track.album.cover_medium,
          small: track.album.cover_small,
        },
      };
    } catch (error) {
      console.error("Deezer track info error:", error);
      return null;
    }
  }

  async getArtistTopTracks(artistId, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/artist/${artistId}/top?limit=${limit}`,
      );
      const data = await response.json();

      return data.data.map((track) => ({
        id: track.id,
        title: track.title,
        name: track.title,
        artist: { name: track.artist.name },
        album: {
          title: track.album.title,
          cover_big: track.album.cover_big,
          cover_medium: track.album.cover_medium,
          cover_small: track.album.cover_small,
        },
        preview: track.preview,
        duration: track.duration,
        link: track.link,
        images: {
          large: track.album.cover_big,
          medium: track.album.cover_medium,
          small: track.album.cover_small,
        },
      }));
    } catch (error) {
      console.error("Deezer artist top tracks error:", error);
      return [];
    }
  }

  async getChartTracks(limit = 20) {
    try {
      const response = await fetch(
        `${this.baseUrl}/chart/0/tracks?limit=${limit}`,
      );
      const data = await response.json();

      return data.data.map((track) => ({
        id: track.id,
        title: track.title,
        name: track.title,
        artist: { name: track.artist.name },
        album: {
          title: track.album.title,
          cover_big: track.album.cover_big,
          cover_medium: track.album.cover_medium,
          cover_small: track.album.cover_small,
        },
        preview: track.preview,
        duration: track.duration,
        link: track.link,
        images: {
          large: track.album.cover_big,
          medium: track.album.cover_medium,
          small: track.album.cover_small,
        },
      }));
    } catch (error) {
      console.error("Deezer chart error:", error);
      return [];
    }
  }

  async getGenreTracks(genreId, limit = 15) {
    try {
      const response = await fetch(
        `${this.baseUrl}/chart/${genreId}/tracks?limit=${limit}`,
      );
      const data = await response.json();

      return data.data.map((track) => ({
        id: track.id,
        title: track.title,
        name: track.title,
        artist: { name: track.artist.name },
        album: {
          title: track.album.title,
          cover_big: track.album.cover_big,
          cover_medium: track.album.cover_medium,
          cover_small: track.album.cover_small,
        },
        preview: track.preview,
        duration: track.duration,
        link: track.link,
        images: {
          large: track.album.cover_big,
          medium: track.album.cover_medium,
          small: track.album.cover_small,
        },
      }));
    } catch (error) {
      console.error("Deezer genre tracks error:", error);
      return [];
    }
  }
}

// Genre IDs for Deezer
export const DEEZER_GENRES = {
  pop: 132,
  rock: 152,
  "hip hop": 116,
  rap: 116,
  electronic: 106,
  dance: 113,
  indie: 145,
  alternative: 85,
  metal: 144,
  jazz: 129,
  classical: 98,
  folk: 99,
  soul: 105,
  "r&b": 165,
  reggae: 144,
  country: 84,
  blues: 142,
  lofi: 464,
  kpop: 161,
  latin: 86,
};

// Singleton instance
let deezerService = null;

export const getDeezerService = () => {
  if (!deezerService) {
    deezerService = new DeezerService();
  }
  return deezerService;
};

export const searchDeezerTracks = async (query, limit = 15) => {
  const service = getDeezerService();
  return service.searchTracks(query, limit);
};

export const getDeezerChartTracks = async (limit = 20) => {
  const service = getDeezerService();
  return service.getChartTracks(limit);
};

export const getDeezerGenreTracks = async (genre, limit = 15) => {
  const service = getDeezerService();
  const genreId = DEEZER_GENRES[genre.toLowerCase()] || 0;
  return service.getGenreTracks(genreId, limit);
};
