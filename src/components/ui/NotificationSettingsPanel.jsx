/**
 * NotificationSettingsPanel.jsx
 * 
 * Panel for configuring daily reminder and notification preferences.
 * Integrates with NotificationService.
 */

import { useState, useEffect } from 'react';
import { Bell, Clock, Flame, BarChart, BellOff, Check, X, Smartphone } from 'lucide-react';
import NotificationService from '../../services/NotificationService';

const NotificationSettingsPanel = ({ onClose, embedded = false }) => {
    const [settings, setSettings] = useState(NotificationService.getNotificationSettings());
    const [permissionStatus, setPermissionStatus] = useState('default');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const handleToggle = (key) => {
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);
        NotificationService.saveNotificationSettings(updated);
    };

    const handleTimeChange = (time) => {
        const updated = { ...settings, reminderTime: time };
        setSettings(updated);
        NotificationService.saveNotificationSettings(updated);
    };

    const handleEnableNotifications = async () => {
        const result = await NotificationService.requestPermission();
        if (result.granted) {
            setPermissionStatus('granted');
            const updated = { ...settings, enabled: true };
            setSettings(updated);
            NotificationService.saveNotificationSettings(updated);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } else {
            setPermissionStatus('denied');
        }
    };

    const Wrapper = embedded ? 'div' : 'div';
    const wrapperClass = embedded
        ? 'bg-slate-900/50 rounded-2xl border border-slate-700 p-6'
        : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';

    return (
        <Wrapper className={wrapperClass}>
            <div className={embedded ? '' : 'w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6'}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20">
                            <Bell className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Notifications</h2>
                            <p className="text-sm text-slate-400">Stay on track with reminders</p>
                        </div>
                    </div>
                    {!embedded && (
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Permission Status */}
                {permissionStatus !== 'granted' && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Smartphone className="text-amber-400 shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-300 mb-1">Enable Notifications</h3>
                                <p className="text-sm text-amber-100/80 mb-3">
                                    Get daily reminders to practice and keep your streak going!
                                </p>
                                <button
                                    onClick={handleEnableNotifications}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm transition-colors"
                                >
                                    Enable Notifications
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300">
                        <Check size={16} />
                        <span className="text-sm font-medium">Notifications enabled!</span>
                    </div>
                )}

                {/* Settings List */}
                <div className="space-y-3">
                    {/* Daily Reminder */}
                    <SettingRow
                        icon={Clock}
                        iconColor="text-teal-400"
                        title="Daily Reminder"
                        description="Get a reminder to practice each day"
                        checked={settings.dailyReminder}
                        onChange={() => handleToggle('dailyReminder')}
                        disabled={!settings.enabled}
                    />

                    {/* Reminder Time */}
                    {settings.dailyReminder && (
                        <div className="ml-12 mb-4">
                            <label className="text-sm text-slate-400 mb-2 block">Reminder Time</label>
                            <input
                                type="time"
                                value={settings.reminderTime}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-full"
                                disabled={!settings.enabled}
                            />
                        </div>
                    )}

                    {/* Streak Alerts */}
                    <SettingRow
                        icon={Flame}
                        iconColor="text-orange-400"
                        title="Streak Alerts"
                        description="Get notified when your streak is at risk"
                        checked={settings.streakAlerts}
                        onChange={() => handleToggle('streakAlerts')}
                        disabled={!settings.enabled}
                    />

                    {/* Weekly Report */}
                    <SettingRow
                        icon={BarChart}
                        iconColor="text-blue-400"
                        title="Weekly Summary"
                        description="Receive a summary of your weekly progress"
                        checked={settings.weeklyReport}
                        onChange={() => handleToggle('weeklyReport')}
                        disabled={!settings.enabled}
                    />
                </div>

                {/* Disable All */}
                {settings.enabled && (
                    <button
                        onClick={() => {
                            const updated = { ...settings, enabled: false };
                            setSettings(updated);
                            NotificationService.saveNotificationSettings(updated);
                        }}
                        className="mt-6 w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-xl transition-colors"
                    >
                        <BellOff size={16} />
                        <span className="text-sm font-medium">Disable All Notifications</span>
                    </button>
                )}
            </div>
        </Wrapper>
    );
};

/**
 * Individual setting row component
 */
const SettingRow = ({ icon: Icon, iconColor, title, description, checked, onChange, disabled }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${disabled
                ? 'opacity-50 cursor-not-allowed bg-slate-800/30 border-slate-700/50'
                : checked
                    ? 'bg-slate-800/70 border-slate-600 hover:border-slate-500'
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
            }`}
    >
        <div className={`p-2 rounded-lg ${checked ? 'bg-white/10' : 'bg-slate-700/50'}`}>
            <Icon size={18} className={checked ? iconColor : 'text-slate-500'} />
        </div>
        <div className="flex-1">
            <div className={`font-medium ${checked ? 'text-white' : 'text-slate-400'}`}>{title}</div>
            <div className="text-sm text-slate-500">{description}</div>
        </div>
        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'bg-purple-500' : 'bg-slate-600'
            }`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                }`} />
        </div>
    </button>
);

export default NotificationSettingsPanel;
