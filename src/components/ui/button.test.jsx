import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
    // Implementation detail: button text might be preserved or replaced depending on variant
    // but the spinner should be there.
  });

  it("replaces content when size=icon and loading", () => {
    render(<Button size="icon" isLoading>Icon</Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });

  it("applies generic disabled styles for generic usage", () => {
      const { container } = render(<Button disabled>Click me</Button>);
      expect(container.firstChild).toHaveClass("disabled:opacity-50");
  });
});
