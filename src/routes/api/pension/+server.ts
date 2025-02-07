import { calculatePension } from '$lib/pension-calculator';
import { json } from '@sveltejs/kit';

/**
 * Estimate final salary at retirement given:
 * - current annual salary
 * - years until retirement
 * - an annual raise rate (default 3.1%)
 */
function estimateRetirementSalary(
	currentSalary: number,
	yearsUntilRetirement: number,
	annualRaise = 0.031
) {
	return currentSalary * Math.pow(1 + annualRaise, yearsUntilRetirement);
}

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
 */
function calculateTotalNeeded(incomeGap: number, withdrawalRate = 0.04) {
	return incomeGap / withdrawalRate;
}

/**
 * Future value of monthly contributions (assuming a fixed annual growth rate).
 *
 * FV = P * [((1 + i)^n - 1) / i]
 *   where:
 *     P = monthly contribution
 *     i = monthly growth rate (annualRate / 12)
 *     n = total number of months
 */
function futureValueOfMonthlyContributions(
	monthlyContribution: number,
	annualGrowthRate: number,
	years: number
) {
	const i = annualGrowthRate / 12; // monthly growth rate
	const n = years * 12; // total number of months

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
		const { state, yearsOfService, averageSalary, yearsUntilRetirement } = await request.json();

		// 1) Project the user’s final salary at retirement,
		//    assuming 3.1% annual raises.
		const finalSalary = estimateRetirementSalary(averageSalary, yearsUntilRetirement, 0.031);

		// 2) Compute the total years of service at retirement (if desired):
		const totalYearsOfService = yearsOfService + yearsUntilRetirement;

		// 3) Calculate pension using the final salary and updated years of service
		const estimatedPension = calculatePension(state, totalYearsOfService, finalSalary);

		// 4) Income gap = final salary − estimated pension
		const incomeGap = finalSalary - estimatedPension;

		// 5) Simple monthly savings: still 10% of *current* salary
		const simpleMonthly = calculateSimpleMonthlySavings(averageSalary);

		// 6) Gap-based monthly: how much each month to make up that gap
		const gapBasedMonthly = calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement);

		// 7) Target nest egg for that gap (using 4% withdrawal rate)
		const targetSavings = calculateTotalNeeded(incomeGap);

		// 8) Future value of today’s 10% monthly contributions,
		//    assuming 5% annual growth
		const expectedAnnualGrowthRate = 0.05; // 5%
		const futureValue = futureValueOfMonthlyContributions(
			simpleMonthly,
			expectedAnnualGrowthRate,
			yearsUntilRetirement
		);

		// 9) Annual income from those savings using a 4% withdrawal
		const annualIncomeFromSavings = futureValue * 0.04;

		// 10) Total retirement income = pension + withdrawals
		const totalRetirementIncome = estimatedPension + annualIncomeFromSavings;

		return json({
			success: true,
			state,
			yearsOfService,
			averageSalary,
			yearsUntilRetirement,

			// Show the final, projected salary so the user can see how raises affected it
			finalSalary: Number(finalSalary.toFixed(2)),
			totalYearsOfService,

			estimatedPension: Number(estimatedPension.toFixed(2)),
			incomeGap: Number(incomeGap.toFixed(2)),
			targetSavings: Number(targetSavings.toFixed(2)),

			simpleMonthlySavings: Number(simpleMonthly.toFixed(0)),
			gapBasedMonthlySavings: Number(gapBasedMonthly.toFixed(0)),

			futureValue: Number(futureValue.toFixed(2)),
			annualIncomeFromSavings: Number(annualIncomeFromSavings.toFixed(2)),
			totalRetirementIncome: Number(totalRetirementIncome.toFixed(2))
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
