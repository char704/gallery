import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { renderWithProviders } from "./test/test-utils";

describe("App", () => {
  it("renders the FrameHub home route", () => {
    renderWithProviders(<App />);

    expect(screen.getByRole("heading", { name: "FrameHub" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Explore/i }).length).toBeGreaterThan(0);
  });
});
