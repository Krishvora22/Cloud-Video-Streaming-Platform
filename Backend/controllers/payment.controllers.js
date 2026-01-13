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
        console.log("🔍 Verifying Session:", sessionId);

        // 1. Retrieve session and expand the subscription
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription'], 
        });

        if (session.payment_status === 'paid') {
            const userId = session.metadata.userId;
            const planType = session.metadata.planType;
            const subscription = session.subscription;

            console.log(`💳 Payment Verified for User: ${userId}, Plan: ${planType}`);

            // 2. Update Database
            // We use 'update' because we expect the user to already exist
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    stripeCustomerId: session.customer, // Save the ID for future billing
                    plan: 'premium',
                    planInterval: planType,
                    subscriptionStatus: 'active',
                    subscriptionId: subscription.id,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                }
            });

            console.log("✅ Database successfully updated for:", updatedUser.email);
            return res.status(200).json({ success: true });
        }

        console.log("❌ Payment status not 'paid':", session.payment_status);
        res.status(400).json({ message: "Payment was not successful" });
    } catch (error) {
        console.error("🚨 Verification Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};