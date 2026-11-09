import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let { data } = await supabase.auth.getUser();

    // If getUser didn't find a user immediately, check if OAuth tokens or session are settling in browser
    if (!data.user && typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const isOAuth =
        hash.includes("access_token=") ||
        hash.includes("refresh_token=") ||
        search.includes("code=") ||
        sessionStorage.getItem("motus:oauth-in-progress") === "true";

      if (isOAuth) {
        const sessionRes = await supabase.auth.getSession();
        if (sessionRes.data.session?.user) {
          data = { user: sessionRes.data.session.user };
        } else {
          // Wait briefly for supabase auth to extract tokens from URL
          await new Promise<void>((resolve) => {
            let unsubscribed = false;
            const timeout = setTimeout(() => {
              if (!unsubscribed) {
                sub?.subscription.unsubscribe();
                resolve();
              }
            }, 3000);

            const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
              if (session?.user) {
                unsubscribed = true;
                clearTimeout(timeout);
                data = { user: session.user };
                sub.subscription.unsubscribe();
                resolve();
              }
            });
          });
        }
      }
    }

    if (!data.user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
