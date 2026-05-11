import Stripe from "stripe";
import { PLANS } from "./stripe-plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export { PLANS };
export type { Plan } from "./stripe-plans";
