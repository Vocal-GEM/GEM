import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuickSettings from "./QuickSettings";

// Mock implementation of useSettings hook
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      theme: 'dark',
      listenMode: false,
      performanceMode: 'high',
      analyticsEnabled: false
    },
    updateSettings: vi.fn()
  })
}));

describe("QuickSettings", () => {
  it("renders when isOpen is true", () => {
    const { getByText } = render(<QuickSettings isOpen={true} onClose={() => {}} />);
    expect(getByText("Quick Settings")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { queryByText } = render(<QuickSettings isOpen={false} onClose={() => {}} />);
    expect(queryByText("Quick Settings")).not.toBeInTheDocument();
  });

  it("has an accessible close button", () => {
    render(<QuickSettings isOpen={true} onClose={() => {}} />);
    expect(screen.getByLabelText("Close settings")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<QuickSettings isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has toggle switches with correct accessibility attributes", () => {
      render(<QuickSettings isOpen={true} onClose={() => {}} />);

      const listenToggle = screen.getByRole("switch", { name: /listen mode/i });
      expect(listenToggle).toBeInTheDocument();
      expect(listenToggle).toHaveAttribute("aria-checked", "false");

      const privacyToggle = screen.getByRole("switch", { name: /share usage data/i });
      expect(privacyToggle).toBeInTheDocument();
      expect(privacyToggle).toHaveAttribute("aria-checked", "false");
  });
});
