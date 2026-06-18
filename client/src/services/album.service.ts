import { apiRequest } from "./api";
import type { Album, AlbumDetail, AlbumListResult, Photo, Visibility } from "../types";

interface RawAlbum extends Album {
  photos?: Array<{
    photo: Photo;
  }>;
}

function toQueryString(params: { page?: number; limit?: number } = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function normalizeAlbum(album: RawAlbum): Album {
  return {
    ...album,
    photoCount: album.photoCount ?? album._count?.photos ?? 0
  };
}

function normalizeAlbumList(result: AlbumListResult): AlbumListResult {
  return {
    ...result,
    albums: result.albums.map((album) => normalizeAlbum(album as RawAlbum))
  };
}

function normalizeAlbumDetail(album: RawAlbum): AlbumDetail {
  return {
    ...normalizeAlbum(album),
    photos: album.photos?.map((item) => item.photo) ?? []
  };
}

export const albumService = {
  async list(token: string, page = 1, limit = 12): Promise<AlbumListResult> {
    const result = await apiRequest<AlbumListResult>(`/albums${toQueryString({ page, limit })}`, {
      token
    });

    return normalizeAlbumList(result);
  },

  async publicList(page = 1, limit = 12): Promise<AlbumListResult> {
    const result = await apiRequest<AlbumListResult>(`/albums/public${toQueryString({ page, limit })}`);
    return normalizeAlbumList(result);
  },

  async detail(albumId: string, token?: string | null): Promise<AlbumDetail> {
    const album = await apiRequest<RawAlbum>(`/albums/${albumId}`, {
      token: token ?? undefined
    });

    return normalizeAlbumDetail(album);
  },

  async create(
    payload: {
      name: string;
      description?: string | null;
      visibility: Visibility;
    },
    token: string
  ): Promise<Album> {
    const album = await apiRequest<RawAlbum>("/albums", {
      method: "POST",
      body: payload,
      token
    });

    return normalizeAlbum(album);
  },

  async update(
    albumId: string,
    payload: {
      name?: string;
      description?: string | null;
      visibility?: Visibility;
      coverPhotoId?: string | null;
    },
    token: string
  ): Promise<Album> {
    const album = await apiRequest<RawAlbum>(`/albums/${albumId}`, {
      method: "PATCH",
      body: payload,
      token
    });

    return normalizeAlbum(album);
  },

  addPhoto(albumId: string, photoId: string, token: string): Promise<unknown> {
    return apiRequest(`/albums/${albumId}/photos`, {
      method: "POST",
      body: {
        photoId
      },
      token
    });
  },

  removePhoto(albumId: string, photoId: string, token: string): Promise<{ removed: boolean }> {
    return apiRequest<{ removed: boolean }>(`/albums/${albumId}/photos/${photoId}`, {
      method: "DELETE",
      token
    });
  },

  delete(albumId: string, token: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/albums/${albumId}`, {
      method: "DELETE",
      token
    });
  }
};
