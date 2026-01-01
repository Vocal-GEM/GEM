import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Toast from "./Toast";

describe("Toast Component", () => {
  it("renders the message", () => {
    render(<Toast message="Test message" onClose={() => {}} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("has appropriate role for error", () => {
    render(<Toast message="Error message" type="error" onClose={() => {}} />);
    const toast = screen.getByRole("alert");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent("Error message");
  });

  it("has appropriate role for success", () => {
    render(
      <Toast message="Success message" type="success" onClose={() => {}} />,
    );
    const toast = screen.getByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent("Success message");
  });

  it("close button has aria-label", () => {
    render(<Toast message="Test" onClose={() => {}} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onClose after duration", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
