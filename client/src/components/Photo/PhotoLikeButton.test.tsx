import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoLikeButton } from "./PhotoLikeButton";
import { photoService } from "../../services/photo.service";
import { useAuthStore } from "../../store/authStore";
import { renderWithProviders } from "../../test/test-utils";
import type { User } from "../../types";

vi.mock("../../services/photo.service", () => ({
  photoService: {
    getLikeSummary: vi.fn(),
    likePhoto: vi.fn(),
    unlikePhoto: vi.fn()
  }
}));

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

describe("PhotoLikeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
  });

  it("lets a logged-in user like and unlike a photo", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });
    mockPhotoService.getLikeSummary
      .mockResolvedValueOnce({ count: 0, isLiked: false })
      .mockResolvedValueOnce({ count: 1, isLiked: true })
      .mockResolvedValueOnce({ count: 0, isLiked: false });
    mockPhotoService.likePhoto.mockResolvedValue({ count: 1, isLiked: true });
    mockPhotoService.unlikePhoto.mockResolvedValue({ count: 0, isLiked: false });

    renderWithProviders(<PhotoLikeButton photoId="photo-1" />);

    const likeButton = await screen.findByRole("button", { name: "Like / 0" });
    await user.click(likeButton);

    expect(mockPhotoService.likePhoto).toHaveBeenCalledWith("photo-1", "token-1");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Unlike / 1" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Unlike / 1" }));

    expect(mockPhotoService.unlikePhoto).toHaveBeenCalledWith("photo-1", "token-1");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Like / 0" })).toBeInTheDocument();
    });
  });

  it("shows a login prompt instead of a button when logged out", async () => {
    mockPhotoService.getLikeSummary.mockResolvedValue({ count: 3, isLiked: false });

    renderWithProviders(<PhotoLikeButton photoId="photo-1" />);

    expect(await screen.findByText("Log in to like this photo.")).toBeInTheDocument();
    expect(await screen.findByText("3 likes")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
