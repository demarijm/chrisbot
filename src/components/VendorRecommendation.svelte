<script lang="ts">
	import { onMount } from 'svelte';

	// We'll store the fetched district names here
	let allDistricts: string[] = [];

	// The user's selected district
	let selectedDistrict = '';

	// A user-selected risk category (just for demonstration)
	let userRisk = 'Conservative';

	// The recommendations we get after calling our /api/recommendations
	let recommendations: any[] = [];

	// 1) Fetch the districts from /api/districts on mount
	onMount(async () => {
		const res = await fetch('/api/districts');
		if (res.ok) {
			allDistricts = await res.json();
		} else {
			console.error('Failed to load district list');
		}
	});

	// 2) Function to fetch recommendations
	async function fetchRecommendations() {
		const url = `/api/recommendations?district=${encodeURIComponent(selectedDistrict)}&risk=${encodeURIComponent(userRisk)}`;

		try {
			const res = await fetch(url);
			if (!res.ok) {
				console.error('Failed to fetch recommendations:', res.status, res.statusText);
				return;
			}

			const data = await res.json();
			recommendations = data.recommendations;
		} catch (err) {
			console.error('Error fetching recommendations:', err);
		}
	}
</script>

<!-- Autocomplete input with datalist -->
<div>
	<label for="district-input">Select School District:</label>
	<input
		id="district-input"
		type="text"
		class="rounded border p-0.5"
		placeholder="Type or select a district"
		list="districts"
		bind:value={selectedDistrict}
	/>
	<datalist class="rounded border" id="districts">
		{#each allDistricts as dist}
			<option value={dist} />
		{/each}
	</datalist>
</div>

<!-- Risk dropdown -->
<div>
	<label for="risk-select">Risk Score:</label>
	<select id="risk-select" bind:value={userRisk}>
		<option value="Conservative">Conservative</option>
		<option value="Balanced">Balanced</option>
		<option value="Growth">Growth</option>
		<option value="Aggressive">Aggressive</option>
		<option value="Most Aggressive">Most Aggressive</option>
	</select>
</div>

<!-- Button to trigger fetch of recommendations -->
<div>
	<button on:click={fetchRecommendations}> Get Recommendations </button>
</div>

<!-- Display the recommendations -->
<h2>Recommendations for: {selectedDistrict || 'No District'}</h2>
{#if recommendations.length > 0}
	<ul>
		{#each recommendations as rec}
			<li>
				<strong>{rec.vendor}</strong>
				{#if rec.riskScoreCategory?.length}
					&nbsp;({rec.riskScoreCategory.join(', ')})
				{/if}
				{#if rec.notes}
					&nbsp;- {rec.notes}
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>No recommendations yet.</p>
{/if}
