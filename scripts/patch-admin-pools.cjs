const fs = require("fs");
const path = require("path");

// ─── 1. Update admin.tsx — add Asset Pools tab ─────────────────────────────
const adminPath = path.join(__dirname, "../src/routes/_authenticated/admin.tsx");
let admin = fs.readFileSync(adminPath, "utf8");

// Add import
if (!admin.includes("AssetPoolsAdminPanel")) {
  admin = admin.replace(
    `import { DriversFleetPanel } from "@/components/admin-drivers-panel";`,
    `import { DriversFleetPanel } from "@/components/admin-drivers-panel";\nimport { AssetPoolsAdminPanel } from "@/components/admin-asset-pools-panel";\nimport { LayoutGrid } from "lucide-react";`
  );
  console.log("✅ admin.tsx: added AssetPoolsAdminPanel import");
} else {
  console.log("ℹ️  admin.tsx: AssetPoolsAdminPanel already imported");
}

// Add tab type
if (!admin.includes(`| "pools"`)) {
  admin = admin.replace(
    `  | "settings";`,
    `  | "pools"\n  | "settings";`
  );
  console.log("✅ admin.tsx: added 'pools' tab type");
}

// Add NAV entry
if (!admin.includes(`id: "pools"`)) {
  admin = admin.replace(
    `  { id: "settings", label: "Banking", icon: Landmark },`,
    `  { id: "pools", label: "Asset Pools", icon: LayoutGrid },\n  { id: "settings", label: "Banking", icon: Landmark },`
  );
  console.log("✅ admin.tsx: added Asset Pools nav item");
}

fs.writeFileSync(adminPath, admin, "utf8");
console.log("✅ admin.tsx patched");

// Now we need to find where the tab content is rendered and add pools tab content.
// The admin page renders tabs via switch/if or object. Let's find the pattern.
const adminContent = fs.readFileSync(adminPath, "utf8");
// Check if there's a tab content switch
if (adminContent.includes(`tab === "settings"`) && !adminContent.includes(`tab === "pools"`)) {
  // Find the pattern for adding pools content to the render
  // The admin page likely has a section that renders based on tab
  // Let's search for where "drivers" tab content is rendered
  // Common pattern: returning different JSX based on tab
  // We need to add the pools case near drivers
  const updated = adminContent.replace(
    `          {tab === "drivers" && <DriversFleetPanel />}`,
    `          {tab === "drivers" && <DriversFleetPanel />}\n          {tab === "pools" && <AssetPoolsAdminPanel />}`
  );
  if (updated !== adminContent) {
    fs.writeFileSync(adminPath, updated, "utf8");
    console.log("✅ admin.tsx: added pools tab render (pattern 1)");
  } else {
    console.log("⚠️  admin.tsx: Could not find drivers tab render — will search for alternative");
    // Try another common pattern
    const updated2 = adminContent.replace(
      `{tab === "drivers" && (`,
      `{tab === "pools" && <AssetPoolsAdminPanel />}\n          {tab === "drivers" && (`
    );
    if (updated2 !== adminContent) {
      fs.writeFileSync(adminPath, updated2, "utf8");
      console.log("✅ admin.tsx: added pools tab render (pattern 2)");
    } else {
      console.log("❌ admin.tsx: manual insertion needed for pools render");
    }
  }
} else if (adminContent.includes(`tab === "pools"`)) {
  console.log("ℹ️  admin.tsx: pools tab content already present");
}
