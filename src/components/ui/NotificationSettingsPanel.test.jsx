import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationSettingsPanel from './NotificationSettingsPanel';
import NotificationService from '../../services/NotificationService';
import React from 'react';

vi.mock('../../services/NotificationService', () => ({
  default: {
    getNotificationSettings: vi.fn(() => ({
      enabled: true,
      dailyReminder: true,
      reminderTime: '20:00',
      streakAlerts: false,
      weeklyReport: true
    })),
    saveNotificationSettings: vi.fn(),
    requestPermission: vi.fn()
  }
}));

describe('NotificationSettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings properly', () => {
    render(<NotificationSettingsPanel onClose={() => {}} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('toggles settings on click', () => {
    render(<NotificationSettingsPanel onClose={() => {}} />);

    // Find the daily reminder switch
    const dailyReminderSwitch = screen.getByRole('switch', { name: /Daily Reminder/i });
    expect(dailyReminderSwitch).toBeInTheDocument();

    fireEvent.click(dailyReminderSwitch);
    expect(NotificationService.saveNotificationSettings).toHaveBeenCalled();
  });
});
