class ModerationService {
    preCheckContent() {
        return { safe: true };
    }
}
export default new ModerationService();
