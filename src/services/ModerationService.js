const ModerationService = {
    preCheckContent: async (content) => {
        return { safe: true };
    }
};

export default ModerationService;
