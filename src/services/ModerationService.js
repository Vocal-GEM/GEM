
const ModerationService = {
    preCheckContent: (content) => ({ safe: true, flagged: [] }),
    flagContent: async () => ({ success: true })
};

export default ModerationService;
