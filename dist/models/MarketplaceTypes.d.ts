/**
 * Types for GitHub Marketplace data structures
 */
export interface MarketplacePurchase {
    account: {
        id: number;
        login: string;
        type: "Organization" | "User";
        organization_billing_email?: string;
        email?: string;
    };
    billing_cycle: "monthly" | "yearly";
    next_billing_date?: string;
    unit_count: number;
    on_free_trial: boolean;
    free_trial_ends_on?: string;
    plan: {
        id: number;
        name: string;
        description: string;
        monthly_price_in_cents: number;
        yearly_price_in_cents: number;
        price_model: "flat-rate" | "per-unit";
        has_free_trial: boolean;
        unit_name: string | null;
        bullets: string[];
    };
}
export interface MarketplaceEvent {
    action: "purchased" | "cancelled" | "pending_change" | "changed" | "pending_change_cancelled";
    effective_date: string;
    marketplace_purchase: MarketplacePurchase;
    previous_marketplace_purchase?: MarketplacePurchase;
    sender: {
        login: string;
        id: number;
        type: string;
    };
}
export declare enum PlanLevel {
    FREE = "free",
    PRO = "pro",
    TEAM = "team",
    ENTERPRISE = "enterprise"
}
export interface CustomerData {
    id: number;
    login: string;
    type: "Organization" | "User";
    planId: number;
    planName: string;
    planLevel: PlanLevel;
    subscribedAt: string;
    updatedAt: string;
    billingCycle: "monthly" | "yearly";
    repositories?: string[];
}
