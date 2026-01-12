import Stripe from 'stripe';
import { prisma } from '../config/db.js';
// 1. IMPORT THE EMAIL FUNCTION
import { sendPaymentSuccessEmail } from '../utils/mail.js'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define Plans (No changes here)
const PLANS = {
    'monthly': {
        name: 'Premium Monthly',
        price: 999,
        interval: 'month',
        interval_count: 1
    },
    'half_yearly': {
        name: 'Premium 6 Months',
        price: 4999,
        interval: 'month',
        interval_count: 6
    },
    'yearly': {
        name: 'Premium Yearly',
        price: 8999,
        interval: 'year',
        interval_count: 1
    }
};

// 1. Create Checkout Session
export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const { planType } = req.body;

        const selectedPlan = PLANS[planType];
        if (!selectedPlan) {
            return res.status(400).json({ message: "Invalid plan type." });
        }

        let user = await prisma.user.findUnique({ where: { id: userId } });
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: { userId: userId }
            });
            stripeCustomerId = customer.id;
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId }
            });
        }

        // Create Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selectedPlan.name,
                            description: `Access to all premium content for ${selectedPlan.interval_count} ${selectedPlan.interval}(s)`,
                        },
                        unit_amount: selectedPlan.price,
                        recurring: {
                            interval: selectedPlan.interval,
                            interval_count: selectedPlan.interval_count
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                planType: planType 
            },
            success_url: `${process.env.CLIENT_URL}/payment/success`,
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        });

        res.status(200).json({ success: true, url: session.url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Payment Error", error: error.message });
    }
};

// 2. Webhook (Now sends Email!)
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        const user = await prisma.user.findUnique({
            where: { stripeCustomerId: session.customer }
        });

        if (user) {
            // A. Update Database
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    plan: 'premium',
                    planInterval: session.metadata.planType,
                    subscriptionStatus: 'active',
                    subscriptionId: session.subscription,
                    currentPeriodStart: new Date(subscription.current_period_start * 1000),
                    currentPeriodEnd:   new Date(subscription.current_period_end * 1000)
                }
            });
            console.log(`✅ User ${user.email} upgraded!`);

            // B. SEND EMAIL (This is the new part)
            const amountPaid = (session.amount_total / 100).toFixed(2);
            
            await sendPaymentSuccessEmail(user.email, {
                plan: (session.metadata.planType || "Premium").toUpperCase(),
                amount: amountPaid,
                date: new Date().toLocaleString(),
                transactionId: session.payment_intent || session.id
            });
        }
    }
    
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const user = await prisma.user.findUnique({ where: { subscriptionId: subscription.id }});
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { plan: 'free', subscriptionStatus: 'canceled' }
            });
        }
    }

    res.status(200).send();
};