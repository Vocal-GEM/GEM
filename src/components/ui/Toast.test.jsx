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
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders with correct message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    // Currently targeting by finding the button inside the toast
    // Since we don't have aria-label yet, we might need to find by role 'button'
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // Accessibility tests - These are expected to fail currently
  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('close button has accessible label', () => {
    render(<Toast message="Test" onClose={() => {}} />);

    // This should fail if aria-label is missing
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
/* eslint-env jest */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
    it('should render the message', () => {
        render(<Toast message="Hello World" onClose={() => {}} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should have role="status" for info type by default', () => {
        render(<Toast message="Info" type="info" onClose={() => {}} />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have role="alert" for error type', () => {
        render(<Toast message="Error" type="error" onClose={() => {}} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have a close button with aria-label', () => {
        render(<Toast message="Close me" onClose={() => {}} />);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Close notification');
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<Toast message="Close me" onClose={onClose} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClose).toHaveBeenCalled();
    });
});
