export const withRetry = async <T>(
    fn: () => Promise<T>,
    retries: number = 1,
    delayMs: number = 300,
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return withRetry(fn, retries - 1, delayMs);
    }
};