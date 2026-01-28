import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Toast from "./Toast";

// Mock lucide-react icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  CheckCircle: (props) => <div data-testid="icon-check" {...props} />,
  XCircle: (props) => <div data-testid="icon-error" {...props} />,
  AlertTriangle: (props) => <div data-testid="icon-warning" {...props} />,
  Info: (props) => <div data-testid="icon-info" {...props} />,
  X: (props) => <div data-testid="icon-close" {...props} />,
}));

describe("Toast Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with correct message", () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("calls onClose after duration", () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    const closeButton = screen.getByRole("button", {
      name: /close notification/i,
    });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("has correct accessibility attributes for success", () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    const toast = screen.getByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Success:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for error", () => {
    render(<Toast message="Error" type="error" onClose={() => {}} />);
    const toast = screen.getByRole("alert");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute("aria-live", "assertive");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Error:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for warning", () => {
    render(<Toast message="Warning" type="warning" onClose={() => {}} />);
    const toast = screen.getByRole("alert");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute("aria-live", "assertive");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Warning:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for info", () => {
    render(<Toast message="Info" type="info" onClose={() => {}} />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("aria-live", "polite");
    expect(toast).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Information:")).toHaveClass("sr-only");
  });

  it("applies custom className", () => {
    render(<Toast message="Test" className="custom-class" onClose={() => {}} />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("custom-class");
  });
});
