declare namespace Express {
	export interface Request {
		rawBody: string;
	}
}

declare module "net" {
	export interface Socket {
		passport?: string;
		sessionId?: string;
		ticket?: string;
	}
}

namespace NodeJS {
	export interface ProcessEnv {
		JWT_SECRET: string;
	}
}
