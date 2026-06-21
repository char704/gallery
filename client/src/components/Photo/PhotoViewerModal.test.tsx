import type React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    deleteComment: vi.fn(),
    updatePhoto: vi.fn(),
    updatePhotoTags: vi.fn(),
    deletePhoto: vi.fn()
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

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

function renderViewerWithHistory() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/explore", "/photos/photo-1"]} initialIndex={1}>
        <Routes>
          <Route path="/photos/:photoId" element={<PhotoViewerModal />} />
          <Route path="/explore" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
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

  it("shows owner controls only to the photo owner", async () => {
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });

    renderViewer();

    expect(await screen.findByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

    useAuthStore.getState().clearSession();
    mockUsePhoto.mockReturnValue({
      data: {
        ...samplePhoto,
        userId: "user-3"
      },
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof usePhoto>);

    renderViewer();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    });
  });

  it("updates photo metadata in the modal and exits edit mode on success", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });
    mockPhotoService.updatePhoto.mockResolvedValue({
      ...samplePhoto,
      title: "Updated image",
      description: "Updated description",
      visibility: "UNLISTED"
    });

    renderViewer();

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Updated image");
    await user.clear(screen.getByLabelText("Description"));
    await user.type(screen.getByLabelText("Description"), "Updated description");
    await user.selectOptions(screen.getByLabelText("Visibility"), "UNLISTED");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mockPhotoService.updatePhoto).toHaveBeenCalledWith(
      "photo-1",
      {
        title: "Updated image",
        description: "Updated description",
        visibility: "UNLISTED"
      },
      "token-1"
    );
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
    });
  });

  it("updates photo tags in the modal and exits tag edit mode on success", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });
    mockPhotoService.updatePhotoTags.mockResolvedValue({
      ...samplePhoto,
      tags: [
        {
          tag: {
            id: "tag-1",
            name: "nature",
            slug: "nature",
            createdAt: "2026-06-20T00:00:00.000Z"
          }
        }
      ]
    });

    renderViewer();

    await user.click(await screen.findByRole("button", { name: "Edit tags" }));
    await user.type(screen.getByPlaceholderText("nature, travel, sunset"), "nature, travel");
    await user.click(screen.getByRole("button", { name: "Save tags" }));

    expect(mockPhotoService.updatePhotoTags).toHaveBeenCalledWith("photo-1", ["nature", "travel"], "token-1");
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Save tags" })).not.toBeInTheDocument();
    });
  });

  it("deletes a photo from the modal and returns to the background route", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });
    mockPhotoService.getComments.mockResolvedValue({
      comments: [],
      total: 0,
      page: 1,
      pages: 0
    });
    mockPhotoService.deletePhoto.mockResolvedValue({ deleted: true });

    renderViewerWithHistory();

    await user.click(await screen.findByRole("button", { name: "Delete" }));
    const confirmDialog = screen.getByText("Delete Photo").closest('[role="dialog"]');
    expect(confirmDialog).toBeTruthy();
    await user.click(within(confirmDialog as HTMLElement).getByRole("button", { name: "Delete" }));

    expect(mockPhotoService.deletePhoto).toHaveBeenCalledWith("photo-1", "token-1");
    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/explore");
    });
  });
});
