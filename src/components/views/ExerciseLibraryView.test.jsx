import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseLibraryView from './ExerciseLibraryView';
import { NavigationProvider } from '../../context/NavigationContext';

// Mock the NavigationContext
const mockNavigate = vi.fn();
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

// Mock the exercise search engine
vi.mock('../../utils/exerciseSearchEngine', () => ({
    applyFilters: () => [
        {
            id: 'ex1',
            title: 'Breathing Basics',
            category: 'breathing',
            difficulty: 'beginner',
            duration: 60,
            instructions: 'Inhale deeply...',
            goals: ['relaxation'],
            citations: ['Research 2023']
        },
        {
            id: 'ex2',
            title: 'Pitch Glides',
            category: 'pitch',
            difficulty: 'intermediate',
            duration: 120,
            instructions: 'Glide from low to high...',
            goals: ['range']
        }
    ],
    getCategories: () => ['breathing', 'pitch'],
    getDifficulties: () => ['beginner', 'intermediate', 'advanced'],
    getExerciseStats: () => ({
        total: 2,
        byCategory: { breathing: 1, pitch: 1 },
        byDifficulty: { beginner: 1, intermediate: 1 },
        avgDuration: 90
    })
}));

describe('ExerciseLibraryView Accessibility', () => {
    it('renders search input with aria-label', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );
        const searchInput = screen.getByLabelText('Search exercises');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('placeholder', 'Search exercises by name, category, or instructions...');
    });

    it('renders view toggle buttons with aria-labels and aria-pressed states', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );

        const gridViewBtn = screen.getByLabelText('Grid view');
        const listViewBtn = screen.getByLabelText('List view');

        expect(gridViewBtn).toBeInTheDocument();
        expect(listViewBtn).toBeInTheDocument();

        // Default is grid view
        expect(gridViewBtn).toHaveAttribute('aria-pressed', 'true');
        expect(listViewBtn).toHaveAttribute('aria-pressed', 'false');

        // Switch to list view
        fireEvent.click(listViewBtn);
        expect(gridViewBtn).toHaveAttribute('aria-pressed', 'false');
        expect(listViewBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders category filter buttons with aria-pressed states', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );

        // "All" should be selected by default
        const allBtn = screen.getByRole('button', { name: /all/i });
        expect(allBtn).toHaveAttribute('aria-pressed', 'true');

        const breathingBtn = screen.getByRole('button', { name: /breathing/i });
        expect(breathingBtn).toHaveAttribute('aria-pressed', 'false');

        // Click breathing
        fireEvent.click(breathingBtn);
        expect(allBtn).toHaveAttribute('aria-pressed', 'false');
        expect(breathingBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders difficulty filter buttons with aria-pressed states', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );

        const beginnerBtn = screen.getByRole('button', { name: /beginner/i });
        expect(beginnerBtn).toHaveAttribute('aria-pressed', 'false');

        // Click beginner
        fireEvent.click(beginnerBtn);
        expect(beginnerBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders exercise action buttons with aria-labels in list view', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );

        // Switch to list view to see icon-only buttons
        const listViewBtn = screen.getByLabelText('List view');
        fireEvent.click(listViewBtn);

        const detailsBtns = screen.getAllByLabelText(/View details for/i);
        expect(detailsBtns.length).toBeGreaterThan(0);
        expect(detailsBtns[0]).toHaveAttribute('aria-label', 'View details for Breathing Basics');

        const startBtns = screen.getAllByLabelText(/Start/i);
        expect(startBtns.length).toBeGreaterThan(0);
        expect(startBtns[0]).toHaveAttribute('aria-label', 'Start Breathing Basics');
    });

    it('renders close button with aria-label in details modal', () => {
        render(
            <NavigationProvider>
                <ExerciseLibraryView />
            </NavigationProvider>
        );

        // Open details modal
        // Note: in grid view (default), the "Details" button has text, so we can find it by text
        const detailsBtn = screen.getAllByText('Details')[0];
        fireEvent.click(detailsBtn);

        const closeBtn = screen.getByLabelText('Close details');
        expect(closeBtn).toBeInTheDocument();

        // Close modal
        fireEvent.click(closeBtn);
        expect(screen.queryByLabelText('Close details')).not.toBeInTheDocument();
    });
});
