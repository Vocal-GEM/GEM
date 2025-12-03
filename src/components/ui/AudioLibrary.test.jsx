import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AudioLibrary from './AudioLibrary';
import { vi } from 'vitest';

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => {
            const translations = {
                'library.noRecordings': 'No Recordings',
                'library.noRecordingsDesc': "You haven't saved any pitch references yet"
            };
            return translations[key] || key;
        }
    })
}));

describe('AudioLibrary Component', () => {
    it('renders empty state for pitch references', () => {
        render(<AudioLibrary audioEngine={{}} />);

        expect(screen.getByText('No Recordings')).toBeInTheDocument();
        expect(screen.getByText(/You haven't saved any pitch references yet/)).toBeInTheDocument();
    });
});
