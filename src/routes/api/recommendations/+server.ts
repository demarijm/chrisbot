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
	top403b: BaseVendor[]; // up to 2 recommended 403(b) carriers
	all403b: Carrier[]; // entire list of district-approved 403(b) carriers
	fallbackIRA: BaseVendor[]; // fallback IRA choices (e.g. NLG & Midland) if no 403(b) match
	message: string; // textual explanation for the front-end
}

// -------------------------------------------
// 2) Base Vendor List (for IRA fallback, etc.)
// -------------------------------------------
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
	}
	// Add others if needed
];

// For demonstration: potential “similar” conservative carriers
const OTHER_CONSERVATIVE_FALLBACKS = ['North American', 'Global Atlantic', 'Symetra'];
const OTHER_BALANCED_FALLBACKS = ['Fidelity', 'TIAA']; // Example
const OTHER_GROWTH_FALLBACKS = ['Voya', 'MassMutual']; // Example
const OTHER_AGGRESSIVE_FALLBACKS = ['AIG', 'Transamerica']; // Example

// Optional random filler if we need to pick a second vendor but can’t find any in district
const RANDOM_PLACEHOLDER = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D'];

// -------------------------------------------
// 3) Vendor Growth Rate / Product Type Lookup
// -------------------------------------------
interface VendorDetails {
	growthRate: string;
	productType: string; // or an array if you prefer
}

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

function getDefaultVendorExtras(risk: string): { growthRate: string; productType: string } {
	switch (risk.toLowerCase()) {
		case 'short-term':
			return { growthRate: '5%', productType: 'Indexed Annuities' };
		case 'conservative':
			return { growthRate: '5%', productType: 'Indexed Annuities' };
		case 'balanced':
			return { growthRate: '7-8%', productType: 'Indexed Annuities, Growth Mutual Funds' };
		case 'growth':
			return { growthRate: '9-10%', productType: 'Growth Mutual Funds, Variable Annuities' };
		case 'aggressive growth':
			return { growthRate: '10-12%', productType: 'High-Growth Mutual Funds, Variable Annuities' };
		default:
			return { growthRate: 'N/A', productType: 'General Investments' };
	}
}

