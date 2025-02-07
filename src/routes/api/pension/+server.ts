import { calculatePension } from '$lib/pension-calculator';
import { json } from '@sveltejs/kit';

/**
 * Calculates the final projected salary after applying
 * an annual raise for each remaining year.
 */
function projectFinalSalary(
	currentSalary: number,
	annualRaiseRate: number,
	yearsUntilRetirement: number
) {
	return currentSalary * Math.pow(1 + annualRaiseRate, yearsUntilRetirement);
}

/**
 * Iteratively calculate the future value of growing monthly contributions.
 *
 * - Start with `currentSalary`, which grows 3.1% each year.
 * - Contribute 10% of that *year’s* salary, divided monthly.
 * - Grow each monthly contribution at (annualGrowthRate/12).
 */
function futureValueOfGrowingMonthlyContributions(
	currentSalary: number,
	annualRaiseRate: number,
	annualReturnRate: number,
	yearsUntilRetirement: number
) {
	let balance = 0;
	const monthlyReturnRate = annualReturnRate / 12;

	// Each year, salary goes up, and we deposit monthly
	let salary = currentSalary;
	for (let year = 1; year <= yearsUntilRetirement; year++) {
		const monthlyContribution = (salary * 0.1) / 12; // 10% of that year's salary

		for (let m = 0; m < 12; m++) {
			// deposit
			balance += monthlyContribution;
			// grow
			balance *= 1 + monthlyReturnRate;
		}

		// Raise salary at year-end
		salary *= 1 + annualRaiseRate;
	}

	return balance;
}

/**
 * Simple premium recommendation (as a quick reference only):
 * - 10% of *current* annual salary, split into monthly contributions.
 */
function calculateSimpleMonthlySavings(annualSalary: number) {
	return (annualSalary * 0.1) / 12;
}

/**
 * Gap-based monthly savings (as another quick reference):
 * - The amount needed per month to fill the gap directly,
 *   spread over the remaining working years.
 */
function calculateGapBasedMonthlySavings(incomeGap: number, yearsUntilRetirement: number) {
	return incomeGap / (yearsUntilRetirement * 12);
}

/**
 * Total savings needed to cover a given annual gap via a fixed withdrawal rate.
 */
function calculateTotalNeeded(incomeGap: number, withdrawalRate = 0.04) {
	return incomeGap / withdrawalRate;
}

export async function POST({ request }) {
	console.log('POST /api/pension', request.body);
	try {
		const { state, yearsOfService, averageSalary, yearsUntilRetirement } = await request.json();

		// 1. Project the final salary at retirement using a 3.1% raise
		const annualSalaryGrowthRate = 0.031;
		const finalAverageSalary = projectFinalSalary(
			averageSalary,
			annualSalaryGrowthRate,
			yearsUntilRetirement
		);

		// 2. Add the future years of service to current yearsOfService
		const totalYearsOfService = yearsOfService + yearsUntilRetirement;

		// 3. Estimate pension based on final salary + total service
		const estimatedPension = calculatePension(state, totalYearsOfService, finalAverageSalary);

		// 4. Income gap at retirement
		const incomeGap = finalAverageSalary - estimatedPension;

		// 5. Simple monthly savings (10% of current salary, not grown)
		const simpleMonthly = calculateSimpleMonthlySavings(averageSalary);

		// 6. Gap-based monthly savings
		const gapBasedMonthly = calculateGapBasedMonthlySavings(incomeGap, yearsUntilRetirement);

		// 7. Target total savings required to fill gap at 4% withdrawal
		const targetSavings = calculateTotalNeeded(incomeGap, 0.04);

		// 8. Calculate future value of *growing* contributions:
		//    - Start from current averageSalary, grow 3.1% each year
		//    - Invest at 5% annual growth (monthly compounding)
		const expectedAnnualGrowthRate = 0.05; // 5%
		const futureValue = futureValueOfGrowingMonthlyContributions(
			averageSalary,
			annualSalaryGrowthRate,
			expectedAnnualGrowthRate,
			yearsUntilRetirement
		);

		// 9. Annual income from those savings at 4% withdrawal
		const annualIncomeFromSavings = futureValue * 0.04;

		// 10. Total retirement income (pension + withdrawal from savings)
		const totalRetirementIncome = estimatedPension + annualIncomeFromSavings;

		return json({
			success: true,
			state,
			yearsOfService,
			averageSalary,
			yearsUntilRetirement,

			// Data points for the user
			finalAverageSalary: Number(finalAverageSalary.toFixed(2)),
			totalYearsOfService,
			estimatedPension: Number(estimatedPension.toFixed(2)),
			incomeGap: Number(incomeGap.toFixed(2)),
			targetSavings: Number(targetSavings.toFixed(2)),

			simpleMonthlySavings: Number(simpleMonthly.toFixed(2)),
			gapBasedMonthlySavings: Number(gapBasedMonthly.toFixed(2)),

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
