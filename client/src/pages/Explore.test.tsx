import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import Explore from "./Explore";
import { usePublicPhotos } from "../hooks/usePhotos";
import type { Photo } from "../types";

vi.mock("../hooks/usePhotos", () => ({
  usePublicPhotos: vi.fn()
}));

const mockUsePublicPhotos = vi.mocked(usePublicPhotos);

const samplePhoto: Photo = {
  id: "photo-1",
  title: "Forest Frame",
  description: null,
  imageUrl: "https://example.com/photo.jpg",
  thumbnailUrl: "https://example.com/thumb.jpg",
  publicId: "photo-public-id",
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
};

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.search}</output>;
}

describe("Explore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    mockUsePublicPhotos.mockReturnValue({
      data: {
        photos: [samplePhoto],
        total: 24,
        page: 1,
        pages: 3
      },
      isLoading: false,
      isError: false,
      error: null
    } as unknown as ReturnType<typeof usePublicPhotos>);
  });

  it("keeps the requested page when the tag filter did not change", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/explore?tag=nature"]}>
        <Explore />
        <LocationProbe />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("?tag=nature&page=2");
    });
  });
});