// -------------------------------------------
// 4) The main getRecommendations function
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

	// If user did not provide a risk, treat them as Conservative (arbitrary fallback).
	const risk = userRisk?.trim().toLowerCase() || 'conservative';

	// Helper: quickly see if the districtCarriers includes a vendor by substring
	const hasCarrier = (nameFragment: string) =>
		all403b.some((c) => c.name.toLowerCase().includes(nameFragment.toLowerCase()));

	// Helper: returns the first in-district Carrier matching any string in an array
	const findInDistrict = (possibleNames: string[]) =>
		all403b.find((c) =>
			possibleNames.some((nm) => c.name.toLowerCase().includes(nm.toLowerCase()))
		);

	// Helper: picks a random “placeholder” vendor if needed
	function pickRandomVendor(r: string): BaseVendor {
		const randomIndex = Math.floor(Math.random() * RANDOM_PLACEHOLDER.length);
		return makeRecommended(RANDOM_PLACEHOLDER[randomIndex], r, '403(b)');
	}

	//----------------------------------------------------------------------
	// A) Scenario-based logic by risk category
	//----------------------------------------------------------------------
	if (risk === 'conservative' || risk === 'short-term') {
		// Desired top picks: National Life Group, Midland National
		const hasNLG = hasCarrier('national life group') || hasCarrier('nlg');
		const hasMidland = hasCarrier('midland');

		// SCENARIO A: District has NLG + Midland
		if (hasNLG && hasMidland) {
			recommendationResult.top403b = [
				makeRecommended('National Life Group', 'Conservative'),
				makeRecommended('Midland National', 'Conservative')
			];
			recommendationResult.message =
				'For a Conservative profile, we recommend National Life Group and Midland National.';
			return recommendationResult;
		}

		// SCENARIO B: Only Midland is in district
		if (hasMidland && !hasNLG) {
			const picks = [makeRecommended('Midland National', 'Conservative')];

			// Attempt a second “similar conservative” from district
			const alt = findInDistrict(OTHER_CONSERVATIVE_FALLBACKS);
			if (alt) {
				picks.push(makeRecommended(alt.name, 'Conservative'));
			} else {
				// fallback to random placeholder
				picks.push(pickRandomVendor('Conservative'));
			}
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Conservative profile, we recommend Midland National + one other carrier.';
			return recommendationResult;
		}

		// SCENARIO C: Only NLG is in district
		if (hasNLG && !hasMidland) {
			const picks = [makeRecommended('National Life Group', 'Conservative')];

			const alt = findInDistrict(OTHER_CONSERVATIVE_FALLBACKS);
			if (alt) {
				picks.push(makeRecommended(alt.name, 'Conservative'));
			} else {
				picks.push(pickRandomVendor('Conservative'));
			}
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Conservative profile, we recommend National Life Group + one other carrier.';
			return recommendationResult;
		}

		// SCENARIO D: Neither NLG nor Midland
		// => see if district has any other recognized conservative carriers
		const allConservative = all403b.filter((c) =>
			[...OTHER_CONSERVATIVE_FALLBACKS, 'national life group', 'nlg', 'midland'].some((nm) =>
				c.name.toLowerCase().includes(nm.toLowerCase())
			)
		);

		if (allConservative.length > 0) {
			// Use first 2
			recommendationResult.top403b = allConservative
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, 'Conservative'));
			recommendationResult.message =
				'For a Conservative profile, we recommend two other conservative carriers from your district.';
			return recommendationResult;
		}

		// SCENARIO E: No recognized conservative carriers => fallback to IRA
		recommendationResult.fallbackIRA = BASE_VENDORS.filter((bv) =>
			['national life group', 'midland'].some((nm) => bv.vendor.toLowerCase().includes(nm))
		).map((bv) => makeRecommended(bv.vendor, 'Conservative', 'IRA'));

		recommendationResult.message =
			'No conservative 403(b) carriers found in your district; consider an IRA with NLG or Midland.';
		return recommendationResult;
	}

	if (risk === 'balanced') {
		// Desired top picks: Equitable, Security Benefit Group
		const hasEquitable = hasCarrier('equitable');
		const hasSBG = hasCarrier('security benefit group') || hasCarrier('security benefit');

		if (hasEquitable && hasSBG) {
			recommendationResult.top403b = [
				makeRecommended('Equitable', 'Balanced'),
				makeRecommended('Security Benefit Group', 'Balanced')
			];
			recommendationResult.message =
				'For a Balanced profile, we recommend Equitable and Security Benefit Group.';
			return recommendationResult;
		}
		if (hasEquitable && !hasSBG) {
			const picks = [makeRecommended('Equitable', 'Balanced')];
			const alt = findInDistrict(OTHER_BALANCED_FALLBACKS);
			picks.push(alt ? makeRecommended(alt.name, 'Balanced') : pickRandomVendor('Balanced'));
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Balanced profile, we recommend Equitable + one other carrier.';
			return recommendationResult;
		}
		if (!hasEquitable && hasSBG) {
			const picks = [makeRecommended('Security Benefit Group', 'Balanced')];
			const alt = findInDistrict(OTHER_BALANCED_FALLBACKS);
			picks.push(alt ? makeRecommended(alt.name, 'Balanced') : pickRandomVendor('Balanced'));
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Balanced profile, we recommend Security Benefit Group + one other carrier.';
			return recommendationResult;
		}

		// Fallback: see if district has any other “balanced-ish” carriers
		const allBalanced = all403b.filter((c) =>
			['equitable', 'security benefit', ...OTHER_BALANCED_FALLBACKS].some((nm) =>
				c.name.toLowerCase().includes(nm.toLowerCase())
			)
		);

		if (allBalanced.length > 0) {
			recommendationResult.top403b = allBalanced
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, 'Balanced'));
			recommendationResult.message =
				'We selected two Balanced-oriented carriers from your district.';
			return recommendationResult;
		}

		// No district carriers => no 403(b), fallback IRA
		recommendationResult.fallbackIRA = []; // could push IRAs if you want
		recommendationResult.message =
			'No Balanced 403(b) carriers found in your district; please consider an alternative plan.';
		return recommendationResult;
	}

	if (risk === 'growth') {
		// Desired top picks: Lincoln Investment Planning, PlanMember Services
		const hasLincoln = hasCarrier('lincoln investment planning');
		const hasPlanMember = hasCarrier('planmember services');

		if (hasLincoln && hasPlanMember) {
			recommendationResult.top403b = [
				makeRecommended('Lincoln Investment Planning', 'Growth'),
				makeRecommended('PlanMember Services', 'Growth')
			];
			recommendationResult.message =
				'For a Growth profile, we recommend Lincoln Investment Planning and PlanMember Services.';
			return recommendationResult;
		}
		if (hasLincoln && !hasPlanMember) {
			const picks = [makeRecommended('Lincoln Investment Planning', 'Growth')];
			const alt = findInDistrict(OTHER_GROWTH_FALLBACKS);
			picks.push(alt ? makeRecommended(alt.name, 'Growth') : pickRandomVendor('Growth'));
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Growth profile, we recommend Lincoln Investment Planning + one other carrier.';
			return recommendationResult;
		}
		if (!hasLincoln && hasPlanMember) {
			const picks = [makeRecommended('PlanMember Services', 'Growth')];
			const alt = findInDistrict(OTHER_GROWTH_FALLBACKS);
			picks.push(alt ? makeRecommended(alt.name, 'Growth') : pickRandomVendor('Growth'));
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For a Growth profile, we recommend PlanMember Services + one other carrier.';
			return recommendationResult;
		}

		// fallback
		const allGrowth = all403b.filter((c) =>
			['lincoln investment planning', 'planmember', ...OTHER_GROWTH_FALLBACKS].some((nm) =>
				c.name.toLowerCase().includes(nm.toLowerCase())
			)
		);

		if (allGrowth.length > 0) {
			recommendationResult.top403b = allGrowth
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, 'Growth'));
			recommendationResult.message = 'We found two Growth-oriented carriers from your district.';
			return recommendationResult;
		}

		recommendationResult.fallbackIRA = []; // or IRAs if you prefer
		recommendationResult.message =
			'No Growth 403(b) carriers found in your district; please consider an alternative plan.';
		return recommendationResult;
	}

	if (risk === 'aggressive growth') {
		// Desired top picks: Lincoln Investment Planning, Equitable
		const hasLincoln = hasCarrier('lincoln investment planning');
		const hasEquitable = hasCarrier('equitable');

		if (hasLincoln && hasEquitable) {
			recommendationResult.top403b = [
				makeRecommended('Lincoln Investment Planning', 'Aggressive Growth'),
				makeRecommended('Equitable', 'Aggressive Growth')
			];
			recommendationResult.message =
				'For an Aggressive Growth profile, we recommend Lincoln Investment Planning and Equitable.';
			return recommendationResult;
		}
		if (hasLincoln && !hasEquitable) {
			const picks = [makeRecommended('Lincoln Investment Planning', 'Aggressive Growth')];
			const alt = findInDistrict(OTHER_AGGRESSIVE_FALLBACKS);
			picks.push(
				alt ? makeRecommended(alt.name, 'Aggressive Growth') : pickRandomVendor('Aggressive Growth')
			);
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For an Aggressive Growth profile, we recommend Lincoln Investment Planning + another carrier.';
			return recommendationResult;
		}
		if (!hasLincoln && hasEquitable) {
			const picks = [makeRecommended('Equitable', 'Aggressive Growth')];
			const alt = findInDistrict(OTHER_AGGRESSIVE_FALLBACKS);
			picks.push(
				alt ? makeRecommended(alt.name, 'Aggressive Growth') : pickRandomVendor('Aggressive Growth')
			);
			recommendationResult.top403b = picks;
			recommendationResult.message =
				'For an Aggressive Growth profile, we recommend Equitable + another carrier.';
			return recommendationResult;
		}

		// fallback
		const allAgg = all403b.filter((c) =>
			['lincoln investment planning', 'equitable', ...OTHER_AGGRESSIVE_FALLBACKS].some((nm) =>
				c.name.toLowerCase().includes(nm.toLowerCase())
			)
		);

		if (allAgg.length > 0) {
			recommendationResult.top403b = allAgg
				.slice(0, 2)
				.map((c) => makeRecommended(c.name, 'Aggressive Growth'));
			recommendationResult.message =
				'We found two Aggressive Growth-oriented carriers from your district.';
			return recommendationResult;
		}

		recommendationResult.fallbackIRA = [];
		recommendationResult.message =
			'No Aggressive Growth 403(b) carriers found in your district; please consider an alternative plan.';
		return recommendationResult;
	}

	//----------------------------------------------------------------------
	// B) Catch-all for unrecognized risk
	//----------------------------------------------------------------------
	recommendationResult.message = `We do not have a predefined recommendation for the "${userRisk}" risk profile.`;
	return recommendationResult;
}

