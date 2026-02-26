/**
 * Audit Logger Service
 * Maintains a tamper-evident log of all research activities for IRB compliance.
 * Logs are stored locally and synced to backend when possible.
 */

export class AuditLogger {
    constructor() {
        this.logs = [];
        this.storageKey = 'gem_audit_logs';
        this.loadLogs();
    }

    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load audit logs', e);
        }
    }

    saveLogs() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (e) {
            console.error('Failed to save audit logs', e);
        }
    }

    /**
     * Log a sensitive action
     * @param {string} actionType - Type of action (e.g., 'CONSENT_SIGNED', 'DATA_EXPORTED')
     * @param {string} userId - User ID performing action
     * @param {Object} details - Additional details
     * @param {string} participantId - (Optional) Affected participant
     */
    async log(actionType, userId, details = {}, participantId = null) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            actionType,
            userId,
            participantId,
            details: this.sanitizeDetails(details),
            userAgent: navigator.userAgent,
            integrityHash: null // To be calculated
        };

        // Calculate hash of previous entry + current entry for tamper evidence
        entry.integrityHash = await this.calculateIntegrityHash(entry);

        this.logs.push(entry);
        this.saveLogs();

        // Attempt to sync to backend immediately for critical actions
        if (this.isCritical(actionType)) {
            this.syncLog(entry);
        }
    }

    sanitizeDetails(details) {
        // Remove potentially sensitive fields like passwords, raw audio buffers, etc.
        const sanitized = { ...details };
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.audioBuffer; // Don't log raw data
        return sanitized;
    }

    async calculateIntegrityHash(entry) {
        const prevHash = this.logs.length > 0 ? this.logs[this.logs.length - 1].integrityHash : 'GENESIS';
        const content = `${prevHash}|${entry.timestamp}|${entry.actionType}|${entry.userId}|${JSON.stringify(entry.details)}`;

        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    isCritical(actionType) {
        return [
            'CONSENT_SIGNED',
            'CONSENT_WITHDRAWN',
            'DATA_DELETED',
            'STUDY_UNBLINDED'
        ].includes(actionType);
    }

    async syncLog(entry) {
        // TODO: Implement backend sync endpoint
        console.log('Syncing audit log:', entry);
    }

    getLogs(filter = {}) {
        return this.logs.filter(log => {
            if (filter.actionType && log.actionType !== filter.actionType) return false;
            if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) return false;
            if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) return false;
            return true;
        });
    }

    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

export const auditLogger = new AuditLogger();
export default auditLogger;
