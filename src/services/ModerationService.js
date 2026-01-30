
// ModerationService.js
// Mock service for content moderation

const preCheckContent = (text) => {
    const badWords = ['hate', 'violence', 'abuse']; // Simple list for demo
    const hasBadWord = badWords.some(word => text.toLowerCase().includes(word));

    return {
        safe: !hasBadWord,
        flagged: hasBadWord ? ['inappropriate content'] : []
    };
};

export default {
    preCheckContent
};
