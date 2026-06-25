import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
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

describe("PhotoCard navigation", () => {
  it("uses a normal link to the full photo detail route without modal route state", async () => {
    const user = userEvent.setup();

    renderPhotoCard();

    const photoLink = screen.getByRole("link", { name: "Open Quiet frame" });

    expect(photoLink).toHaveAttribute("href", "/photos/photo-1");

    await user.click(photoLink);

    await waitFor(() => {
      const locations = screen.getAllByTestId("location");
      expect(locations[locations.length - 1]).toHaveTextContent("/photos/photo-1|no-state");
    });
  });
});
