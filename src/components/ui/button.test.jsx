import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
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
    render(<Button size="icon" isLoading><span data-testid="icon-content">Icon</span></Button>);

    // Spinner should be present
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Original text/icon should NOT be present (implementation detail: we conditionally render)
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });

  it("disables button when disabled prop is set", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies generic disabled styles for generic usage", () => {
      const { container } = render(<Button isLoading>Click me</Button>);
      expect(container.firstChild).toHaveClass("pointer-events-none");
      expect(container.firstChild).toHaveClass("opacity-50");
  });
});
