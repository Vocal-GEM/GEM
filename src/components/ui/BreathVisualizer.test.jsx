import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BreathVisualizer from "./BreathVisualizer";

describe("BreathVisualizer", () => {
    it("renders reset button with accessible name", () => {
        render(<BreathVisualizer />);
        // This checks for the existence of a button with accessible name "Reset exercise"
        // Currently, the button has no text (just an icon) and no aria-label, so this should fail
        const resetButton = screen.getByRole("button", { name: /reset exercise/i });
        expect(resetButton).toBeInTheDocument();
    });

    it("announces phase changes", () => {
        render(<BreathVisualizer />);
        // The "Ready?" text should be in a live region
        const instructionText = screen.getByText(/ready/i);
        expect(instructionText).toHaveAttribute("aria-live", "polite");
        expect(instructionText).toHaveAttribute("aria-atomic", "true");
    });

    it("indicates active state on toggle button", () => {
        render(<BreathVisualizer />);
        // Initially "Start"
        const toggleButton = screen.getByRole("button", { name: /start/i });

        // Should have aria-pressed="false" when inactive
        expect(toggleButton).toHaveAttribute("aria-pressed", "false");

        // Click to start
        fireEvent.click(toggleButton);

        // Should have aria-pressed="true" when active
        expect(toggleButton).toHaveAttribute("aria-pressed", "true");

        // Should also update its name/label to "Pause" or "Pause breathing exercise"
        // Note: The text content updates to "Pause", so getByRole with name /pause/i should work
        expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    });
});
