import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";
import React from "react";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("replaces content when size=icon and loading", () => {
    render(<Button size="icon" isLoading>Icon</Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });
});
