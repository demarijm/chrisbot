<script lang="ts">
	import type { RecommendationResult } from '$lib/types';
	import { onMount } from 'svelte';

	// We'll store the fetched district names here
	let allDistricts: string[] = [];

	let selectedDistrict = '';
	let userRisk = 'Conservative';

	// The recommendations we get after calling our /api/recommendations
	let recommendations: RecommendationResult | null = null;

	// 1) Fetch the districts from /api/districts on mount
	onMount(async () => {
		const res = await fetch('/api/districts');
		if (res.ok) {
			allDistricts = await res.json();
		} else {
			console.error('Failed to load district list');
		}
	});

	// 2) Function to fetch recommendations via POST
	async function fetchRecommendations() {
		try {
			const res = await fetch('/api/recommendations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					district: selectedDistrict,
					risk: userRisk
				})
			});

			if (!res.ok) {
				throw new Error(`Failed to fetch recommendations. Status: ${res.status}`);
			}

			const data = await res.json();
			recommendations = data.recommendations; // typed as RecommendationResult
		} catch (error) {
			console.error(error);
		}
	}
</script>

<!-- Container -->
<div class="mx-auto max-w-xl space-y-6 rounded bg-white p-6 shadow">
	<!-- Form heading -->
	<h2 class="text-xl font-semibold">Retirement Plan Recommendations</h2>

	<!-- District Input -->
	<div class="space-y-1">
		<label for="district-input" class="block text-sm font-medium text-gray-700">
			Select School District
		</label>
		<input
			id="district-input"
			type="text"
			list="districts"
			bind:value={selectedDistrict}
			placeholder="Type or select a district"
			class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
		/>
		<datalist id="districts">
			{#each allDistricts as dist}
				<option value={dist} />
			{/each}
		</datalist>
	</div>

	<!-- Risk dropdown -->
	<div class="space-y-1">
		<label for="risk-select" class="block text-sm font-medium text-gray-700"> Risk Score </label>
		<select
			id="risk-select"
			bind:value={userRisk}
			class="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
		>
			<option value="Conservative">Conservative</option>
			<option value="Balanced">Balanced</option>
			<option value="Growth">Growth</option>
			<option value="Aggressive">Aggressive</option>
			<option value="Most Aggressive">Most Aggressive</option>
		</select>
	</div>

	<!-- Get Recommendations Button -->
	<div>
		<button
			on:click={fetchRecommendations}
			class="inline-flex items-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
		>
			Get Recommendations
		</button>
	</div>

	<!-- Display Recommendations if available -->
	{#if recommendations}
		<div class="space-y-4">
			<p class="text-gray-700">{recommendations.message}</p>

			<!-- Top 403(b) Matches -->
			<div>
				<h3 class="text-lg font-medium">Top 403(b) Matches</h3>
				{#if recommendations.top403b.length}
					<ul class="mt-2 list-inside list-disc space-y-1">
						{#each recommendations.top403b as item}
							<li>
								{item.vendor}
								<span class="text-sm text-gray-600">
									(Risk categories: {item.riskScoreCategory.join(', ')})
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-gray-600">No matches found from our recommended list.</p>
				{/if}
			</div>

			<!-- All District 403(b) Carriers -->
			<div>
				<h3 class="text-lg font-medium">All District 403(b) Carriers</h3>
				<ul class="mt-2 list-inside list-disc space-y-1">
					{#each recommendations.all403b as carrier}
						<li>{carrier.name}</li>
					{/each}
				</ul>
			</div>

			<!-- Fallback IRA Options -->
			<div>
				<h3 class="text-lg font-medium">Fallback IRA Options</h3>
				<ul class="mt-2 list-inside list-disc space-y-1">
					{#each recommendations.fallbackIRA as ira}
						<li>{ira.vendor}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>
