// types.ts (example file – you can store these wherever you like)

import type { Carrier } from '@prisma/client';

// 1) A type describing a "vendor" from your base list:
export interface BaseVendor {
	vendor: string;
	riskScoreCategory: string[];
	businessType: string;
	notes?: string;
}

// 2) The recommendation result shape from getRecommendations:
export interface RecommendationResult {
	top403b: BaseVendor[]; // up to 2 recommended carriers from the district & base
	all403b: Carrier[]; // entire list of district-approved 403(b) carriers
	fallbackIRA: BaseVendor[]; // your fallback IRA choices (usually 2, e.g. National Life Group & Midland)
	message: string; // a message/description for the front-end
}
