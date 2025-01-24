import { calculatePension } from '$lib/pension-calculator';
import { json } from '@sveltejs/kit';

/**
 * Simple premium recommendation:
 * - 10% of annual salary, split into monthly contributions.
 */
function calculateSimpleMonthlySavings(annualSalary) {
	return (annualSalary * 0.1) / 12;
}

/**
 * Gap-based premium recommendation:
 * - The amount needed per month to fill the income gap
 *   before retirement (incomeGap / yearsUntilRetirement / 12).
 */
function calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement) {
	return incomeGap / (yearsUntilRetirement * 12);
}

export async function POST({ request }) {
	try {
		const { state, yearsOfService, averageSalary, yearsUntilRetirement } = await request.json();

		const estimatedPension = calculatePension(state, yearsOfService, averageSalary);

		const incomeGap = averageSalary - estimatedPension;

		const simpleMonthly = calculateSimpleMonthlySavings(averageSalary);

		const gapBasedMonthly = calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement);

		return json({
			success: true,
			state,
			yearsOfService,
			averageSalary,
			yearsUntilRetirement,
			estimatedPension,
			incomeGap,
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
