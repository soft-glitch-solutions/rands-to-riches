import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { mergePendingPayments } from "@/server-fn/admin";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the legal pages without falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/terms").at(-1)?.routeId).not.toBe(rootRouteId);
    expect(router.matchRoutes("/privacy").at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the public pool landing page without falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/pools").at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("keeps pool approvals alongside cycle approvals in the admin deposit queue", () => {
    const pending = mergePendingPayments(
      [
        { createdAt: "2024-01-01T00:00:00.000Z", kind: "investment" as const },
        { createdAt: "2024-01-03T00:00:00.000Z", kind: "investment" as const },
      ],
      [
        { createdAt: "2024-01-02T00:00:00.000Z", kind: "pool" as const },
      ],
    );

    expect(pending.map((item) => item.kind)).toEqual([
      "investment",
      "pool",
      "investment",
    ]);
  });
});
