import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Button isLoading>Click me</Button>);

    // Should be disabled
    expect(screen.getByRole("button")).toBeDisabled();

    // Should show spinner (role="status")
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Text should still be present for default buttons
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("disables button when disabled prop is set", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders icon sized spinner for icon buttons (replaces content)", () => {
    render(<Button size="icon" isLoading><span data-testid="icon-content">Icon</span></Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // In icon mode, children are replaced.
    expect(screen.queryByTestId("icon-content")).not.toBeInTheDocument();
  });

  it("applies generic disabled styles for loading usage", () => {
      const { container } = render(<Button isLoading>Click me</Button>);
      expect(container.firstChild).toHaveClass("pointer-events-none");
      expect(container.firstChild).toHaveClass("opacity-50");
  });
});
