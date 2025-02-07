// File: src/lib/utils/pensionCalc.js

/**
 * Returns the annual pension estimate for a teacher based on
 * state, years of service, and average salary.
 *
 * @param {string} state - Two-letter state code (e.g. "AL", "AZ", etc.).
 * @param {number} yearsOfService
 * @param {number} averageSalary
 * @returns {number} Estimated annual pension.
 */
export function calculatePension(state: string, yearsOfService: number, averageSalary: number) {
	switch (state.toUpperCase()) {
		case 'AL': // Alabama
			// Example: yearsOfService x 1.65%
			return yearsOfService * 0.0165 * averageSalary;

		case 'AK': // Alaska (simple graded scale example)
			if (yearsOfService <= 20) {
				// 0-20 years of service: 2% per year
				return yearsOfService * 0.02 * averageSalary;
			} else {
				// First 20 years @ 2%
				const first20 = 20 * 0.02 * averageSalary;
				// Remaining years beyond 20 @ 2.5%
				const over20 = (yearsOfService - 20) * 0.025 * averageSalary;
				return first20 + over20;
			}
		case 'AZ':
			// Arizona (0-19 = 2.1%, 20-24 = 2.15%, 25-29 = 2.2%, 30+ = 2.3%)
			// Example approach:
			if (yearsOfService < 20) {
				return yearsOfService * 0.021 * averageSalary;
			} else if (yearsOfService < 25) {
				// 20–24.99 => 2.15%
				return yearsOfService * 0.0215 * averageSalary;
			} else if (yearsOfService < 30) {
				// 25–29.99 => 2.20%
				return yearsOfService * 0.022 * averageSalary;
			} else {
				// 30+ => 2.3%
				return yearsOfService * 0.023 * averageSalary;
			}

		case 'AR':
			// Arkansas: YOS x 2.15% x avg highest 3 years
			return yearsOfService * 0.0215 * averageSalary;

		case 'CA':
			// California: YOS x 2.0% = % of average salary (12-month highest)
			return yearsOfService * 0.02 * averageSalary;

		case 'CO':
			// Colorado: YOS x 2.5%
			return yearsOfService * 0.025 * averageSalary;

		case 'CT':
			// Connecticut: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'DE':
			// Delaware: YOS x 1.85%
			return yearsOfService * 0.0185 * averageSalary;

		case 'FL':
			// Florida (basic formula from the table: 1.60%)
			// *In reality, Florida has different multipliers if retiring at 62, 63, 64, etc.
			//  This is a simplified version.
			return yearsOfService * 0.016 * averageSalary;

		case 'GA':
			// Georgia: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'HI':
			// Hawaii: YOS x 1.75%
			return yearsOfService * 0.0175 * averageSalary;

		case 'ID':
			// Idaho: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'IL':
			// Illinois: YOS x 2.2%
			return yearsOfService * 0.022 * averageSalary;

		case 'IN':
			// Indiana: YOS x 1.1%
			return yearsOfService * 0.011 * averageSalary;

		case 'IA':
			// Iowa: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'KS':
			// Kansas (the table had multiple references, but we’ll use a default 1.85% for demonstration)
			return yearsOfService * 0.0185 * averageSalary;

		case 'KY':
			// Kentucky (graded scale example)
			// 0–10 yrs = 1.7%, 11–20 yrs = 2%, 21–26 yrs = 2.3%, 27–30 yrs = 2.5%, 31+ yrs = 3%
			if (yearsOfService <= 10) {
				// All years fall in the first bracket
				return yearsOfService * 0.017 * averageSalary;
			} else if (yearsOfService <= 20) {
				// First 10 years at 1.7%; remaining (yearsOfService - 10) at 2%
				return (10 * 0.017 + (yearsOfService - 10) * 0.02) * averageSalary;
			} else if (yearsOfService <= 26) {
				// First 10 years at 1.7%; next 10 years at 2%; remaining (yearsOfService - 20) at 2.3%
				return (10 * 0.017 + 10 * 0.02 + (yearsOfService - 20) * 0.023) * averageSalary;
			} else if (yearsOfService <= 30) {
				// First 10 years at 1.7%; next 10 at 2%; next 6 at 2.3%;
				// remaining (yearsOfService - 26) at 2.5%
				return (10 * 0.017 + 10 * 0.02 + 6 * 0.023 + (yearsOfService - 26) * 0.025) * averageSalary;
			} else {
				// 31+ years => everything above 30 is at 3%
				return (
					(10 * 0.017 + 10 * 0.02 + 6 * 0.023 + 4 * 0.025 + (yearsOfService - 30) * 0.03) *
					averageSalary
				);
			}

		case 'LA':
			// Louisiana: YOS x 2.5%
			return yearsOfService * 0.025 * averageSalary;

		case 'ME':
			// Maine: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'MD':
			// Maryland: YOS x 1.5%
			return yearsOfService * 0.015 * averageSalary;

		case 'MA':
			// Massachusetts: YOS x 2.5%
			return yearsOfService * 0.025 * averageSalary;

		case 'MI':
			// Michigan: YOS x 1.5%
			return yearsOfService * 0.015 * averageSalary;

		case 'MN':
			// Minnesota: YOS x 1.9%
			return yearsOfService * 0.019 * averageSalary;

		case 'MS':
			// Mississippi: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'MO':
			// Missouri: YOS x 2.5%
			return yearsOfService * 0.025 * averageSalary;

		case 'MT':
			// Montana: YOS x 1.67%
			return yearsOfService * 0.0167 * averageSalary;

		case 'NE':
			// Nebraska: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'NV':
			// Nevada: YOS x 2.25%
			// The user’s table says 2.25%, but the notes also mention 2.5%, 2.67% for older hires.
			// We'll keep it simple at 2.25% from the table.
			return yearsOfService * 0.0225 * averageSalary;

		case 'NH':
			// New Hampshire: YOS x 1.52%
			return yearsOfService * 0.0152 * averageSalary;

		case 'NJ':
			// New Jersey: YOS x 1.67%
			return yearsOfService * 0.0167 * averageSalary;

		case 'NM':
			// New Mexico: YOS x 2.35%
			return yearsOfService * 0.0235 * averageSalary;

		case 'NY':
			// New York simplified:
			//  <20 yrs = 1.67%, at 20 yrs = 1.75%, each year after 20 = 2%
			if (yearsOfService < 20) {
				return yearsOfService * 0.0167 * averageSalary;
			} else if (yearsOfService === 20) {
				return yearsOfService * 0.0175 * averageSalary;
			} else {
				// years > 20
				// First 20 years: 20 x 1.75%, remainder: 2%
				const first20 = 20 * 0.0175 * averageSalary;
				const over20 = (yearsOfService - 20) * 0.02 * averageSalary;
				return first20 + over20;
			}

		case 'NC':
			// North Carolina: YOS x 1.82%
			return yearsOfService * 0.0182 * averageSalary;

		case 'ND':
			// North Dakota: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'OH':
			// Ohio: YOS x 2.2%
			return yearsOfService * 0.022 * averageSalary;

		case 'OK':
			// Oklahoma: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'OR':
			// Oregon: YOS x 1.5%
			return yearsOfService * 0.015 * averageSalary;

		case 'PA':
			// Pennsylvania can have multiple classes (1.25%, 2%, 2.5%).
			// We'll default to 2% here, or accept a param for which "class" the teacher is in.
			return yearsOfService * 0.02 * averageSalary;

		case 'RI':
			// Rhode Island: YOS x 1.0%
			return yearsOfService * 0.01 * averageSalary;

		case 'SC':
			// South Carolina: YOS x 1.82%
			return yearsOfService * 0.0182 * averageSalary;

		case 'SD':
			// South Dakota: YOS x 1.55%
			return yearsOfService * 0.0155 * averageSalary;

		case 'TN':
			// Tennessee: YOS x 1%
			return yearsOfService * 0.01 * averageSalary;

		case 'TX':
			// Texas: YOS x 2.3%
			return yearsOfService * 0.023 * averageSalary;

		case 'UT':
			// Utah: YOS x 1.5%
			return yearsOfService * 0.015 * averageSalary;

		case 'VT':
			// Vermont: YOS x 1.67%
			return yearsOfService * 0.0167 * averageSalary;

		case 'VA':
			// Virginia: YOS x 1%
			return yearsOfService * 0.01 * averageSalary;

		case 'WA':
			// Washington: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'WV':
			// West Virginia: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		case 'WI':
			// Wisconsin: YOS x 1.6%
			return yearsOfService * 0.016 * averageSalary;

		case 'WY':
			// Wyoming: YOS x 2%
			return yearsOfService * 0.02 * averageSalary;

		default:
			// If no match, return 0 or throw an error
			console.warn('State code not recognized or not implemented.');
			return 0;
	}
}
