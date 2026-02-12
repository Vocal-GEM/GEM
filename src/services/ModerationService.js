// Mock Moderation Service
export const preCheckContent = (text) => {
    const badWords = ['badword', 'offensive'];
    const lower = text.toLowerCase();
    const isSafe = !badWords.some(w => lower.includes(w));

    return {
        safe: isSafe,
        reason: isSafe ? null : 'Contains flagged content'
    };
};

const ModerationService = {
    preCheckContent
};

export default ModerationService;
