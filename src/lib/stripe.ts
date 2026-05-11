import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    displayPrice: "$0/mo",
    signupLimit: 50,
    waitlistLimit: 1,
    features: ["1 waitlist", "50 signups/mo", "Basic form fields", "CSV export"],
  },
  starter: {
    name: "Starter",
    price: 2900, // cents
    displayPrice: "$29/mo",
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "",
    signupLimit: 1000,
    waitlistLimit: 5,
    features: ["5 waitlists", "1,000 signups/mo", "Custom fields", "Email notifications", "CSV export", "Custom branding"],
  },
  pro: {
    name: "Pro",
    price: 7900, // cents
    displayPrice: "$79/mo",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
    signupLimit: -1, // unlimited
    waitlistLimit: -1, // unlimited
    features: ["Unlimited waitlists", "Unlimited signups", "Priority support", "Custom domain (soon)", "Webhook notifications", "API access", "White-label"],
  },
} as const;

export type Plan = keyof typeof PLANS;
