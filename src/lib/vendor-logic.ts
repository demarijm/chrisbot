import { baseVendors } from './base-vendors';
import type { Carrier } from '@prisma/client'; // or your own type

export function getRecommendations(districtCarriers: Carrier[] | null, userRisk: string | null) {
	// -----------------------
	// 0) If NO DISTRICT:
	// -----------------------
	if (!districtCarriers) {
		// The user has no district, so we ONLY recommend from the base list
		// filtered by user risk (if provided).
		let filtered = [...baseVendors];
		if (userRisk) {
			filtered = filtered.filter((v) =>
				v.riskScoreCategory.some((cat) => cat.toLowerCase() === userRisk.toLowerCase())
			);
		}

		// Example: Return top 2 or all. Adjust as needed.
		return filtered.slice(0, 2);
	}

	// -----------------------
	// 1) DISTRICT EXISTS:
	// -----------------------
	// Step A: Intersect the district's carriers with the base list
	let matched = baseVendors.filter((baseVendor) =>
		districtCarriers.some(
			(dc) => dc.name.toLowerCase().trim() === baseVendor.vendor.toLowerCase().trim()
		)
	);

	// Step B: Filter by user risk if present
	if (userRisk) {
		matched = matched.filter((v) =>
			v.riskScoreCategory.some((cat) => cat.toLowerCase() === userRisk.toLowerCase())
		);
	}

	// Step C: If we have matches, return them. Otherwise, fallback to the district's own recommended carriers.
	if (matched.length > 0) {
		// Maybe we only want top 2?
		return matched.slice(0, 2);
	} else {
		// Fallback: show the district’s recommended carriers from the DB
		const recommendedFromDistrict = districtCarriers.filter((c) => c.recommended);
		if (recommendedFromDistrict.length === 0) {
			// If even the district has none recommended, you can:
			// 1) return an empty array, or
			// 2) return a fallback vendor:
			return [
				{
					vendor: 'Fallback IRA Provider XYZ',
					riskScoreCategory: [],
					businessType: 'IRA',
					notes: 'No intersection and no recommended carriers in district.'
				}
			];
		}

		// Convert them to the same shape as baseVendors
		return recommendedFromDistrict.map((rc) => ({
			vendor: rc.name,
			riskScoreCategory: [],
			businessType: '',
			notes: 'From District recommended carriers (fallback).'
		}));
	}
}
