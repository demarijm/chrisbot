<script lang="ts">
	import { page } from '$app/stores';
</script>

<section class="min-w-screen min-h-screen bg-gray-100">
	<div class="flex justify-center space-x-6 p-4">
		<a
			href="/"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/'}
			class:bg-gray-200={$page.url.pathname !== '/'}
		>
			Bot link generation
		</a>
		<a
			href="/risk"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/risk'}
			class:bg-gray-200={$page.url.pathname !== '/risk'}
		>
			Risk Calculation
		</a>
		<a
			href="/pension"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/pension'}
			class:bg-gray-200={$page.url.pathname !== '/pension'}
		>
			Pension Calculation
		</a>
		<a
			href="/vendor-recommendations"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/vendor-recommendation'}
			class:bg-gray-200={$page.url.pathname !== '/vendor-recommendation'}
		>
			Vendor Recommendations
		</a>
		<a
			href="/district-search"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/district-search'}
			class:bg-gray-200={$page.url.pathname !== '/district-search'}
		>
			District
		</a>
		<a
			href="/jeanie"
			class="rounded-t-md px-4 py-2 font-semibold"
			class:bg-white={$page.url.pathname === '/jeanie'}
			class:bg-gray-200={$page.url.pathname !== '/jeanie'}
		>
			Data back to Jeanie
		</a>
	</div>
	<div class="mx-auto max-w-md p-4">
		<slot />
	</div>
</section>
