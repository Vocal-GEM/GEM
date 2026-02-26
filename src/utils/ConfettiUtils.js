
// Global confetti trigger
let globalConfettiTrigger = null;

export const setGlobalConfettiTrigger = (trigger) => {
    globalConfettiTrigger = trigger;
};

export const triggerGlobalConfetti = () => {
    if (globalConfettiTrigger) {
        globalConfettiTrigger();
    }
};
