const fs = require("fs");
const path = require("path");

// ─── 1. Patch admin.tsx ────────────────────────────────────────────────────
const adminPath = path.join(__dirname, "../src/routes/_authenticated/admin.tsx");
let admin = fs.readFileSync(adminPath, "utf8");

// Add import after DriversFleetPanel import
if (!admin.includes("AssetPoolsAdminPanel")) {
  admin = admin.replace(
    `import { DriversFleetPanel } from "@/components/admin-drivers-panel";`,
    `import { DriversFleetPanel } from "@/components/admin-drivers-panel";\r\nimport { AssetPoolsAdminPanel } from "@/components/admin-asset-pools-panel";\r\nimport { LayoutGrid } from "lucide-react";`
  );
  console.log("✅ admin: AssetPoolsAdminPanel import added");
} else {
  console.log("ℹ️  admin: import already present");
}

// Add tab type (before "settings")
if (!admin.includes(`| "pools"`)) {
  admin = admin.replace(
    `  | "settings";`,
    `  | "pools"\r\n  | "settings";`
  );
  console.log("✅ admin: 'pools' tab type added");
}

// Add NAV entry before settings
if (!admin.includes(`id: "pools"`)) {
  admin = admin.replace(
    `  { id: "settings", label: "Banking", icon: Landmark },`,
    `  { id: "pools", label: "Asset Pools", icon: LayoutGrid },\r\n  { id: "settings", label: "Banking", icon: Landmark },`
  );
  console.log("✅ admin: Asset Pools nav item added");
}

// Add tabContent entry for pools (after drivers)
if (!admin.includes(`pools: <AssetPoolsAdminPanel`)) {
  admin = admin.replace(
    `    drivers: <DriversFleetPanel />,`,
    `    drivers: <DriversFleetPanel />,\r\n    pools: <AssetPoolsAdminPanel />,`
  );
  console.log("✅ admin: tabContent pools entry added");
}

fs.writeFileSync(adminPath, admin, "utf8");
console.log("✅ admin.tsx patching complete");


// ─── 2. Patch dashboard.tsx — add Pools tab ────────────────────────────────
const dashPath = path.join(__dirname, "../src/routes/_authenticated/dashboard.tsx");
let dash = fs.readFileSync(dashPath, "utf8");

// Add import
if (!dash.includes("DashboardPoolsTab")) {
  dash = dash.replace(
    `import { ProfilePanel } from "@/components/profile-panel";`,
    `import { ProfilePanel } from "@/components/profile-panel";\r\nimport { DashboardPoolsTab } from "@/components/dashboard-pools-tab";\r\nimport { Layers } from "lucide-react";`
  );
  console.log("✅ dashboard: DashboardPoolsTab import added");
}

// Add tab type
if (!dash.includes(`"pools"`)) {
  dash = dash.replace(
    `type Tab = "invest" | "cycles" | "analytics" | "account";`,
    `type Tab = "invest" | "pools" | "cycles" | "analytics" | "account";`
  );
  console.log("✅ dashboard: 'pools' tab type added");

  // Add nav item
  dash = dash.replace(
    `  { id: "cycles", label: "Cycles", icon: ListChecks },`,
    `  { id: "cycles", label: "Cycles", icon: ListChecks },\r\n  { id: "pools", label: "Pools", icon: Layers },`
  );
  console.log("✅ dashboard: Pools nav item added");
}

// Add tabContent pools entry — look for analytics entry
if (!dash.includes(`pools: <DashboardPoolsTab`)) {
  dash = dash.replace(
    `    analytics: <DashboardAnalytics />,`,
    `    pools: <DashboardPoolsTab />,\r\n    analytics: <DashboardAnalytics />,`
  );
  console.log("✅ dashboard: tabContent pools entry added");
}

// Fix grid-cols count (4 → 5) in mobile nav
if (dash.includes(`grid grid-cols-4 p-1.5`)) {
  dash = dash.replace(`grid grid-cols-4 p-1.5`, `grid grid-cols-5 p-1.5`);
  console.log("✅ dashboard: mobile nav grid cols updated to 5");
}

fs.writeFileSync(dashPath, dash, "utf8");
console.log("✅ dashboard.tsx patching complete");
