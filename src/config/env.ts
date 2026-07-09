import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, fallback?: string): string {
	const value = process.env[key] ?? fallback;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const env = {
	port: getEnv("PORT", "5000"),
	databaseUrl: getEnv("DATABASE_URL"),
	jwtSecret: getEnv("JWT_SECRET"),
	jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
	stripeSecretKey: getEnv("STRIPE_SECRET_KEY"),
	stripePublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY"),
	stripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET"),
	clientUrl: getEnv("CLIENT_URL", "*"),
	nodeEnv: getEnv("NODE_ENV", "development"),
};
