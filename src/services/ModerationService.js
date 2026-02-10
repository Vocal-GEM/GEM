const ModerationService = {
  preCheckContent: (_text) => {
    // Basic dummy check
    return { safe: true };
  },
  checkContent: async (_text) => {
    return { safe: true };
  }
};

export default ModerationService;
