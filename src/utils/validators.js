const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export function validateGitHubUsername(username) {
    if (!username || username.trim() === "") {
        return { valid: false, error: "Username cannot be empty" };
    }

    const trimmed = username.trim();

    if (trimmed.length > 39) {
        return { valid: false, error: "Username must be 39 characters or less" };
    }

    if (trimmed.startsWith("-")) {
        return { valid: false, error: "Username cannot start with a hyphen" };
    }

    if (trimmed.endsWith("-")) {
        return { valid: false, error: "Username cannot end with a hyphen" };
    }

    if (trimmed.includes("--")) {
        return { valid: false, error: "Username cannot have consecutive hyphens" };
    }

    if (!GITHUB_USERNAME_REGEX.test(trimmed)) {
        return { valid: false, error: "Username can only contain letters, numbers, and single hyphens" };
    }

    return { valid: true, error: null };
}

export function isValidGitHubUsername(username) {
    return validateGitHubUsername(username).valid;
}
