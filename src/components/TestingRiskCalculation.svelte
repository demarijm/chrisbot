<script lang="ts">
	// Basic user info
	let firstName = '';
	let lastName = '';
	let occupation = 'Developer';

	// The nine questions, each will store a numeric value from 1 to 5.
	let q1: number | null = null;
	let q2: number | null = null;
	let q3: number | null = null;
	let q4: number | null = null;
	let q5: number | null = null;
	let q6: number | null = null;
	let q7: number | null = null;
	let q8: number | null = null;
	let q9: number | null = null;

	// Holds the response from our /api/risk-score endpoint
	let riskResult: {
		success: boolean;
		totalScore: number;
		riskLevel: string;
	} | null = null;

	// Example occupations for a dropdown
	const occupations = ['Developer', 'Designer', 'Manager'];

	async function handleSubmit(event: Event) {
		event.preventDefault();

		try {
			const response = await fetch('/api/risk-score', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					answers: {
						q1,
						q2,
						q3,
						q4,
						q5,
						q6,
						q7,
						q8,
						q9
					}
				})
			});

			const data = await response.json();
			riskResult = data; // e.g., { success: true, totalScore: XX, riskLevel: '...' }
		} catch (error) {
			console.error('Failed to submit form:', error);
		}
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="mx-auto w-full max-w-2xl space-y-6 rounded-md bg-white p-6 shadow-md"
>
	<!-- Basic Info Section -->
	<h2 class="text-xl font-semibold text-gray-800">Basic Information</h2>

	<!-- Occupation -->

	<hr class="my-4" />

	<!-- Investment Style Assessment Section -->
	<h2 class="text-xl font-semibold text-gray-800">Investment Style Assessment</h2>

	<!-- 1. Investment Knowledge -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>1. How would you describe your investment knowledge?</label
		>
		<div class="space-y-2">
			<!-- Each radio button corresponds to a numeric value (1–5) -->
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q1} value={1} required />
				<span>Very limited (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q1} value={2} />
				<span>Basic understanding (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q1} value={3} />
				<span>Moderate understanding (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q1} value={4} />
				<span>Advanced knowledge (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q1} value={5} />
				<span>Expert knowledge (5)</span>
			</label>
		</div>
	</div>

	<!-- 2. Investment Experience -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>2. How long have you been investing in the stock market or other investment vehicles?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q2} value={1} required />
				<span>Less than 1 year (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q2} value={2} />
				<span>1-3 years (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q2} value={3} />
				<span>4-6 years (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q2} value={4} />
				<span>7-10 years (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q2} value={5} />
				<span>Over 10 years (5)</span>
			</label>
		</div>
	</div>

	<!-- 3. Financial Goals -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>3. What are your primary financial goals?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q3} value={1} required />
				<span>Preserve my capital (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q3} value={2} />
				<span>Generate steady income (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q3} value={3} />
				<span>Grow my investments moderately (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q3} value={4} />
				<span>Achieve significant growth over time (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q3} value={5} />
				<span>Maximize long-term growth (5)</span>
			</label>
		</div>
	</div>

	<!-- 4. Risk Tolerance -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>4. How do you feel about taking financial risks?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q4} value={1} required />
				<span>Very risk-averse (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q4} value={2} />
				<span>Somewhat uncomfortable (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q4} value={3} />
				<span>Moderate risks (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q4} value={4} />
				<span>Comfortable with higher risks (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q4} value={5} />
				<span>Very comfortable with high risk (5)</span>
			</label>
		</div>
	</div>

	<!-- 5. Investment Horizon -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>5. What is your investment time horizon?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q5} value={1} required />
				<span>Less than 3 years (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q5} value={2} />
				<span>3-5 years (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q5} value={3} />
				<span>6-10 years (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q5} value={4} />
				<span>11-15 years (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q5} value={5} />
				<span>More than 15 years (5)</span>
			</label>
		</div>
	</div>

	<!-- 6. Reaction to Market Volatility -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>6. How would you react if your investment lost 20% of its value in a short period?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q6} value={1} required />
				<span>Sell all investments immediately (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q6} value={2} />
				<span>Consider selling some investments (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q6} value={3} />
				<span>Hold and wait for recovery (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q6} value={4} />
				<span>Buy more (view it as an opportunity) (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q6} value={5} />
				<span>Feel unconcerned; stick to strategy (5)</span>
			</label>
		</div>
	</div>

	<!-- 7. Income Stability -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>7. How stable is your current income?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q7} value={1} required />
				<span>Very unstable (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q7} value={2} />
				<span>Somewhat unstable (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q7} value={3} />
				<span>Stable (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q7} value={4} />
				<span>Very stable (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q7} value={5} />
				<span>Extremely stable (5)</span>
			</label>
		</div>
	</div>

	<!-- 8. Emergency Fund -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>8. Do you have an emergency fund (at least 6 months of expenses)?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q8} value={1} required />
				<span>No, I do not have an emergency fund (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q8} value={2} />
				<span>Less than 3 months saved (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q8} value={3} />
				<span>3-6 months saved (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q8} value={4} />
				<span>More than 6 months saved (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q8} value={5} />
				<span>Over a year saved (5)</span>
			</label>
		</div>
	</div>

	<!-- 9. Investment Purpose -->
	<div>
		<label class="mb-2 block font-semibold text-gray-700"
			>9. What is the main purpose of your investments?</label
		>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q9} value={1} required />
				<span>Protect principal (1)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q9} value={2} />
				<span>Generate income (2)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q9} value={3} />
				<span>Growth with moderate risk (3)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q9} value={4} />
				<span>Significant growth with acceptable risk (4)</span>
			</label>
			<label class="flex items-center space-x-2">
				<input type="radio" bind:group={q9} value={5} />
				<span>Maximum growth, regardless of risk (5)</span>
			</label>
		</div>
	</div>

	<!-- Submit Button -->
	<button
		type="submit"
		class="mt-6 w-full rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700
      focus:outline-none focus:ring-2 focus:ring-blue-200"
	>
		Submit
	</button>

	<!-- Display Response -->
	{#if riskResult}
		<div class="mt-4 rounded-md bg-gray-50 p-4 text-center">
			<p class="mb-2 font-bold text-gray-700">Risk Assessment</p>
			<p class="mb-1">Total Score: {riskResult.totalScore}</p>
			<p class="mb-1">Risk Level: {riskResult.riskLevel}</p>
		</div>
	{/if}
</form>
