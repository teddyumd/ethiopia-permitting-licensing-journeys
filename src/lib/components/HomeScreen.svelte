<script lang="ts">
	import { base } from '$app/paths';
	import { app } from '$lib/stores/app.svelte';
	import JourneyRow from './JourneyRow.svelte';

	function toggleJurisdiction(jur: string) {
		if (app.filterJurisdictions.includes(jur)) {
			app.filterJurisdictions = app.filterJurisdictions.filter(j => j !== jur);
		} else {
			app.filterJurisdictions = [...app.filterJurisdictions, jur];
		}
	}

	function toggleCategory(cat: string) {
		if (app.filterCategories.includes(cat)) {
			app.filterCategories = app.filterCategories.filter(c => c !== cat);
		} else {
			app.filterCategories = [...app.filterCategories, cat];
		}
	}

	function clearFilters() {
		app.filterJurisdictions = [];
		app.filterCategories = [];
		app.filterSearch = '';
		audienceFilter = 'all';
	}

	let audienceFilter = $state<'all' | 'business' | 'individual'>('all');

	const audienceJourneys = $derived(app.journeys.filter((journey) => {
		if (audienceFilter === 'individual') {
			return journey.cat.startsWith('individual-services-');
		}
		if (audienceFilter === 'business') {
			return !journey.cat.startsWith('individual-services-');
		}
		return true;
	}));
	const availableCategoryIds = $derived(new Set(audienceJourneys.map((journey) => journey.cat)));
	const availableCategories = $derived(app.categories.filter((cat) => availableCategoryIds.has(cat.id)));
	const filtered = $derived(app.filteredJourneys.filter((journey) => availableCategoryIds.has(journey.cat)));
	const hasFilters = $derived(app.filterJurisdictions.length > 0 || app.filterCategories.length > 0 || app.filterSearch.length > 0 || audienceFilter !== 'all');

	$effect(() => {
		const nextCategories = app.filterCategories.filter((cat) => availableCategoryIds.has(cat));
		if (nextCategories.length !== app.filterCategories.length) {
			app.filterCategories = nextCategories;
		}
	});
</script>

