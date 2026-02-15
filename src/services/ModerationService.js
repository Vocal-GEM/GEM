
// Mock ModerationService
const ModerationService = {
    preCheckContent: (text) => {
        return { safe: true, flagged_terms: [] };
    }
};

export default ModerationService;
