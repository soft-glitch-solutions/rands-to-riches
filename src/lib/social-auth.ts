import { lovable } from "@/integrations/lovable/index";

export const PENDING_AMOUNT_KEY = "motus:pending-amount";
export const OAUTH_REDIRECT_INTENT_KEY = "motus:oauth-in-progress";

/** Remember an investment intent so the dashboard can pick it up after social sign-in. */
export function savePendingAmount(amount: number) {
  try {
    sessionStorage.setItem(PENDING_AMOUNT_KEY, String(amount));
  } catch {
    // sessionStorage unavailable
  }
}

export function takePendingAmount(): number | null {
  try {
    const raw = sessionStorage.getItem(PENDING_AMOUNT_KEY);
    if (raw === null) return null;

    sessionStorage.removeItem(PENDING_AMOUNT_KEY);

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** Where OAuth providers send users back to after sign-in. */
export function getOAuthRedirect(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/dashboard`;
  }
  return "/dashboard";
}

function markOAuthInProgress() {
  try {
    sessionStorage.setItem(OAUTH_REDIRECT_INTENT_KEY, "true");
  } catch {
    // ignore
  }
}

async function handleSocialResult(
  result: Awaited<ReturnType<typeof lovable.auth.signInWithOAuth>>,
): Promise<string | null> {
  if (result.error) return result.error.message;
  if (result.redirected) return null;
  return null;
}

export function signInWithGoogle(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);
  markOAuthInProgress();

  return lovable.auth
    .signInWithOAuth("google", {
      redirect_uri: getOAuthRedirect(),
    })
    .then(handleSocialResult);
}

export function signInWithApple(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);
  markOAuthInProgress();

  return lovable.auth
    .signInWithOAuth("apple", {
      redirect_uri: getOAuthRedirect(),
    })
    .then(handleSocialResult);
}

export function signInWithFacebook(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);
  markOAuthInProgress();

  return lovable.auth
    .signInWithOAuth("facebook", {
      redirect_uri: getOAuthRedirect(),
    })
    .then(handleSocialResult);
}
