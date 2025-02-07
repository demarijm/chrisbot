<script lang="ts">
	let selectedState = 'AL';
	let yearsOfService = 0;
	let averageSalary = 0;
	let yearsUntilRetirement = 0;
	let incomeGap: number | null = null;
	let estimatedPension: number | null = null;
	let errorMessage: string | null = null;

	async function handlePensionSubmit(event: Event) {
		event.preventDefault();
		estimatedPension = null;
		incomeGap = null;
		errorMessage = null;

		try {
			const response = await fetch('/api/pension', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					state: selectedState,
					yearsOfService,
					averageSalary,
					yearsUntilRetirement
				})
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Unknown error');
			}

			estimatedPension = data.estimatedPension;
			incomeGap = data.incomeGap;
		} catch (err: any) {
			errorMessage = err.message || 'Failed to calculate pension.';
		}
	}

	const states = [
		'AL',
		'AK',
		'AZ',
		'AR',
		'CA',
		'CO',
		'CT',
		'DE',
		'FL',
		'GA',
		'HI',
		'ID',
		'IL',
		'IN',
		'IA',
		'KS',
		'KY',
		'LA',
		'ME',
		'MD',
		'MA',
		'MI',
		'MN',
		'MS',
		'MO',
		'MT',
		'NE',
		'NV',
		'NH',
		'NJ',
		'NM',
		'NY',
		'NC',
		'ND',
		'OH',
		'OK',
		'OR',
		'PA',
		'RI',
		'SC',
		'SD',
		'TN',
		'TX',
		'UT',
		'VT',
		'VA',
		'WA',
		'WV',
		'WI',
		'WY'
	];
</script>

<form
	on:submit|preventDefault={handlePensionSubmit}
	class="max-w-md rounded-md bg-white p-4 shadow-md"
>
	<h2 class="mb-4 text-xl font-bold">Pension Calculation via API</h2>

	<!-- State Selection -->
	<div class="mb-4">
		<label for="state" class="mb-1 block font-semibold">State:</label>
		<select
			id="state"
			bind:value={selectedState}
			class="w-full rounded border border-gray-300 px-2 py-1"
		>
			{#each states as st}
				<option value={st}>{st}</option>
			{/each}
		</select>
	</div>

	<!-- Years of Service -->
	<div class="mb-4">
		<label for="yearsOfService" class="mb-1 block font-semibold">Years of Service:</label>
		<input
			id="yearsOfService"
			type="number"
			min="0"
			max="100"
			bind:value={yearsOfService}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>

	<!-- Years until retirement -->
	<div class="mb-4">
		<label for="yearsOfService" class="mb-1 block font-semibold">Years until retirement:</label>
		<input
			id="yearsUntilRetirement"
			type="number"
			min="0"
			max="100"
			bind:value={yearsUntilRetirement}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>

	<!-- Average Salary -->
	<div>
		<label for="averageSalary" class="mb-1 block font-semibold">Average Salary:</label>
		<input
			id="averageSalary"
			type="number"
			bind:value={averageSalary}
			class="w-full rounded border border-gray-300 px-2 py-1"
			required
		/>
	</div>

	<button
		type="submit"
		class="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700"
	>
		Calculate Pension
	</button>

	{#if errorMessage}
		<div class="mt-4 border border-red-300 bg-red-50 p-2 text-red-600">
			Error: {errorMessage}
		</div>
	{/if}

	{#if estimatedPension !== null}
		<div class="mt-2 border border-dashed border-red-300 p-4">
			This calculation is currently off
		</div>
		<div class="mt-4 border border-green-300 bg-green-50 p-2">
			<p class="font-semibold">Estimated Pension:</p>
			<p>${estimatedPension.toLocaleString()}</p>
			<p class="font-semibold">Income Gap:</p>
			<p>${incomeGap?.toLocaleString()}</p>
		</div>
	{/if}
</form>
