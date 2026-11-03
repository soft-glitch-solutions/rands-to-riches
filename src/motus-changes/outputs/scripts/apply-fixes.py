#!/usr/bin/env python3
"""Applies the small type-check fixes to faq.tsx, auth.tsx and signup.tsx.
Run from the repo root:  python3 scripts/apply-fixes.py
Each replacement must match exactly once, otherwise the script stops."""
import pathlib, sys

OLD_VALIDATE = '''  validateSearch: (search: Record<string, unknown>): { amount?: number } => {
    const raw = Number(search["amount"]);
    return {
      amount: search["amount"] !== undefined ? clampInvestment(raw) : undefined,
    };
  },'''
NEW_VALIDATE = '  validateSearch: parseAmountSearch,'

EDITS = {
  "src/routes/faq.tsx": [
    ('import { cn } from "@/lib/utils";',
     'import { cn } from "@/lib/utils";\nimport { Button } from "@/components/ui/button";'),
  ],
  "src/routes/auth.tsx": [
    (OLD_VALIDATE, NEW_VALIDATE),
    ('import { clampInvestment, formatRand } from "@/lib/investment";',
     'import { parseAmountSearch } from "@/lib/search";'),
    ('navigate({ to: "/dashboard", ...(amount !== undefined ? { search: { amount } } : {}) });',
     'navigate({ to: "/dashboard", search: amount !== undefined ? { amount } : {} });'),
    ('search={amount !== undefined ? { amount } : undefined}',
     'search={amount !== undefined ? { amount } : {}}'),
  ],
  "src/routes/signup.tsx": [
    (OLD_VALIDATE, NEW_VALIDATE),
    ('import { clampInvestment, formatRand } from "@/lib/investment";',
     'import { formatRand } from "@/lib/investment";\nimport { parseAmountSearch } from "@/lib/search";'),
  ],
}

for path, edits in EDITS.items():
    p = pathlib.Path(path)
    text = p.read_text()
    for old, new in edits:
        if text.count(old) != 1:
            sys.exit(f"{path}: expected exactly one match for:\n{old[:80]}...")
        text = text.replace(old, new)
    p.write_text(text)
    print("patched", path)
