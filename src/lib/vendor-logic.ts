// getRecommendations.ts (or ./base-vendors.ts, wherever your logic lives)
import { baseVendors } from './base-vendors';
import type { Carrier } from '@prisma/client';
import type { BaseVendor, RecommendationResult } from './types';

/**
 * Returns a structured RecommendationResult:
 * - top403b: up to 2 from the intersection
 * - all403b: all carriers from the district
 * - fallbackIRA: two IRA fallback vendors
 * - message: disclaimers or guidance
 */
export function getRecommendations(
	districtCarriers: Carrier[] | null,
	userRisk: string | null
): RecommendationResult {
	/**
	 * Helper to filter by user risk
	 */
	function filterByRisk(vendors: BaseVendor[], risk: string | null): BaseVendor[] {
		if (!risk) return vendors;
		return vendors.filter((v) =>
			v.riskScoreCategory.some((cat) => cat.toLowerCase() === risk.toLowerCase())
		);
	}

	/**
	 * Helper to produce 2 fallback IRA vendors
	 */
	function getFallbackIRA(risk: string | null): BaseVendor[] {
		// Hard-code your IRA fallback vendor names, e.g.:
		const fallbackNames = ['National Life Group', 'Midland'];
		// Filter from baseVendors by name:
		const fallback = baseVendors.filter((v) =>
			fallbackNames.map((f) => f.toLowerCase()).includes(v.vendor.toLowerCase())
		);
		// If you also wanted them filtered by risk:
		// return filterByRisk(fallback, risk);
		return fallback;
	}

	// Prepare the final result object
	const result: RecommendationResult = {
		top403b: [],
		all403b: [],
		fallbackIRA: [],
		message: ''
	};

	// (0) If no district is provided:
	if (!districtCarriers) {
		result.top403b = filterByRisk(baseVendors, userRisk).slice(0, 2);
		result.fallbackIRA = getFallbackIRA(userRisk);
		result.message =
			'No district selected. Showing two recommended 403(b)/IRA vendors plus fallback IRA options.';
		return result;
	}

	// If we do have a district, store its carriers
	result.all403b = districtCarriers;

	// (1) Intersect the district’s carriers with our base list
	const loweredCarriers = districtCarriers.map((dc) => dc.name.toLowerCase().trim());
	let matched = baseVendors.filter((bv) =>
		loweredCarriers.includes(bv.vendor.toLowerCase().trim())
	);

	// (2) Filter by user risk
	matched = filterByRisk(matched, userRisk);

	// (3) Decide how many matches there are
	if (matched.length === 0) {
		// If we offer none
		result.top403b = []; // no matches
		result.fallbackIRA = getFallbackIRA(userRisk);
		result.message =
			'No recommended 403(b) carriers in your district match your risk profile. ' +
			'Below is the full list of approved carriers in your district. ' +
			'For a Traditional or Roth IRA option, here are two fallback choices.';
	} else if (matched.length === 1) {
		// If only 1 match
		result.top403b = matched.slice(0, 1);
		result.fallbackIRA = getFallbackIRA(userRisk);
		result.message =
			'Only one district-approved carrier matched your risk profile. ' +
			'We also have two fallback IRA options for you.';
	} else {
		// If 2 or more matches, show only the top 2
		result.top403b = matched.slice(0, 2);
		result.fallbackIRA = getFallbackIRA(userRisk);
		result.message =
			'We found multiple carriers that match your risk profile; ' +
			'here are your top two. You may also consider these IRA options.';
	}

	return result;
}
