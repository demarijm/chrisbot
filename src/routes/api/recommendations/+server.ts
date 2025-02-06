import { json } from '@sveltejs/kit';
import { PrismaClient, type Carrier } from '@prisma/client';
import Fuse from 'fuse.js';

// -------------------------------------------
// 1) Types
// -------------------------------------------
export interface BaseVendor {
	vendor: string;
	riskScoreCategory: string[];
	businessType: string; // e.g. "403(b)" or "IRA"
	recommendedGrowthRate?: string; // e.g. "5%", "7-8%", etc.
	recommendedProductType?: string; // e.g. "Indexed Annuities", "Mutual Funds", etc.
	notes?: string;
}

export interface RecommendationResult {
	top403b: BaseVendor[]; // up to 2 recommended 403(b) carriers from the district & base
	all403b: Carrier[]; // entire list of district-approved 403(b) carriers
	fallbackIRA: BaseVendor[]; // fallback IRA choices (e.g. NLG & Midland)
	message: string; // a text explanation for the front-end
}

// -------------------------------------------
// 2) Base Vendor List
// -------------------------------------------
// In practice, you’ll probably keep your official “growth rates” / “product types” in your DB.
// But here’s a quick lookup table for demonstration:

// Based on your table:
//   National Life Group,   Conservative,     5%,        Indexed Annuities
//   Midland National,      Conservative,     5%,        Indexed Annuities
//   Equitable,             Balanced,         7-8%,      Indexed Annuities, Growth Mutual Funds
//   Security Benefit Group,Balanced,         7-8%,      Indexed Annuities, Growth Mutual Funds
//   Lincoln Investment,    Growth,           9-10%,     Growth Mutual Funds, Variable Annuities
//   PlanMember Services,   Growth,           9-10%,     Growth Mutual Funds, Variable Annuities
//   Lincoln Investment,    Aggressive Growth 10-12%,    High-Growth Mutual Funds, Variable Annuities
//   Equitable,             Aggressive Growth 10-12%,    High-Growth Mutual Funds, Variable Annuities

interface VendorDetails {
	growthRate: string;
	productType: string; // or you can store an array if you prefer
}

// Let’s store a simple dictionary keyed by “Vendor Name + Risk Category”
const RECOMMENDATION_LOOKUP: Record<string, VendorDetails> = {
	'National Life Group|Conservative': {
		growthRate: '5%',
		productType: 'Indexed Annuities'
	},
	'Midland National|Conservative': {
		growthRate: '5%',
		productType: 'Indexed Annuities'
	},
	'Equitable|Balanced': {
		growthRate: '7-8%',
		productType: 'Indexed Annuities, Growth Mutual Funds'
	},
	'Security Benefit Group|Balanced': {
		growthRate: '7-8%',
		productType: 'Indexed Annuities, Growth Mutual Funds'
	},
	'Lincoln Investment Planning|Growth': {
		growthRate: '9-10%',
		productType: 'Growth Mutual Funds, Variable Annuities'
	},
	'PlanMember Services|Growth': {
		growthRate: '9-10%',
		productType: 'Growth Mutual Funds, Variable Annuities'
	},
	'Lincoln Investment Planning|Aggressive Growth': {
		growthRate: '10-12%',
		productType: 'High-Growth Mutual Funds, Variable Annuities'
	},
	'Equitable|Aggressive Growth': {
		growthRate: '10-12%',
		productType: 'High-Growth Mutual Funds, Variable Annuities'
	}
};

function lookupVendorExtras(
	vendorName: string,
	risk: string
): { growthRate: string; productType: string } | null {
	const key = `${vendorName}|${risk}`;
	return RECOMMENDATION_LOOKUP[key] || null;
}

// (Optional) Some default fallback if we find no direct match in the dictionary
function getDefaultVendorExtras(risk: string): { growthRate: string; productType: string } {
	switch (risk.toLowerCase()) {
		case 'conservative':
			return { growthRate: '5%', productType: 'Indexed Annuities' };
		case 'balanced':
			return { growthRate: '7-8%', productType: 'Growth Mutual Funds or Indexed Annuities' };
		case 'growth':
			return { growthRate: '9-10%', productType: 'Growth Mutual Funds, Variable Annuities' };
		case 'aggressive growth':
			return { growthRate: '10-12%', productType: 'High-Growth Mutual Funds, Variable Annuities' };
		default:
			return { growthRate: 'N/A', productType: 'General Investments' };
	}
}

