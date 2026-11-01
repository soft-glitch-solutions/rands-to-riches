import { lovable } from "@/integrations/lovable/index";

export const PENDING_AMOUNT_KEY = "motus:pending-amount";

/** Remember an investment intent so the dashboard can pick it up after social sign-in. */
export function savePendingAmount(amount: number) {
  try {
    sessionStorage.setItem(PENDING_AMOUNT_KEY, String(amount));
  } catch {
    // sessionStorage unavailable; intent is simply not carried over
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

async function handleSocialResult(
  result: Awaited<ReturnType<typeof lovable.auth.signInWithOAuth>>,
): Promise<string | null> {
  if (result.error) return result.error.message;
  if (result.redirected) return null; // browser navigates to the provider
  return null; // session already set; caller reads session state and navigates
}

export function signInWithGoogle(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);
  return lovable.auth
    .signInWithOAuth("google", { redirect_uri: window.location.origin })
    .then(handleSocialResult);
}

export function signInWithLovable(amount?: number) {
  if (amount !== undefined) savePendingAmount(amount);
  return lovable.auth
    .signInWithOAuth("lovable", { redirect_uri: window.location.origin })
    .then(handleSocialResult);
}
