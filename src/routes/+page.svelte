<script lang="ts">
	import GeneralForm from '../components/GeneralForm.svelte';
	import TestingRiskCalculation from '../components/TestingRiskCalculation.svelte';

	// Track which tab is currently active
	let activeTab: 'general' | 'risk' = 'general';

	function switchTab(tab: 'general' | 'risk') {
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
			General Form
		</button>
		<button
			on:click={() => switchTab('risk')}
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={activeTab === 'risk'}
			class:bg-gray-200={activeTab !== 'risk'}
		>
			Risk Calculation
		</button>
	</div>

	<!-- Tab Content -->
	<div class="mx-auto w-full max-w-3xl rounded-b-md bg-white p-6 shadow-md">
		{#if activeTab === 'general'}
			<GeneralForm />
		{:else}
			<TestingRiskCalculation />
		{/if}
	</div>
</section>