// -------------------------------------------
// Helper to build recommended vendor objects
// -------------------------------------------
function makeRecommended(
	vendorName: string,
	risk: string,
	businessTypeOverride?: string
): BaseVendor {
	const vendorRisk = risk || 'Conservative';
	const extras = lookupVendorExtras(vendorName, vendorRisk);
	let recommendedGrowthRate = extras?.growthRate;
	let recommendedProductType = extras?.productType;

	// If not found in our dictionary, use defaults
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
// 5) The server route (+server.ts) with Prisma + Fuse
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
		// Attempt fuzzy search of the District table
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
			distance: 100,
			minMatchCharLength: 3
		});

		const searchResults = fuse.search(districtName);

		if (searchResults.length > 0) {
			const matchedDistrict = searchResults[0].item;
			matchedDistrictName = matchedDistrict.name;
			districtCarriers = matchedDistrict ? matchedDistrict.carriers : [];
		}
	}

	if (!matchedDistrictName) matchedDistrictName = 'None';

	const recommendationResult = getRecommendations(districtCarriers, userRisk);

	// For convenience, pick the first recommended 403(b) or fallback IRA
	const firstRecommended = recommendationResult.top403b[0] ?? recommendationResult.fallbackIRA[0];
	const recommendedGrowthRate = firstRecommended?.recommendedGrowthRate ?? 'N/A';
	const recommendedProductType = firstRecommended?.recommendedProductType ?? 'N/A';

	let vendorRecs = 'No recommended carriers found.';
	const recs = recommendationResult.top403b;

	// If you have at least one recommended carrier:
	if (recs.length > 0) {
		if (recs.length === 1) {
			// Only one carrier recommended
			vendorRecs = recs[0].vendor;
		} else {
			// Two or more carriers recommended; just show the first two
			vendorRecs = `${recs[0].vendor} and ${recs[1].vendor}`;
		}
	}

	return json({
		district: matchedDistrictName,
		userRisk,
		recommendedGrowthRate,
		recommendedProductType,
		vendorRecs,
		// Example: set selfEnroll = false for certain risk categories
		selfEnroll:
			userRisk?.toLowerCase() === 'aggressive growth' || userRisk?.toLowerCase() === 'balanced'
				? false
				: true,
		...recommendationResult
	});
}
