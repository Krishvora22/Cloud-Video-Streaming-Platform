import Stripe from 'stripe';
import { prisma } from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
    'monthly': { name: 'Premium Monthly', price: 999, interval: 'month', interval_count: 1 },
    'half_yearly': { name: 'Premium 6 Months', price: 4999, interval: 'month', interval_count: 6 },
    'yearly': { name: 'Premium Yearly', price: 8999, interval: 'year', interval_count: 1 }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { planType } = req.body;
        const selectedPlan = PLANS[planType];
        const userId = req.user.id; // Ensure your isAuth middleware provides this

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: selectedPlan.name },
                    unit_amount: selectedPlan.price,
                    recurring: { 
                        interval: selectedPlan.interval, 
                        interval_count: selectedPlan.interval_count 
                    },
                },
                quantity: 1,
            }],
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/pricing`,
            // THIS METADATA IS COLLECTED ON SUCCESS
            metadata: { 
                userId: userId, 
                planType: planType 
            }
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Session Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        console.log("🔍 Verifying Session ID:", sessionId);

        // 1. Retrieve session and expand the subscription object
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription'], 
        });

        // Check if payment is paid AND subscription object exists
        if (session.payment_status === 'paid' && session.subscription) {
            const userId = session.metadata.userId;
            const planType = session.metadata.planType;
            
            // This is the full subscription object from Stripe
            const subscription = session.subscription;

            // DEBUG LOGS: Check your terminal for these!
            console.log("Stripe Start (Unix):", subscription.current_period_start);
            console.log("Stripe End (Unix):", subscription.current_period_end);

            // FIX: Convert Unix seconds to Javascript Milliseconds
            // We use optional chaining and a hard fallback to prevent "Invalid Date"
            const startDate = subscription.current_period_start 
                ? new Date(subscription.current_period_start * 1000) 
                : new Date();

            const endDate = subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000) 
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default +30 days if error

            console.log("Converted Start Date:", startDate);
            console.log("Converted End Date:", endDate);

            // 2. Update Database
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeCustomerId: session.customer,
                    plan: 'premium',
                    planInterval: planType,
                    subscriptionStatus: 'active',
                    subscriptionId: subscription.id,
                    currentPeriodStart: startDate, 
                    currentPeriodEnd: endDate,     
                }
            });

            console.log("✅ Database updated for user:", updatedUser.id);
            return res.status(200).json({ success: true, user: updatedUser });
        }

        console.log("❌ Payment not paid or subscription missing");
        return res.status(400).json({ message: "Subscription data missing or payment unpaid" });

    } catch (error) {
        // This catch block prevents the server from hanging on a 500 error
        console.error("🚨 Prisma or Stripe Error:", error.message);
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};