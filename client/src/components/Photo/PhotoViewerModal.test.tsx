import type React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { PhotoViewerModal } from "./PhotoViewerModal";
import { usePhoto } from "../../hooks/usePhotos";
import { photoService } from "../../services/photo.service";
import { useAuthStore } from "../../store/authStore";
import { renderWithProviders } from "../../test/test-utils";
import type { Photo, PhotoComment, User } from "../../types";

vi.mock("focus-trap-react", () => ({
  default: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children }: { children: (helpers: { zoomIn: () => void; zoomOut: () => void; resetTransform: () => void }) => React.ReactNode }) => (
    <div>{children({ zoomIn: () => undefined, zoomOut: () => undefined, resetTransform: () => undefined })}</div>
  ),
  TransformComponent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock("../../hooks/usePhotos", () => ({
  usePhoto: vi.fn()
}));

vi.mock("../../services/photo.service", () => ({
  photoService: {
    getLikeSummary: vi.fn(),
    likePhoto: vi.fn(),
    unlikePhoto: vi.fn(),
    getComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn()
  }
}));

const mockUsePhoto = vi.mocked(usePhoto);
const mockPhotoService = vi.mocked(photoService);

const sampleUser: User = {
  id: "user-1",
  name: "Ada",
  email: "ada@example.test",
  avatarUrl: null,
  bio: null,
  role: "USER",
  isActive: true,
  createdAt: "2026-06-20T00:00:00.000Z",
  updatedAt: "2026-06-20T00:00:00.000Z"
};

const samplePhoto: Photo = {
  id: "photo-1",
  title: "Modal image",
  description: "A photo in the viewer.",
  imageUrl: "https://example.test/photo.jpg",
  thumbnailUrl: "https://example.test/thumb.jpg",
  publicId: "framehub/user/modal",
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

const createdComment: PhotoComment = {
  id: "comment-1",
  content: "Beautiful frame",
  photoId: "photo-1",
  userId: "user-1",
  user: {
    id: "user-1",
    name: "Ada",
    avatarUrl: null
  },
  createdAt: "2026-06-20T00:00:00.000Z",
  updatedAt: "2026-06-20T00:00:00.000Z"
};

function renderViewer() {
  renderWithProviders(
    <Routes>
      <Route path="/photos/:photoId" element={<PhotoViewerModal />} />
    </Routes>,
    {
      initialEntries: ["/photos/photo-1"]
    }
  );
}

describe("PhotoViewerModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
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
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
    document.body.style.overflow = "";
  });

  it("renders like support and logged-out comment fallback", async () => {
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });

    renderViewer();

    expect(await screen.findByText("Log in to like this photo.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
    expect(screen.getByText("Log in to join the conversation.")).toBeInTheDocument();
  });

  it("lets a logged-in user post a comment inside the modal", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });
    mockPhotoService.getComments
      .mockResolvedValueOnce({
        comments: [],
        total: 0,
        page: 1,
        pages: 0
      })
      .mockResolvedValueOnce({
        comments: [createdComment],
        total: 1,
        page: 1,
        pages: 1
      });
    mockPhotoService.createComment.mockResolvedValue(createdComment);

    renderViewer();

    await user.type(await screen.findByPlaceholderText("Add a comment"), "Beautiful frame");
    await user.click(screen.getByRole("button", { name: "Post" }));

    expect(mockPhotoService.createComment).toHaveBeenCalledWith("photo-1", "Beautiful frame", "token-1");
    await waitFor(() => {
      expect(screen.getByText("Beautiful frame")).toBeInTheDocument();
    });
  });
});
