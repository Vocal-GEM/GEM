import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from "react";
import { Button } from './button';
import { Loader2 } from "lucide-react";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("handles loading state correctly", () => {
    render(
      <Button isLoading>
        Icon
        Click me
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // Look for the loading text that's added by the component
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Original text/icon should NOT be present (implementation detail: we conditionally render)
    expect(screen.queryByText("Icon")).not.toBeInTheDocument();
  });
});
