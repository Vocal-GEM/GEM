import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<Button isLoading>Click me</Button>);

    // Should be disabled
    expect(screen.getByRole("button")).toBeDisabled();

    // Should show spinner (role="status")
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Text should still be present
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("replaces content when size=icon and loading", () => {
    render(<Button size="icon" isLoading>Icon</Button>);

    // Spinner should be present
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Original text/icon should NOT be present (implementation detail: we conditionally render)
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();

  });
});
