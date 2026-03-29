// Placeholder for ModerationService
const ModerationService = {
    preCheckContent: (text) => {
        // Basic check (allow everything in placeholder)
        return { safe: true };
    }
};

export default ModerationService;
