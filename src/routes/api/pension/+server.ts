import { calculatePension } from '$lib/pension-calculator';
import { json } from '@sveltejs/kit';

/**
 * Simple premium recommendation:
 * - 10% of annual salary, split into monthly contributions.
 */
function calculateSimpleMonthlySavings(annualSalary: number) {
	return (annualSalary * 0.1) / 12;
}

/**
 * Calculates how much total savings is required to cover a given annual
 * income gap using a specified withdrawal (or payout) rate.
 *
 * Example:
 *   - incomeGap = $34,200
 *   - withdrawalRate = 0.04 (4%)
 *   => total needed = $855,000
 */
function calculateTotalNeeded(incomeGap: number, withdrawalRate = 0.04) {
	return incomeGap / withdrawalRate;
}

/**
 * Gap-based premium recommendation:
 * - The amount needed per month to fill the income gap
 *   before retirement (incomeGap / yearsUntilRetirement / 12).
 */
function calculateGapBasedMonthlySavings(incomeGap: number, yearsUntilRetirement: number) {
	return incomeGap / (yearsUntilRetirement * 12);
}

export async function POST({ request }) {
	try {
		const { state, yearsOfService, averageSalary, yearsUntilRetirement } = await request.json();

		const estimatedPension = calculatePension(state, yearsOfService, averageSalary);

		const incomeGap = averageSalary - estimatedPension;

		const simpleMonthly = calculateSimpleMonthlySavings(averageSalary);

		const gapBasedMonthly = calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement);

		const totalNeeded = calculateTotalNeeded(incomeGap);

		return json({
			success: true,
			state,
			yearsOfService,
			averageSalary,
			yearsUntilRetirement,
			estimatedPension,
			incomeGap,
			totalNeeded,
			simpleMonthlySavings: simpleMonthly,
			gapBasedMonthlySavings: gapBasedMonthly
		});
	} catch {
		return json(
			{
				success: false,
				error: 'Invalid request or server error'
			},
			{ status: 400 }
		);
	}
}
