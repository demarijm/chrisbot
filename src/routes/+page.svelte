<script lang="ts">
	import DistrictSearch from '../components/DistrictSearch.svelte';
	import GeneralForm from '../components/GeneralForm.svelte';
	import PensionForm from '../components/PensionForm.svelte';
	import TestingRiskCalculation from '../components/TestingRiskCalculation.svelte';
	import VendorRecommendation from '../components/VendorRecommendation.svelte';

	// Track which tab is currently active
	let activeTab: 'general' | 'risk' | 'vendor' | 'jeanie' | 'pension' | 'district' = 'general';

	function switchTab(tab: 'general' | 'risk' | 'pension' | 'vendor' | 'jeanie' | 'district') {
		activeTab = tab;
	}
</script>

<section class="min-w-screen flex min-h-screen w-full items-center justify-center bg-gray-100">
	<div>
		<GeneralForm />
	</div>
</section>
