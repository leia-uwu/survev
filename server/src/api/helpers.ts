export const helpers = {
    getTimeUntilNextUsernameChange: (lastChangeTime: Date) => {
        const changeCooldown = 10 * 24 * 60 * 60 * 1000;
        const currentTime = Date.now();
        const timeSinceLastChange = currentTime - lastChangeTime.getTime();
        return changeCooldown - timeSinceLastChange;
    },
};
