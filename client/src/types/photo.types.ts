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
  photoCount?: number;
  createdAt: string;
  updatedAt: string;
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
