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
 * Future value of monthly contributions (assuming a fixed annual growth rate).
 *
 * FV = P * [((1 + i)^n - 1) / i]
 * where:
 *   P = monthly contribution
 *   i = monthly growth rate (annualRate / 12)
 *   n = total number of months
 */
function futureValueOfMonthlyContributions(
	monthlyContribution: number,
	annualGrowthRate: number,
	years: number
) {
	const i = annualGrowthRate / 12; // monthly rate
	const n = years * 12; // total months

	if (i === 0) {
		// Edge case for zero growth
		return monthlyContribution * n;
	}

	return monthlyContribution * ((Math.pow(1 + i, n) - 1) / i);
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
	console.log('POST /api/pension', request.body);
	try {
		const { state, yearsOfService, averageSalary, retirementWish, yearsUntilRetirement } =
			await request.json();

		const estimatedPension = calculatePension(state, yearsOfService, averageSalary);

		const incomeGap = retirementWish - estimatedPension;

		const simpleMonthly = calculateSimpleMonthlySavings(averageSalary);

		const gapBasedMonthly = calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement);

		const targetSavings = calculateTotalNeeded(incomeGap);

		const expectedAnnualGrowthRate = 0.05; // 5%
		const futureValue = futureValueOfMonthlyContributions(
			simpleMonthly,
			expectedAnnualGrowthRate,
			yearsUntilRetirement
		);

		// Annual income from those savings under a 4% withdrawal rule
		const annualIncomeFromSavings = futureValue * 0.04;

		// 8. Total retirement income (pension + withdrawal from savings)
		const totalRetirementIncome = estimatedPension + annualIncomeFromSavings;

		if (!state) {
			throw new Error('State is empty again');
		}

		return json({
			success: true,
			state,
			yearsOfService,
			averageSalary,
			yearsUntilRetirement,
			estimatedPension: Number(estimatedPension.toFixed(2)),
			incomeGap: Number(incomeGap.toFixed(2)),
			targetSavings,
			simpleMonthlySavings: Number(simpleMonthly.toFixed(0)),
			gapBasedMonthlySavings: Number(gapBasedMonthly.toFixed(0)),

			futureValue: Number(futureValue.toFixed(2)), // e.g. ~$760,000
			annualIncomeFromSavings: Number(annualIncomeFromSavings.toFixed(2)), // e.g. ~$30,400
			totalRetirementIncome: Number(totalRetirementIncome.toFixed(0))
		});
	} catch (e) {
		console.error('Invalid request or server error', e);
		const errorMessage = e instanceof Error ? e.message : 'Unknown server error';
		return json(
			{
				success: false,
				error: errorMessage
			},
			{ status: 400 }
		);
	}
}
