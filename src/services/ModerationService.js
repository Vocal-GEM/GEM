
const ModerationService = {
    preCheckContent: (text) => {
        return { safe: true, flags: [] };
    }
};

export default ModerationService;
