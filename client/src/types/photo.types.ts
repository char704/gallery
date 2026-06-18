import type { User } from "./auth.types";

export type Visibility = "PUBLIC" | "PRIVATE" | "UNLISTED";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  publicId: string;
  width: number;
  height: number;
  fileSize: number;
  visibility: Visibility;
  userId: string;
  user?: Pick<User, "id" | "name" | "avatarUrl">;
  tags?: Tag[];
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string | null;
  coverPhotoId?: string | null;
  coverPhoto?: Photo | null;
  visibility: Visibility;
  userId: string;
  user?: Pick<User, "id" | "name" | "avatarUrl">;
  photoCount?: number;
  _count?: {
    photos: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AlbumDetail extends Album {
  photos: Photo[];
}

export interface AlbumListResult {
  albums: Album[];
  total: number;
  page: number;
  pages: number;
}

export interface PhotoQueryParams {
  page?: number;
  limit?: number;
  tag?: string;
  sort?: "latest" | "oldest" | "popular";
  visibility?: Visibility;
}

export interface SearchQueryParams extends PhotoQueryParams {
  q?: string;
  userId?: string;
}

export interface PhotoListResult {
  photos: Photo[];
  total: number;
  page: number;
  pages: number;
}

export interface UploadPhotoPayload {
  file: File;
  title: string;
  description?: string;
  visibility: Visibility;
}
