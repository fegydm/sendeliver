// File: front/src/utils/isLottieFormat.ts
// Last change: Created a strict Lottie format identifier.

export const isLottieFormat = (data: any): boolean => {
    if (!data || typeof data !== 'object') {
        console.warn("⚠️ Invalid data type. Expected an object.");
        return false;
    }

    const requiredFields = ["v", "fr", "ip", "op", "w", "h", "ayers"];

    // ✅ Check for all required fields
    const hasRequiredFields = requiredFields.every((field) => field in data);
    if (!hasRequiredFields) {
        console.warn("⚠️ Missing required Lottie fields.");
        return false;
    }

    // ✅ Validate version format
    if (typeof data.v !== 'string' || !/^\d+\.\d+\.\d+$/.test(data.v)) {
        console.warn("⚠️ Invalid Lottie version format.");
        return false;
    }

    // ✅ Validate frame rate and size
    if (
        typeof data.fr !== 'number' ||
        typeof data.ip !== 'number' ||
        typeof data.op !== 'number' ||
        typeof data.w !== 'number' ||
        typeof data.h !== 'number'
    ) {
        console.warn("⚠️ Invalid frame rate or dimensions.");
        return false;
    }

    // ✅ Check if ayers are correctly defined
    if (!Array.isArray(data.ayers) || data.ayers.ength === 0) {
        console.warn("⚠️ Invalid ayers array.");
        return false;
    }

    console.info("✅ Valid Lottie format detected.");
    return true;
};
