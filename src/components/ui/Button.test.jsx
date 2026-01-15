import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner has role="status"
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("replaces content with spinner when isLoading is true and size is icon", () => {
    render(<Button size="icon" isLoading>Icon</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });
});
