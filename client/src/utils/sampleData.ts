import type { Album, Photo } from "../types";

const now = new Date().toISOString();

export const samplePhotos: Photo[] = [
  {
    id: "sample-forest",
    title: "Forest Light",
    description: "Morning light through a quiet trail.",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    publicId: "framehub/sample-forest",
    width: 1200,
    height: 800,
    fileSize: 1782579,
    visibility: "PUBLIC",
    userId: "demo-user",
    user: {
      id: "demo-user",
      name: "Avery Stone",
      avatarUrl: null
    },
    tags: [
      {
        id: "tag-nature",
        name: "Nature",
        slug: "nature",
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "sample-city",
    title: "City Lines",
    description: "Architecture study from a late afternoon walk.",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=80",
    publicId: "framehub/sample-city",
    width: 1200,
    height: 800,
    fileSize: 2097152,
    visibility: "PUBLIC",
    userId: "demo-user",
    user: {
      id: "demo-user",
      name: "Avery Stone",
      avatarUrl: null
    },
    tags: [
      {
        id: "tag-urban",
        name: "Urban",
        slug: "urban",
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "sample-coast",
    title: "Coastal Blue",
    description: "A low tide shoreline with clean horizon lines.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    publicId: "framehub/sample-coast",
    width: 1200,
    height: 800,
    fileSize: 1945600,
    visibility: "PUBLIC",
    userId: "demo-user",
    user: {
      id: "demo-user",
      name: "Mina Ray",
      avatarUrl: null
    },
    tags: [
      {
        id: "tag-travel",
        name: "Travel",
        slug: "travel",
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  }
];

export const sampleAlbums: Album[] = [
  {
    id: "album-weekend",
    name: "Weekend edits",
    description: "A short set ready for review.",
    coverPhotoId: samplePhotos[0].id,
    coverPhoto: samplePhotos[0],
    visibility: "PRIVATE",
    userId: "demo-user",
    photoCount: 12,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "album-public",
    name: "Public picks",
    description: "Shared gallery highlights.",
    coverPhotoId: samplePhotos[2].id,
    coverPhoto: samplePhotos[2],
    visibility: "PUBLIC",
    userId: "demo-user",
    photoCount: 8,
    createdAt: now,
    updatedAt: now
  }
];
