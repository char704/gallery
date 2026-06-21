import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import PhotoDetail from "./PhotoDetail";
import { usePhoto } from "../hooks/usePhotos";
import { photoService } from "../services/photo.service";
import { renderWithProviders } from "../test/test-utils";
import type { Photo } from "../types";

vi.mock("../hooks/usePhotos", () => ({
  usePhoto: vi.fn()
}));

vi.mock("../services/photo.service", () => ({
  photoService: {
    getLikeSummary: vi.fn(),
    updatePhoto: vi.fn(),
    deletePhoto: vi.fn(),
    updatePhotoTags: vi.fn(),
    likePhoto: vi.fn(),
    unlikePhoto: vi.fn(),
    getComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn()
  }
}));

const mockUsePhoto = vi.mocked(usePhoto);
const mockPhotoService = vi.mocked(photoService);

const samplePhoto: Photo = {
  id: "photo-1",
  title: "Detail image",
  description: null,
  imageUrl: "https://res.cloudinary.com/dpl2u9uak/image/upload/v1/framehub/user/original.jpg",
  thumbnailUrl: "https://res.cloudinary.com/dpl2u9uak/image/upload/c_fill,w_300/framehub/user/original.jpg",
  publicId: "framehub/user/original",
  width: 1600,
  height: 1200,
  fileSize: 337000,
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
};

function renderPhotoDetail() {
  renderWithProviders(
    <Routes>
      <Route path="/photos/:photoId" element={<PhotoDetail />} />
    </Routes>,
    {
      initialEntries: ["/photos/photo-1"]
    }
  );
}

describe("PhotoDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePhoto.mockReturnValue({
      data: samplePhoto,
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof usePhoto>);
    mockPhotoService.getLikeSummary.mockResolvedValue({
      count: 0,
      isLiked: false
    });
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses an optimized Cloudinary URL for the main image", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "dpl2u9uak");

    renderPhotoDetail();

    expect(screen.getByRole("img", { name: "Detail image" })).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dpl2u9uak/image/upload/w_1400,c_limit,q_auto,f_auto/framehub/user/original"
    );
  });

  it("falls back to the original image URL when optimized URL generation fails", () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "");

    renderPhotoDetail();

    expect(screen.getByRole("img", { name: "Detail image" })).toHaveAttribute("src", samplePhoto.imageUrl);
  });
});
