/**
 * NotificationService - Handles push notifications and reminders
 */

const STORAGE_KEY = 'gem_notification_settings';
const REMINDERS_KEY = 'gem_scheduled_reminders';

/**
 * Get notification settings
 */
export const getNotificationSettings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('NotificationService: Failed to load settings', e);
    }
    return {
        enabled: false,
        dailyReminder: true,
        reminderTime: '09:00',
        streakAlerts: true,
        weeklyReport: true
    };
};

/**
 * Save notification settings
 */
export const saveNotificationSettings = (settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    if (settings.enabled && settings.dailyReminder) {
        scheduleReminder(settings.reminderTime);
    }

    return settings;
};

/**
 * Request notification permission
 */
export const requestPermission = async () => {
    if (!('Notification' in window)) {
        return { granted: false, reason: 'Notifications not supported' };
    }

    if (Notification.permission === 'granted') {
        return { granted: true };
    }

    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted' };
};

/**
 * Schedule a daily reminder
 */
export const scheduleReminder = (time) => {
    // Store reminder configuration
    const reminders = {
        daily: {
            enabled: true,
            time,
            lastTriggered: null
        }
    };

    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));

    // Check if we should show reminder now
    checkReminders();
};

/**
 * Check and trigger reminders
 */
export const checkReminders = () => {
    const reminders = JSON.parse(localStorage.getItem(REMINDERS_KEY) || '{}');
    const settings = getNotificationSettings();

    if (!settings.enabled || !reminders.daily?.enabled) return;

    const now = new Date();
    const [hours, minutes] = reminders.daily.time.split(':').map(Number);

    const reminderToday = new Date();
    reminderToday.setHours(hours, minutes, 0, 0);

    const lastTriggered = reminders.daily.lastTriggered
        ? new Date(reminders.daily.lastTriggered)
        : null;

    // Check if reminder should fire
    if (now >= reminderToday &&
        (!lastTriggered || lastTriggered < reminderToday)) {

        showNotification('Time to Practice! 🎤', {
            body: 'Your voice training session is waiting. Keep your streak going!',
            tag: 'daily-reminder'
        });

        reminders.daily.lastTriggered = now.toISOString();
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    }
};

/**
 * Show a notification
 */
export const showNotification = (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return null;
    }

    return new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
    });
};

/**
 * Show streak at risk notification
 */
export const showStreakAlert = (currentStreak) => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !settings.streakAlerts) return;

    showNotification(`Don't break your ${currentStreak}-day streak! 🔥`, {
        body: 'Practice now to keep your momentum going!',
        tag: 'streak-alert'
    });
};

/**
 * Initialize notification service (call on app load)
 */
export const initializeNotifications = () => {
    const settings = getNotificationSettings();

    if (settings.enabled) {
        // Check reminders every hour
        checkReminders();
        setInterval(checkReminders, 3600000); // 1 hour
    }
};

export default {
    getNotificationSettings,
    saveNotificationSettings,
    requestPermission,
    scheduleReminder,
    checkReminders,
    showNotification,
    showStreakAlert,
    initializeNotifications
};
