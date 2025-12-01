import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AudioLibrary from './AudioLibrary';

describe('AudioLibrary Component', () => {
    it('renders empty state for pitch references', () => {
        render(<AudioLibrary audioEngine={{}} />);

        expect(screen.getByText('No Recordings')).toBeInTheDocument();
        expect(screen.getByText(/You haven't saved any pitch references yet/)).toBeInTheDocument();
    });
});
