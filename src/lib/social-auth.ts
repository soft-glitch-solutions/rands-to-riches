import { lovable } from "@/integrations/lovable/index";

export const PENDING_AMOUNT_KEY = "motus:pending-amount";

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
const OAUTH_REDIRECT = `${window.location.origin}/dashboard`;

async function handleSocialResult(
  result: Awaited<ReturnType<typeof lovable.auth.signInWithOAuth>>,
): Promise<string | null> {
  if (result.error) return result.error.message;
  if (result.redirected) return null;
  return null;
}

export function signInWithGoogle(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);

  return lovable.auth
    .signInWithOAuth("google", {
      redirect_uri: OAUTH_REDIRECT,
    })
    .then(handleSocialResult);
}

export function signInWithApple(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);

  return lovable.auth
    .signInWithOAuth("apple", {
      redirect_uri: OAUTH_REDIRECT,
    })
    .then(handleSocialResult);
}

export function signInWithFacebook(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);

  return lovable.auth
    .signInWithOAuth("facebook", {
      redirect_uri: OAUTH_REDIRECT,
    })
    .then(handleSocialResult);
}