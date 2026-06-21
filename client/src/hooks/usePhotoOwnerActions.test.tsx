import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usePhotoOwnerActions } from "./usePhotoOwnerActions";
import { useAuthStore } from "../store/authStore";
import type { Photo, User } from "../types";

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
  title: "Owner image",
  description: null,
  imageUrl: "https://example.test/photo.jpg",
  thumbnailUrl: "https://example.test/thumb.jpg",
  publicId: "framehub/user/owner",
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

function renderOwnerState(photo = samplePhoto) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  function Probe() {
    const { isOwner } = usePhotoOwnerActions(photo);

    return <output>{isOwner ? "owner" : "not-owner"}</output>;
  }

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  render(<Probe />, { wrapper: Wrapper });
}

describe("usePhotoOwnerActions", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.getState().clearSession();
    window.localStorage.clear();
  });

  it("returns true when the logged-in user owns the photo", () => {
    useAuthStore.getState().setSession({
      user: sampleUser,
      token: "token-1"
    });

    renderOwnerState();

    expect(screen.getByText("owner")).toBeInTheDocument();
  });

  it("returns false when logged out or viewing another user's photo", () => {
    renderOwnerState();

    expect(screen.getByText("not-owner")).toBeInTheDocument();

    useAuthStore.getState().setSession({
      user: {
        ...sampleUser,
        id: "user-2"
      },
      token: "token-2"
    });

    renderOwnerState();

    expect(screen.getAllByText("not-owner")).toHaveLength(2);
  });
});
