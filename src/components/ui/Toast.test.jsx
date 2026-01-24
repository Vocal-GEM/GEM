import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Toast from "./Toast";

describe("Toast Component", () => {
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';
import React from 'react';

// Mock lucide-react icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  CheckCircle: (props) => <div data-testid="icon-check" {...props} />,
  XCircle: (props) => <div data-testid="icon-error" {...props} />,
  AlertTriangle: (props) => <div data-testid="icon-warning" {...props} />,
  Info: (props) => <div data-testid="icon-info" {...props} />,
  X: (props) => <div data-testid="icon-close" {...props} />,
}));

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message correctly', () => {
    render(<Toast message="Test message" onClose={() => {}} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  it("renders with correct message", () => {
  it('renders with correct message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText("Test Message")).toBeInTheDocument();
  });

  it("calls onClose after duration", () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" onClose={onClose} duration={3000} />);
    render(<Toast message="Test" onClose={onClose} duration={3000} />);
    render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('has accessible role for error', () => {
    render(<Toast message="Error" type="error" onClose={() => {}} />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('has accessible role for success', () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('close button has accessible label', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    const button = screen.getByRole('button', { name: /close notification/i });
    expect(button).toBeInTheDocument();
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
  it('has correct accessibility attributes for success', () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Success:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for error', () => {
    render(<Toast message="Error" type="error" onClose={() => {}} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Error:')).toHaveClass('sr-only');
  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    const closeButton = screen.getByRole("button", {
      name: /close notification/i,
    });
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Error:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Success:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for warning type', () => {
    render(<Toast message="Warning!" type="warning" onClose={() => {}} />);
  it("has correct accessibility attributes for error type", () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);
  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Warning:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for info type', () => {
    render(<Toast message="Info!" type="info" onClose={() => {}} />);
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Error:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Success:')).toHaveClass('sr-only');
  });

  it('icons are hidden from screen readers', () => {
    render(<Toast message="Test" type="success" onClose={() => {}} />);
    const icon = screen.getByTestId('icon-check');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Information:')).toHaveClass('sr-only');
  });

    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Success:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for warning type', () => {
    render(<Toast message="Warning!" type="warning" onClose={() => {}} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Error:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for success type", () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Warning:')).toHaveClass('sr-only');
  });

    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
  it('has correct accessibility attributes for info type', () => {
    render(<Toast message="Info!" type="info" onClose={() => {}} />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(screen.getByText("Success:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for warning type", () => {
    render(<Toast message="Warning!" type="warning" onClose={() => {}} />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Warning:")).toHaveClass("sr-only");
  });

  it("has correct accessibility attributes for info type", () => {
    render(<Toast message="Info!" type="info" onClose={() => {}} />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Information:")).toHaveClass("sr-only");
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Information:')).toHaveClass('sr-only');
  });

  it('applies custom className', () => {
    render(<Toast message="Test" className="custom-class" onClose={() => {}} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveClass('custom-class');
  });

  it('close button has accessible label', () => {
    render(<Toast message="Test" onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
  });
});