// Extra base vendors.  For demonstration:
const BASE_VENDORS: BaseVendor[] = [
	{
		vendor: 'National Life Group',
		riskScoreCategory: ['Conservative'],
		businessType: 'IRA'
	},
	{
		vendor: 'Midland National',
		riskScoreCategory: ['Conservative'],
		businessType: 'IRA'
	},
	{
		vendor: 'Fidelity',
		riskScoreCategory: ['Conservative', 'Balanced', 'Growth', 'Aggressive'],
		businessType: '403(b)'
	}
];

// For round-robin fallback if needed
const OTHER_CONSERVATIVE_FALLBACKS = ['North American', 'Global Atlantic', 'Symetra'];
const FOUR_ALTERNATIVES = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D'];

// -------------------------------------------
// 3) The getRecommendations function
// -------------------------------------------
function getRecommendations(
	districtCarriers: Carrier[] | null,
	userRisk: string | null
): RecommendationResult {
	const all403b = districtCarriers ?? [];

	const recommendationResult: RecommendationResult = {
		top403b: [],
		all403b,
		fallbackIRA: [],
		message: ''
	};

	//------------------------------------------------
	// 1) Special scenario-based logic for CONSERVATIVE
	//------------------------------------------------
	if (userRisk?.toLowerCase() === 'conservative') {
		const hasNLG = all403b.some(
			(c) =>
				c.name.toLowerCase().includes('national life group') || c.name.toLowerCase().includes('nlg')
		);
		const hasMidland = all403b.some((c) => c.name.toLowerCase().includes('midland'));

		const otherConservativeInDistrict = all403b.filter((c) =>
			OTHER_CONSERVATIVE_FALLBACKS.some((name) => c.name.toLowerCase().includes(name.toLowerCase()))
		);

		// SCENARIO A: NLG & Midland
		if (hasNLG && hasMidland) {
			recommendationResult.top403b = [
				makeRecommended('National Life Group', 'Conservative'),
				makeRecommended('Midland National', 'Conservative')
			];
			recommendationResult.message =
				'We recommend both National Life Group and Midland for your conservative profile.';
			return recommendationResult;
		}

		// SCENARIO B: Midland only
		if (hasMidland && !hasNLG) {
			const picks = [makeRecommended('Midland National', 'Conservative')];

			if (otherConservativeInDistrict.length > 0) {
				const secondCarrier = otherConservativeInDistrict[0];
				picks.push(makeRecommended(secondCarrier.name, 'Conservative'));
			} else {
				const randomIndex = Math.floor(Math.random() * FOUR_ALTERNATIVES.length);
				picks.push(makeRecommended(FOUR_ALTERNATIVES[randomIndex], 'Conservative'));
			}

			recommendationResult.top403b = picks;
			recommendationResult.message =
				'We recommend Midland plus one more conservative carrier for your profile.';
			return recommendationResult;
		}

		// SCENARIO C: NLG only
		if (!hasMidland && hasNLG) {
			const picks = [makeRecommended('National Life Group', 'Conservative')];

			if (otherConservativeInDistrict.length > 0) {
				const secondCarrier = otherConservativeInDistrict[0];
				picks.push(makeRecommended(secondCarrier.name, 'Conservative'));
			} else {
				const randomIndex = Math.floor(Math.random() * FOUR_ALTERNATIVES.length);
				picks.push(makeRecommended(FOUR_ALTERNATIVES[randomIndex], 'Conservative'));
			}

			recommendationResult.top403b = picks;
			recommendationResult.message =
				'We recommend National Life Group plus one more conservative carrier for your profile.';
			return recommendationResult;
		}

		// SCENARIO D: Neither NLG nor Midland
		const allConservative = all403b.filter((c) => {
			const lower = c.name.toLowerCase();
			return (
				lower.includes('national life group') ||
				lower.includes('midland') ||
				OTHER_CONSERVATIVE_FALLBACKS.some((vendor) => lower.includes(vendor.toLowerCase()))
			);
		});

		if (allConservative.length > 0) {
			recommendationResult.top403b = allConservative
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, 'Conservative'));
			recommendationResult.message =
				'We recommend two other conservative carriers available in your district.';
			return recommendationResult;
		}

		// If we get here, no recognized conservative carriers are in the district
		// => fallback IRA with NLG & Midland from our base list
		recommendationResult.fallbackIRA = BASE_VENDORS.filter((bv) =>
			['national life group', 'midland'].some((nm) => bv.vendor.toLowerCase().includes(nm))
		).map((bv) => makeRecommended(bv.vendor, 'Conservative', 'IRA'));
		recommendationResult.message =
			'No conservative 403(b) matches found; we suggest an IRA with NLG or Midland.';
		return recommendationResult;
	}

	//--------------------------------------------
	// 2) Non-Conservative logic (simplified)
	//--------------------------------------------
	if (all403b.length > 0 && userRisk) {
		// Example: filter carriers whose name includes the risk string (very naive!)
		const matched = all403b.filter((c) => c.name.toLowerCase().includes(userRisk.toLowerCase()));

		const topVendors = matched.map((c) => makeRecommended(c.name, userRisk, '403(b)'));

		// Keep up to 2
		recommendationResult.top403b = topVendors.slice(0, 2);
	}

	// If still empty, check for NLG/Midland
	if (recommendationResult.top403b.length === 0 && all403b.length > 0) {
		const nlgOrMidland = all403b.filter((carrier) => {
			const lower = carrier.name.toLowerCase();
			return (
				lower.includes('national life group') || lower.includes('nlg') || lower.includes('midland')
			);
		});

		if (nlgOrMidland.length > 0) {
			recommendationResult.top403b = nlgOrMidland
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, userRisk ?? '', '403(b)'));
		}
	}

	// Fallback IRA
	if (recommendationResult.top403b.length === 0) {
		recommendationResult.fallbackIRA = BASE_VENDORS.filter((bv) =>
			['national life group', 'midland'].some((nm) => bv.vendor.toLowerCase().includes(nm))
		).map((bv) => makeRecommended(bv.vendor, userRisk ?? '', 'IRA'));
	}

	// Final message
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

