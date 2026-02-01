// Placeholder for ModerationService
const ModerationService = {
    preCheckContent: async (content) => { return { safe: true }; },
    reportContent: async (id, reason) => { return { success: true }; }
};

export default ModerationService;