<div class="flex-1 overflow-hidden flex flex-col md:flex-row" style="background: var(--newsprint);">
	<!-- Left Column: Context + Filters -->
	<div class="w-full md:w-2/5 h-auto md:h-screen p-8 md:p-12 lg:p-16 flex flex-col shrink-0 overflow-y-auto" style="border-right: 1px solid var(--muted);">
		<div class="space-y-8 max-w-md">
			<h1 class="font-display text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight" style="color: var(--ink);">
				Ethiopia Permit & Public Service Journey Explorer
			</h1>
			<p class="font-body text-base leading-relaxed" style="color: var(--text);">
				This explorer maps common business and individual public-service journeys in Ethiopia. Some journeys focus on starting and licensing a business, such as opening a consultancy, restaurant, pharmacy, clinic, retail shop, or logistics company. Others focus on everyday services individuals may need, such as opening a Fayda account, paying rental income tax, buying property, opening a bank account, registering a vehicle, getting a passport, or connecting utilities.
			</p>
			<div class="space-y-4">
				<a href="{base}/methodology" class="font-mono text-xs uppercase tracking-[1.5px] underline hover:no-underline block" style="color: var(--text);">
					How these journeys were mapped &rarr;
				</a>
				<p class="font-body text-sm leading-relaxed" style="color: var(--text);">
					I'm <a href="https://github.com/teddyumd" target="_blank" rel="noopener noreferrer" class="font-bold no-underline hover:underline" style="color: var(--ink);">Tewodros Hailegeberel</a>, and I'm building this open-source Ethiopia Permit and Public Service Journey Explorer to help people, entrepreneurs, practitioners, policymakers, and digital government teams understand how public service processes actually work. The journeys are illustrative and still being improved, so I welcome corrections from people who have gone through these processes or work with the responsible offices.
				</p>
				<div class="flex flex-wrap gap-3 pt-1">
					<a
						href="{base}/contact"
						class="px-4 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] no-underline transition-opacity hover:opacity-80"
						style="background: var(--ink); color: var(--newsprint);"
					>
						Share feedback &rarr;
					</a>
					<a
						href="https://github.com/teddyumd/ethiopia-permitting-licensing-journeys"
						target="_blank"
						rel="noopener noreferrer"
						class="cta-outline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] no-underline transition-colors"
					>
						View on GitHub
					</a>
				</div>
			</div>

			<!-- Filter Panel -->
			<div class="space-y-5 pt-2">
				<!-- Search -->
				<div class="relative">
					<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color: var(--text);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
					</svg>
					<input
						type="text"
						placeholder="Search journeys..."
						class="w-full pl-10 pr-3 py-2.5 font-mono text-xs"
						style="border: 1px solid var(--ink); background: #fff; color: var(--ink); outline: none;"
						bind:value={app.filterSearch}
					/>
				</div>

				<!-- By Audience -->
				<div>
					<h3 class="font-mono text-[10px] uppercase tracking-[2px] mb-3" style="color: var(--text);">By Audience</h3>
					<div class="flex flex-wrap gap-2">
						<button
							class="px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors"
							style="border: 1px solid {audienceFilter === 'all' ? 'var(--ink)' : 'var(--muted)'}; background: {audienceFilter === 'all' ? 'var(--ink)' : 'transparent'}; color: {audienceFilter === 'all' ? 'var(--surface)' : 'var(--text)'};"
							onclick={() => audienceFilter = 'all'}
						>
							All
						</button>
						<button
							class="px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors"
							style="border: 1px solid {audienceFilter === 'business' ? 'var(--ink)' : 'var(--muted)'}; background: {audienceFilter === 'business' ? 'var(--ink)' : 'transparent'}; color: {audienceFilter === 'business' ? 'var(--surface)' : 'var(--text)'};"
							onclick={() => audienceFilter = 'business'}
						>
							Business
						</button>
						<button
							class="px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors"
							style="border: 1px solid {audienceFilter === 'individual' ? 'var(--ink)' : 'var(--muted)'}; background: {audienceFilter === 'individual' ? 'var(--ink)' : 'transparent'}; color: {audienceFilter === 'individual' ? 'var(--surface)' : 'var(--text)'};"
							onclick={() => audienceFilter = 'individual'}
						>
							Individual
						</button>
					</div>
				</div>

				<!-- By Jurisdiction -->
				<div>
					<h3 class="font-mono text-[10px] uppercase tracking-[2px] mb-3" style="color: var(--text);">By Jurisdiction</h3>
					<div class="flex flex-wrap gap-2">
						{#each app.jurisdictions as jurisdiction (jurisdiction.id)}
							<button
								class="px-3 py-1.5 font-mono text-[11px] tracking-wide transition-colors"
								style="border: 1px solid {app.filterJurisdictions.includes(jurisdiction.id) ? 'var(--ink)' : 'var(--muted)'}; background: {app.filterJurisdictions.includes(jurisdiction.id) ? 'var(--ink)' : 'transparent'}; color: {app.filterJurisdictions.includes(jurisdiction.id) ? 'var(--surface)' : 'var(--text)'};"
								onclick={() => toggleJurisdiction(jurisdiction.id)}
							>
								{jurisdiction.name}
							</button>
						{/each}
					</div>
				</div>

				<!-- By Category -->
				<div>
					<h3 class="font-mono text-[10px] uppercase tracking-[2px] mb-3" style="color: var(--text);">By Category</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each availableCategories as cat}
							<button
								class="px-2.5 py-1 font-mono text-[10px] tracking-wide transition-colors"
								style="border: 1px solid {app.filterCategories.includes(cat.id) ? 'var(--ink)' : 'var(--muted)'}; background: {app.filterCategories.includes(cat.id) ? 'var(--ink)' : 'transparent'}; color: {app.filterCategories.includes(cat.id) ? 'var(--surface)' : 'var(--text)'};"
								onclick={() => toggleCategory(cat.id)}
							>
								{cat.name}
							</button>
						{/each}
					</div>
				</div>

				{#if hasFilters}
					<button
						class="font-mono text-[10px] uppercase tracking-[1.5px] underline cursor-pointer"
						style="color: var(--accent);"
						onclick={clearFilters}
					>
						Clear all filters
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Right Column: Journey List -->
	<div class="w-full md:w-3/5 h-full relative flex flex-col" style="background: var(--newsprint);">
		<!-- Sticky Header -->
		<div class="sticky top-0 z-10 w-full px-8 py-4 flex justify-between items-center" style="background: rgba(244,243,240,.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--muted);">
			<div class="font-mono text-xs tracking-wider" style="color: var(--text);">
				{#if hasFilters}
					<span class="font-medium" style="color: var(--accent);">{filtered.length}</span>
					<span> of </span>
				{/if}
				<span class="font-medium" style="color: var(--ink);">{app.journeys.length}</span>
				<span class="uppercase tracking-[1.5px] ml-1">Journeys</span>
				<span class="ml-1 opacity-40">|</span>
				<span class="ml-1 uppercase tracking-[1.5px]">Select a journey to begin tracing</span>
			</div>
		</div>

		<!-- Scrolling List -->
		<div class="flex-1 overflow-y-auto hide-scrollbar pb-24">
			{#each filtered as journey (journey.id)}
				<JourneyRow {journey} />
			{/each}
			{#if filtered.length === 0}
				<div class="px-8 py-16 text-center">
					<p class="font-mono text-sm" style="color: var(--text);">No journeys match the current filters.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.cta-outline {
		border: 1px solid var(--ink);
		color: var(--ink);
		background: transparent;
	}
	.cta-outline:hover {
		background: var(--ink);
		color: var(--newsprint);
	}
</style>
