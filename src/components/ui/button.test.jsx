import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    // The spinner has role="status"
    expect(screen.getByRole("status")).toBeInTheDocument();

    // We expect the button to be disabled
    expect(screen.getByRole("button")).toBeDisabled();

    // We expect the text to still be visible (though maybe styled differently)
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("disables button when disabled prop is set", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders icon sized spinner for icon buttons (replaces content)", () => {
    render(<Button size="icon" isLoading><span data-testid="icon-content">Icon</span></Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // In icon mode, children are typically replaced or hidden.
    // Based on implementation we observed in other files, it seems to replace.
    expect(screen.queryByTestId("icon-content")).not.toBeInTheDocument();
  });

  it("applies generic disabled styles for generic usage", () => {
      const { container } = render(<Button isLoading>Click me</Button>);
      expect(container.firstChild).toHaveClass("opacity-50");
  });
});
