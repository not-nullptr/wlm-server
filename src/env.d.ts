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
