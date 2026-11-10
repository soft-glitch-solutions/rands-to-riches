const fs = require("fs");
const path = require("path");

const typesPath = path.join(__dirname, "../src/integrations/supabase/types.ts");
let content = fs.readFileSync(typesPath, "utf8");

// --- asset_pools type ---
const assetPoolsType = `      asset_pools: {
        Row: {
          created_at: string
          current_amount_cents: number
          description: string
          driver_id: string | null
          funded_at: string | null
          id: string
          image_url: string | null
          matures_at: string | null
          min_contribution_cents: number
          return_rate_pct: number
          share_code: string | null
          status: string
          target_amount_cents: number
          term_days: number
          tier: string
          title: string
          updated_at: string
          vehicle_model: string
          vehicle_reg: string
          vehicle_type: string
          weekly_rental_revenue_cents: number
        }
        Insert: {
          created_at?: string
          current_amount_cents?: number
          description?: string
          driver_id?: string | null
          funded_at?: string | null
          id?: string
          image_url?: string | null
          matures_at?: string | null
          min_contribution_cents?: number
          return_rate_pct?: number
          share_code?: string | null
          status?: string
          target_amount_cents: number
          term_days?: number
          tier?: string
          title: string
          updated_at?: string
          vehicle_model?: string
          vehicle_reg?: string
          vehicle_type?: string
          weekly_rental_revenue_cents?: number
        }
        Update: {
          created_at?: string
          current_amount_cents?: number
          description?: string
          driver_id?: string | null
          funded_at?: string | null
          id?: string
          image_url?: string | null
          matures_at?: string | null
          min_contribution_cents?: number
          return_rate_pct?: number
          share_code?: string | null
          status?: string
          target_amount_cents?: number
          term_days?: number
          tier?: string
          title?: string
          updated_at?: string
          vehicle_model?: string
          vehicle_reg?: string
          vehicle_type?: string
          weekly_rental_revenue_cents?: number
        }
        Relationships: []
      }
`;

// --- pool_contributions type ---
const poolContribsType = `      pool_contributions: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          matures_at: string | null
          payment_reference: string | null
          payout_amount_cents: number | null
          pool_id: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          matures_at?: string | null
          payment_reference?: string | null
          payout_amount_cents?: number | null
          pool_id: string
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          matures_at?: string | null
          payment_reference?: string | null
          payout_amount_cents?: number | null
          pool_id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
`;

// Insert before "drivers:" table block
const driverMarker = "      drivers: {";
if (!content.includes("asset_pools:")) {
  content = content.replace(driverMarker, assetPoolsType + driverMarker);
  console.log("✅ Inserted asset_pools type");
} else {
  console.log("ℹ️  asset_pools already present");
}

// Insert before "driver_earnings:" table block
const driverEarningsMarker = "      driver_earnings: {";
if (!content.includes("pool_contributions:")) {
  content = content.replace(driverEarningsMarker, poolContribsType + driverEarningsMarker);
  console.log("✅ Inserted pool_contributions type");
} else {
  console.log("ℹ️  pool_contributions already present");
}

fs.writeFileSync(typesPath, content, "utf8");
console.log("✅ Done — types.ts updated");
