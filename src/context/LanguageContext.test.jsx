import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Mock component to test the hook
const TestComponent = () => {
    const { language, setLanguage, t } = useLanguage();
    return (
        <div>
            <div data-testid="current-lang">{language}</div>
            <div data-testid="translated-text">{t('common.save')}</div>
            <div data-testid="missing-key">{t('missing.key')}</div>
            <button onClick={() => setLanguage('es')}>Switch to Spanish</button>
        </div>
    );
};

describe('LanguageContext', () => {
    it('provides default language and translation function', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        expect(screen.getByTestId('current-lang').textContent).toBe('en');
        expect(screen.getByTestId('translated-text').textContent).toBe('Save');
    });

    it('returns key if translation is missing', () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        expect(screen.getByTestId('missing-key').textContent).toBe('missing.key');
    });

    it('allows switching language', async () => {
        render(
            <LanguageProvider>
                <TestComponent />
            </LanguageProvider>
        );

        const button = screen.getByText('Switch to Spanish');
        await act(async () => {
            button.click();
        });

        expect(screen.getByTestId('current-lang').textContent).toBe('es');
    });
});
