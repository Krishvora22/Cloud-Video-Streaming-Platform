export const checkSubscription = async (req, res, next) => {
    try {
        const user = req.user; 

        if (user.plan === 'premium') {
            return next();
        }

        const now = new Date();
        
        if (user.trialEndsAt && user.trialEndsAt > now) {
            return next();
        }

        return res.status(403).json({ 
            message: "Free trial expired. Please upgrade to Premium to continue watching.",
            code: "TRIAL_EXPIRED" // Frontend can use this code to show a Payment Popup
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error checking subscription" });
    }
};