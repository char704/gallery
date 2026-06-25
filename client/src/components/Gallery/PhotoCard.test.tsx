import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PhotoCard } from "./PhotoCard";
import type { Photo } from "../../types";

const samplePhoto: Photo = {
  id: "photo-1",
  title: "Quiet frame",
  description: "A calm test photo.",
  imageUrl: "https://example.test/photo.jpg",
  thumbnailUrl: "https://example.test/thumb.jpg",
  publicId: "framehub/test/photo",
  width: 1200,
  height: 900,
  fileSize: 1000,
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

  return (
    <output data-testid="location">
      {location.pathname}|{location.state ? "has-state" : "no-state"}
    </output>
  );
}

function renderPhotoCard() {
  render(
    <MemoryRouter initialEntries={["/explore"]}>
      <PhotoCard photo={samplePhoto} layout="masonry" presentation="explore" />
      <LocationProbe />
      <Routes>
        <Route path="/photos/:photoId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

function setStartViewTransition(value: unknown) {
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value
  });
}

describe("PhotoCard navigation", () => {
  beforeEach(() => {
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
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition");
    vi.restoreAllMocks();
  });

  it("calls startViewTransition with document as the receiver", async () => {
    const user = userEvent.setup();
    const startViewTransition = vi.fn(function (this: Document, callback: () => void) {
      expect(this).toBe(document);
      callback();
    });

    setStartViewTransition(startViewTransition);

    renderPhotoCard();
    await user.click(screen.getByRole("link", { name: "Open Quiet frame" }));

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      const locations = screen.getAllByTestId("location");
      expect(locations[locations.length - 1]).toHaveTextContent("/photos/photo-1|has-state");
    });
  });

  it("navigates manually if startViewTransition throws after preventDefault", async () => {
    const user = userEvent.setup();

    setStartViewTransition(
      vi.fn(() => {
        throw new TypeError("Illegal invocation");
      })
    );

    renderPhotoCard();
    await user.click(screen.getByRole("link", { name: "Open Quiet frame" }));

    await waitFor(() => {
      const locations = screen.getAllByTestId("location");
      expect(locations[locations.length - 1]).toHaveTextContent("/photos/photo-1|has-state");
    });
  });

  it("lets reduced-motion users use normal Link navigation", async () => {
    const user = userEvent.setup();
    const startViewTransition = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    setStartViewTransition(startViewTransition);

    renderPhotoCard();
    await user.click(screen.getByRole("link", { name: "Open Quiet frame" }));

    expect(startViewTransition).not.toHaveBeenCalled();
    await waitFor(() => {
      const locations = screen.getAllByTestId("location");
      expect(locations[locations.length - 1]).toHaveTextContent("/photos/photo-1|has-state");
    });
  });
});
