// Mock implementation of ModerationService
export const ModerationService = {
    preCheckContent: (content) => {
        return { safe: true };
    }
};

export default ModerationService;
