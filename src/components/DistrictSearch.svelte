<script>
	import { writable } from 'svelte/store';

	let district = '';
	let loading = false; // New state variable for loading
	let selectedState = 'AL';
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
	const result = writable(null);
	const error = writable(null);

	async function searchDistrict() {
		loading = true;
		try {
			error.set(null);
			const response = await fetch('/api/districts', {
				method: 'POST',
				body: JSON.stringify({ district, state: selectedState }),
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error);
			result.set(data);
		} catch (err) {
			error.set(err.message);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-md p-4">
	<input
		type="text"
		bind:value={district}
		placeholder="Enter district name"
		class="mb-2 w-full rounded border p-2"
	/>
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

	<button
		on:click={searchDistrict}
		disabled={loading}
		class="flex w-full items-center justify-center rounded bg-blue-500 p-2 text-white"
	>
		{#if loading}
			<!-- Spinner icon from Tailwind CSS -->
			<svg
				class="mr-2 h-5 w-5 animate-spin"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
				></path>
			</svg>
			Searching...
		{:else}
			Search
		{/if}
	</button>

	{#if $error}
		<p class="mt-2 text-red-500">{$error}</p>
	{/if}

	{#if $result}
		<div class="mt-4 rounded border p-2">
			<h2 class="text-lg font-bold">District: {$result.district}</h2>
			<h3 class="text-md font-semibold">Carriers:</h3>
			<ul>
				{#each $result.carriers as carrier}
					<li>{carrier.name}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
