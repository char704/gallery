import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Search from "./Search";
import { searchService } from "../services/search.service";
import { renderWithProviders } from "../test/test-utils";

vi.mock("../services/search.service", () => ({
  searchService: {
    photos: vi.fn(),
    suggestions: vi.fn(),
    tags: vi.fn()
  }
}));

const mockSearchService = vi.mocked(searchService);

describe("Search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchService.photos.mockResolvedValue({
      photos: [],
      total: 0,
      page: 1,
      pages: 0
    });
    mockSearchService.suggestions.mockResolvedValue({
      suggestions: []
    });
    mockSearchService.tags.mockResolvedValue({
      tags: []
    });
  });

  it("debounces search input before fetching photos and suggestions", async () => {
    const user = userEvent.setup();

    renderWithProviders(<Search />);

    await waitFor(() => {
      expect(mockSearchService.photos).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByPlaceholderText("Search photos, tags, or creators"), "sun");

    expect(mockSearchService.photos).toHaveBeenCalledTimes(1);
    expect(mockSearchService.suggestions).not.toHaveBeenCalled();

    await new Promise((resolve) => window.setTimeout(resolve, 300));

    expect(mockSearchService.photos).toHaveBeenCalledTimes(1);
    expect(mockSearchService.suggestions).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mockSearchService.photos).toHaveBeenCalledWith({
        q: "sun",
        tag: "",
        sort: "latest",
        page: 1,
        limit: 12
      });
      expect(mockSearchService.suggestions).toHaveBeenCalledWith("sun", 6);
    });
  });

  it("hydrates search filters from URL query params", async () => {
    renderWithProviders(<Search />, {
      initialEntries: ["/search?q=sunrise&tag=nature&sort=popular&page=2"]
    });

    expect(screen.getByPlaceholderText("Search photos, tags, or creators")).toHaveValue("sunrise");

    await waitFor(() => {
      expect(mockSearchService.photos).toHaveBeenCalledWith({
        q: "sunrise",
        tag: "nature",
        sort: "popular",
        page: 2,
        limit: 12
      });
    });
  });
});