// Helper function to create a BaseVendor with recommended details
function makeRecommended(
	vendorName: string,
	risk: string,
	businessTypeOverride?: string
): BaseVendor {
	const vendorRisk = risk || 'Conservative'; // fallback if risk is empty
	const extras = lookupVendorExtras(vendorName, vendorRisk);
	let recommendedGrowthRate = extras?.growthRate;
	let recommendedProductType = extras?.productType;

	// If we don’t have a match in RECOMMENDATION_LOOKUP, we can choose a default
	if (!recommendedGrowthRate || !recommendedProductType) {
		const defaults = getDefaultVendorExtras(vendorRisk);
		if (!recommendedGrowthRate) recommendedGrowthRate = defaults.growthRate;
		if (!recommendedProductType) recommendedProductType = defaults.productType;
	}

	return {
		vendor: vendorName,
		riskScoreCategory: [vendorRisk],
		businessType: businessTypeOverride ?? '403(b)',
		recommendedGrowthRate,
		recommendedProductType
	};
}

// -------------------------------------------
// 4) The server route (+server.ts) using Prisma + Fuse
// -------------------------------------------
const prisma = new PrismaClient();

function normalizeDistrictName(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.trim();
}

export async function POST({ request }) {
	const { district: rawDistrict = '', risk: rawRisk = null } = await request.json();

	const districtNameRaw = rawDistrict.trim();
	const districtName = districtNameRaw ? normalizeDistrictName(districtNameRaw) : null;
	const userRisk = rawRisk ? rawRisk.toString().trim() : null;

	let districtCarriers: Carrier[] | null = null;
	let matchedDistrictName = null;

	if (districtName) {
		const allDistricts = await prisma.district.findMany({
			include: { carriers: true }
		});

		const fuseData = allDistricts.map((d) => ({
			...d,
			normalizedName: normalizeDistrictName(d.name)
		}));

		const fuse = new Fuse(fuseData, {
			keys: ['name', 'normalizedName'],
			threshold: 0.2,
			distance: 100, // (Optional) Default is 100; you can tweak
			minMatchCharLength: 3 // (Optional) Helps weed out very short partial matches
		});

		const searchResults = fuse.search(districtName);

		// If the search comes up empty, just send an empty array
		if (searchResults.length > 0) {
			const matchedDistrict = searchResults[0].item;
			matchedDistrictName = matchedDistrict.name;
			districtCarriers = matchedDistrict ? matchedDistrict.carriers : [];
		}
	}

	if (!matchedDistrictName) {
		matchedDistrictName = 'None';
	}

	const recommendationResult = getRecommendations(districtCarriers, userRisk);

	return json({
		district: matchedDistrictName,
		userRisk,
		selfEnroll:
			userRisk?.toLowerCase() === 'aggressive growth' ||
			userRisk?.toLowerCase() === 'most aggressive'
				? false
				: true,
		...recommendationResult
	});
}
