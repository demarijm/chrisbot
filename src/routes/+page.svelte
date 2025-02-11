<script lang="ts">
	import GeneralForm from '../components/GeneralForm.svelte';
	import PensionForm from '../components/PensionForm.svelte';
	import TestingRiskCalculation from '../components/TestingRiskCalculation.svelte';
	import VendorRecommendation from '../components/VendorRecommendation.svelte';

	// Track which tab is currently active
	let activeTab: 'general' | 'risk' | 'vendor' | 'jeanie' | 'pension' = 'general';

	function switchTab(tab: 'general' | 'risk' | 'pension' | 'vendor' | 'jeanie') {
		activeTab = tab;
	}
</script>

<section class="min-w-screen min-h-screen bg-gray-100">
	<!-- Tab Buttons -->
	<div class="flex justify-center space-x-6 p-4">
		<button
			on:click={() => switchTab('general')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'general'}
			class:bg-gray-200={activeTab !== 'general'}
		>
			Bot link generation
		</button>
		<button
			on:click={() => switchTab('risk')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'risk'}
			class:bg-gray-200={activeTab !== 'risk'}
		>
			Risk Calculation
		</button>
		<button
			on:click={() => switchTab('pension')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'pension'}
			class:bg-gray-200={activeTab !== 'pension'}
		>
			Pension Calculation
		</button>
		<button
			on:click={() => switchTab('vendor')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'vendor'}
			class:bg-gray-200={activeTab !== 'vendor'}
		>
			Vendor Recommendations
		</button>
		<button
			on:click={() => switchTab('jeanie')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'jeanie'}
			class:bg-gray-200={activeTab !== 'jeanie'}
		>
			Data back to Jeanie
		</button>
	</div>

	<!-- Tab Content -->
	<div class="mx-auto w-full max-w-3xl rounded-b-md bg-white p-6 shadow-md">
		{#if activeTab === 'general'}
			<GeneralForm />
		{:else if activeTab === 'risk'}
			<TestingRiskCalculation />
		{:else if activeTab === 'pension'}
			<PensionForm />
		{:else if activeTab === 'vendor'}
			<VendorRecommendation />
		{:else if activeTab === 'jeanie'}
			Data Object handed back to Jeanie
		{/if}
	</div>
</section>
