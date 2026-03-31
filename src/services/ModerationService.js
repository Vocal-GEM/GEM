// Placeholder ModerationService for frontend demo/testing

class ModerationService {
    preCheckContent(text) {
        const forbiddenWords = ['badword', 'spam'];
        const safe = !forbiddenWords.some(word => text.toLowerCase().includes(word));
        return { safe };
    }
}

export default new ModerationService();
