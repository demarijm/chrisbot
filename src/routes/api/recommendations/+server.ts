// +server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient, Carrier } from '@prisma/client';
import Fuse from 'fuse.js';

// -------------------------------------------
// 1) Types
// -------------------------------------------
export interface BaseVendor {
	vendor: string;
	riskScoreCategory: string[];
	businessType: string;
	notes?: string;
}

export interface RecommendationResult {
	top403b: BaseVendor[]; // up to 2 recommended 403(b) carriers from the district & base
	all403b: Carrier[]; // entire list of district-approved 403(b) carriers
	fallbackIRA: BaseVendor[]; // your fallback IRA choices (e.g. NLG & Midland)
	message: string; // a text explanation for the front-end
}

// -------------------------------------------
// 2) Base Vendor List (example)
// -------------------------------------------
const BASE_VENDORS: BaseVendor[] = [
	{
		vendor: 'National Life Group',
		riskScoreCategory: ['Moderate'],
		businessType: 'IRA'
	},
	{
		vendor: 'Midland',
		riskScoreCategory: ['Moderate'],
		businessType: 'IRA'
	},
	{
		vendor: 'Fidelity',
		riskScoreCategory: ['Conservative', 'Moderate', 'Aggressive'],
		businessType: '403(b)'
	}
	// add as many base vendors as you like
];

// -------------------------------------------
// 3) The getRecommendations function
// -------------------------------------------
function getRecommendations(
	districtCarriers: Carrier[] | null,
	userRisk: string | null
): RecommendationResult {
	// Always store all carriers (or an empty array if none).
	const all403b = districtCarriers ?? [];

	// Initialize our return object
	const recommendationResult: RecommendationResult = {
		top403b: [],
		all403b,
		fallbackIRA: [],
		message: ''
	};

	// (A) Attempt to pick “top” 403(b) carriers from the district
	if (all403b.length > 0 && userRisk) {
		// Example: filter carriers whose name includes the risk string (very naive!)
		const matched = all403b.filter((c) => c.name.toLowerCase().includes(userRisk.toLowerCase()));

		// Convert these “Carriers” into “BaseVendor” shape
		const topVendors = matched.map((c) => ({
			vendor: c.name,
			riskScoreCategory: [userRisk],
			businessType: '403(b)'
		}));

		// Keep up to 2
		recommendationResult.top403b = topVendors.slice(0, 2);
	}

	// (B) If top403b is still empty, but NLG or Midland are in the district carriers, recommend them
	if (recommendationResult.top403b.length === 0 && all403b.length > 0) {
		const nlgOrMidland = all403b.filter((carrier) => {
			const lower = carrier.name.toLowerCase();
			return (
				lower.includes('national life group') || lower.includes('nlg') || lower.includes('midland')
			);
		});

		if (nlgOrMidland.length > 0) {
			// Up to 2
			recommendationResult.top403b = nlgOrMidland.slice(0, 2).map((c) => ({
				vendor: c.name,
				riskScoreCategory: [],
				businessType: '403(b)'
			}));
		}
	}

	// (C) If we still have no 403(b) picks, fallback to an IRA with NLG & Midland from our base list
	if (recommendationResult.top403b.length === 0) {
		recommendationResult.fallbackIRA = BASE_VENDORS.filter(
			(bv) =>
				bv.vendor.toLowerCase().includes('national life') ||
				bv.vendor.toLowerCase().includes('midland')
		);
	}

	// (D) Final message
	if (recommendationResult.top403b.length > 0) {
		recommendationResult.message =
			'We found some 403(b) carriers matching your district and risk preferences.';
	} else if (recommendationResult.fallbackIRA.length > 0) {
		recommendationResult.message =
			'No 403(b) matches were found, so we suggest an IRA with National Life Group or Midland.';
	} else {
		recommendationResult.message = 'No matches found.';
	}

	return recommendationResult;
}

// -------------------------------------------
// 4) The server route (+server.ts) using Prisma + Fuse
// -------------------------------------------
const prisma = new PrismaClient();

// Simple “clean up” function for district names
function normalizeDistrictName(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.trim();
}

// The POST handler
export async function POST({ request }) {
	const { district: rawDistrict = '', risk: rawRisk = null } = await request.json();

	// Clean + normalize user input
	const districtNameRaw = rawDistrict.trim();
	const districtName = districtNameRaw ? normalizeDistrictName(districtNameRaw) : null;
	const userRisk = rawRisk ? rawRisk.toString().trim() : null;

	let districtCarriers: Carrier[] | null = null;
	let matchedDistrictName = null;

	if (districtName) {
		// 1. Grab all districts (or a filtered subset if your table is huge).
		const allDistricts = await prisma.district.findMany({
			include: { carriers: true }
		});

		// 2. Initialize Fuse with both name + normalizedName
		const fuseData = allDistricts.map((d) => ({
			...d,
			normalizedName: normalizeDistrictName(d.name)
		}));

		const fuse = new Fuse(fuseData, {
			keys: ['name', 'normalizedName'],
			threshold: 0.3 // tweak as needed
		});

		// 3. Search user input with Fuse
		const searchResults = fuse.search(districtName);

		// 4. If we get a result, pick the best match
		if (searchResults.length > 0) {
			const bestMatch = searchResults[0].item;
			districtCarriers = bestMatch.carriers;
			matchedDistrictName = bestMatch.name;
		}
	}

	// Fall back if we didn’t find anything
	if (!matchedDistrictName) {
		matchedDistrictName = 'None';
	}

	// Use the carriers + risk to get final recommendations (with fallback logic)
	const recommendationResult = getRecommendations(districtCarriers, userRisk);

	return json({
		district: matchedDistrictName,
		userRisk,
		...recommendationResult
	});
}
