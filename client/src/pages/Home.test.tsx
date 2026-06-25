import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";
import { renderWithProviders } from "../test/test-utils";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";
import type { Photo } from "../types";

vi.mock("../services/photo.service", () => ({
  photoService: {
    getPublicPhotos: vi.fn()
  }
}));

const mockGetPublicPhotos = vi.mocked(photoService.getPublicPhotos);

const samplePhotos: Photo[] = [
  {
    id: "photo-1",
    title: "Morning Window",
    description: null,
    imageUrl: "https://example.com/photo-1.jpg",
    thumbnailUrl: "https://example.com/thumb-1.jpg",
    publicId: "photo-1-public-id",
    width: 1200,
    height: 900,
    fileSize: 2048,
    visibility: "PUBLIC",
    userId: "user-1",
    user: {
      id: "user-1",
      name: "Ada",
      avatarUrl: null
    },
    tags: [],
    _count: {
      likes: 0,
      comments: 0
    },
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z"
  },
  {
    id: "photo-2",
    title: "Harbor Study",
    description: null,
    imageUrl: "https://example.com/photo-2.jpg",
    thumbnailUrl: "https://example.com/thumb-2.jpg",
    publicId: "photo-2-public-id",
    width: 1200,
    height: 900,
    fileSize: 2048,
    visibility: "PUBLIC",
    userId: "user-2",
    tags: [],
    _count: {
      likes: 0,
      comments: 0
    },
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z"
  },
  {
    id: "photo-3",
    title: "Green Room",
    description: null,
    imageUrl: "https://example.com/photo-3.jpg",
    thumbnailUrl: "https://example.com/thumb-3.jpg",
    publicId: "photo-3-public-id",
    width: 1200,
    height: 900,
    fileSize: 2048,
    visibility: "PUBLIC",
    userId: "user-3",
    tags: [],
    _count: {
      likes: 0,
      comments: 0
    },
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z"
  }
];

function setAuthenticated(isAuthenticated: boolean) {
  useAuthStore.setState({
    isAuthenticated,
    isLoading: false,
    token: isAuthenticated ? "token" : null,
    user: isAuthenticated
      ? {
          id: "user-1",
          name: "Ada",
          email: "ada@example.com",
          role: "USER",
          isActive: true,
          avatarUrl: null,
          bio: null,
          createdAt: "2026-06-20T00:00:00.000Z",
          updatedAt: "2026-06-20T00:00:00.000Z"
        }
      : null
  });
}

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthenticated(false);
    mockGetPublicPhotos.mockResolvedValue({
      photos: samplePhotos,
      total: samplePhotos.length,
      page: 1,
      pages: 1
    });
  });

  it("shows register and login calls to action when signed out", async () => {
    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: "FrameHub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore photos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /My Gallery/i })).not.toBeInTheDocument();
  });

  it("shows upload and gallery calls to action when signed in", async () => {
    setAuthenticated(true);

    renderWithProviders(<Home />);

    expect(await screen.findByRole("heading", { name: "FrameHub" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore photos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Upload$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My Gallery/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Register/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Login/i })).not.toBeInTheDocument();
  });

  it("does not direct signed-in users to register in the empty state", async () => {
    setAuthenticated(true);
    mockGetPublicPhotos.mockResolvedValue({
      photos: [],
      total: 0,
      page: 1,
      pages: 0
    });

    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Upload a public photo when you are ready/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /Upload photo/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Join FrameHub/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Register/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Login/i })).not.toBeInTheDocument();
  });
});
