<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { app } from '$lib/stores/app.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import { getJourneyApplicableAreaLabel } from '$lib/utils/applicableArea';
	import { topoSort } from '$lib/utils/topoSort';
	import type { PlcNode } from '$lib/types';
	import MatrixGrid from './MatrixGrid.svelte';
	import NodeDetailPanel from './NodeDetailPanel.svelte';
	import ScreenSizeNotice from './ScreenSizeNotice.svelte';
	import SourcesPanel from './SourcesPanel.svelte';

	const isMobile = new IsMobile();

	const journey = $derived(app.activeJourney);

	const catLabel = $derived(journey ? (app.catName[journey.cat] ?? journey.cat) : '');
	const applicableArea = $derived(
		journey
			? getJourneyApplicableAreaLabel(journey.steps.map((id) => app.nodeMap[id]).filter(Boolean))
			: ''
	);
	const journeyNodes = $derived.by<PlcNode[]>(() => {
		if (!journey) return [];
		return journey.steps
			.map((id) => app.nodeMap[id])
			.filter((node): node is PlcNode => Boolean(node));
	});
	const orderedSteps = $derived(
		journey ? topoSort(journey.steps, journey.dependencies, app.nodeMap) : []
	);
	const firstStepName = $derived(orderedSteps.length > 0 ? app.nodeMap[orderedSteps[0]]?.name : null);
	const audience = $derived(
		journey?.cat.startsWith('individual-services-') ? 'Individual' : 'Business'
	);
	const beforeStartArea = $derived.by(() => {
		const name = journey?.name.toLowerCase() ?? '';
		if (name.includes('fayda') || name.includes('passport') || name.includes('police clearance')) {
			return 'National / Federal service';
		}
		return 'Mapped primarily for Addis Ababa and/or federal service points. Regional applicability should be verified.';
	});
	const mainAgencies = $derived.by(() => {
		const agencies: string[] = [];
		const seen = new Set<string>();
		for (const node of journeyNodes) {
			const agency = node.agency?.trim();
			if (!agency || seen.has(agency)) continue;
			seen.add(agency);
			agencies.push(agency);
		}
		return {
			items: agencies.slice(0, 5),
			hasMore: agencies.length > 5
		};
	});
	const documentsToPrepare = $derived.by(() => {
		const docs: string[] = [];
		const seen = new Set<string>();
		for (const node of journeyNodes) {
			const match = node.description?.match(/Key requirements:\s*([^\n]+)/i);
			if (!match) continue;
			for (const item of match[1].split(';')) {
				const doc = item.trim();
				const key = doc.toLowerCase();
				if (!doc || seen.has(key)) continue;
				seen.add(key);
				docs.push(doc);
			}
		}
		return docs.slice(0, 6);
	});
	const verificationStatus = $derived(
		journeyNodes.some((node) => node.description?.includes('Needs verification'))
			? 'Needs verification'
			: 'Draft'
	);

	const selectedNodeObj = $derived(app.selectedNode ? app.nodeMap[app.selectedNode] : null);
	const selectedStepIndex = $derived(
		app.selectedNode && journey ? journey.steps.indexOf(app.selectedNode) : -1
	);

	let searchValue = $state('');
	let showDropdown = $state(false);
	let highlightIndex = $state(-1);
	let blurTimeout: ReturnType<typeof setTimeout>;

	const matches = $derived(() => {
		const q = searchValue.trim().toLowerCase();
		if (!q) return [];
		return app.journeys
			.filter(j => j.id !== journey?.id && j.name.toLowerCase().includes(q))
			.slice(0, 8);
	});

	function navigateTo(id: string) {
		searchValue = '';
		showDropdown = false;
		highlightIndex = -1;
		goto(`${base}/journey/${id}`);
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		const list = matches();
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightIndex = Math.min(highlightIndex + 1, list.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightIndex = Math.max(highlightIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightIndex >= 0 && highlightIndex < list.length) {
				navigateTo(list[highlightIndex].id);
			} else if (list.length > 0) {
				navigateTo(list[0].id);
			}
		} else if (e.key === 'Escape') {
			showDropdown = false;
			highlightIndex = -1;
		}
	}

	function handleSearchInput() {
		showDropdown = searchValue.trim().length > 0;
		highlightIndex = -1;
	}

	function handleSearchFocus() {
		clearTimeout(blurTimeout);
		if (searchValue.trim()) showDropdown = true;
	}

	function handleSearchBlur() {
		blurTimeout = setTimeout(() => { showDropdown = false; }, 150);
	}
</script>

{#if journey}
	<div class="min-h-screen flex flex-col" style="background: var(--newsprint);">
		<ScreenSizeNotice />
		<!-- Journey Header -->
		<div class="px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6" style="border-bottom: 1px solid var(--muted);">
			<div class="min-w-0">
				<a href="{base}/" class="font-mono text-xs tracking-[1.5px] uppercase no-underline hover:underline" style="color: var(--text);">
						Ethiopia Permit & Public Service Journey Explorer
					</a>
				<h1 class="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mt-1 line-clamp-2" style="color: var(--ink);">
					{journey.name}
				</h1>
				<div class="mt-3 flex flex-wrap gap-2">
					<span
						class="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
						style="border: 1px solid var(--muted); color: var(--text);"
					>Applicable area: {applicableArea}</span>
				</div>
				<a
					href="{base}/contact?journey={encodeURIComponent(journey.name)}"
					class="inline-flex mt-3 px-3 py-2 font-mono text-[11px] uppercase tracking-[1.5px] no-underline hover:opacity-80 transition-opacity"
					style="border: 1px solid var(--ink); color: var(--ink); background: var(--surface);"
				>
					Submit correction for this journey
				</a>
			</div>
			<div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 shrink-0 md:pt-1 w-full md:w-auto">
				<!-- Search Autocomplete -->
				<div class="relative w-full md:w-auto">
					<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color: var(--text);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
					</svg>
					<input
						type="text"
						placeholder="Search journeys..."
						class="w-full md:w-56 pl-9 pr-3 py-1.5 font-mono text-xs"
						style="border: 1px solid var(--ink); background: #fff; color: var(--ink); outline: none;"
						bind:value={searchValue}
						onkeydown={handleSearchKeydown}
						oninput={handleSearchInput}
						onfocus={handleSearchFocus}
						onblur={handleSearchBlur}
						autocomplete="off"
					/>
					{#if showDropdown && matches().length > 0}
						<ul class="absolute top-full left-0 right-0 md:right-auto md:w-72 mt-1 py-1 z-50 max-h-64 overflow-y-auto"
							style="background: var(--surface); border: 1px solid var(--ink); box-shadow: 0 4px 12px rgba(0,0,0,.12);">
							{#each matches() as match, i}
								<li>
									<button
										class="w-full text-left px-3 py-2 font-mono text-xs cursor-pointer transition-colors"
										style="background: {i === highlightIndex ? 'var(--ink)' : 'transparent'}; color: {i === highlightIndex ? 'var(--surface)' : 'var(--ink)'};"
										onmousedown={() => navigateTo(match.id)}
										onmouseenter={() => highlightIndex = i}
									>
										{match.name}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<!-- View Toggle -->
				<div class="flex flex-col items-stretch md:items-end gap-1.5 w-full md:w-auto">
					<div class="flex h-8 items-center" style="border: 1px solid var(--ink);">
						<label
							class="flex-1 md:flex-none flex cursor-pointer h-full items-center justify-center px-4 font-mono text-xs font-medium transition-colors"
							style="background: {app.viewMode === 'standard' ? 'var(--ink)' : 'transparent'}; color: {app.viewMode === 'standard' ? 'var(--surface)' : 'var(--ink)'};"
						>
							<span>Standard View</span>
							<input class="invisible w-0" type="radio" name="view-toggle" value="standard" checked={app.viewMode === 'standard'} onchange={() => app.viewMode = 'standard'}>
						</label>
						<label
							class="flex-1 md:flex-none flex cursor-pointer h-full items-center justify-center px-4 font-mono text-xs font-medium transition-colors"
							style="background: {app.viewMode === 'dependency' ? 'var(--ink)' : 'transparent'}; color: {app.viewMode === 'dependency' ? 'var(--surface)' : 'var(--ink)'};"
						>
							<span>Dependency View</span>
							<input class="invisible w-0" type="radio" name="view-toggle" value="dependency" checked={app.viewMode === 'dependency'} onchange={() => app.viewMode = 'dependency'}>
						</label>
					</div>
					{#if app.viewMode === 'dependency'}
						<div class="flex h-7 items-center" style="border: 1px solid var(--muted);">
							<label
								class="flex-1 md:flex-none flex cursor-pointer h-full items-center justify-center px-3 font-mono text-[10px] tracking-[1px] uppercase transition-colors"
								style="background: {app.depMode === 'ambient' ? 'var(--muted)' : 'transparent'}; color: {app.depMode === 'ambient' ? 'var(--ink)' : 'var(--text)'};"
							>
								<span>Ambient</span>
								<input class="invisible w-0" type="radio" name="dep-mode-toggle" value="ambient" checked={app.depMode === 'ambient'} onchange={() => app.depMode = 'ambient'}>
							</label>
							<label
								class="flex-1 md:flex-none flex cursor-pointer h-full items-center justify-center px-3 font-mono text-[10px] tracking-[1px] uppercase transition-colors"
								style="background: {app.depMode === 'realistic' ? 'var(--muted)' : 'transparent'}; color: {app.depMode === 'realistic' ? 'var(--ink)' : 'var(--text)'};"
							>
								<span>Realistic</span>
								<input class="invisible w-0" type="radio" name="dep-mode-toggle" value="realistic" checked={app.depMode === 'realistic'} onchange={() => app.depMode = 'realistic'}>
							</label>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Matrix -->
		<main class="flex-1 p-4 pt-0 md:p-8 md:pt-0 overflow-x-auto">
			<section class="mt-6 p-4 md:p-5" style="background: var(--surface); border: 1px solid var(--ink);">
				<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
					<div>
						<h2 class="font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style="color: var(--text);">Before You Start</h2>
						<p class="font-body text-sm leading-relaxed mt-2 max-w-2xl" style="color: var(--text);">
							Use this summary to check fit, starting point, offices, and draft status before reading the detailed journey map.
						</p>
					</div>
					<a
						href="{base}/contact?journey={encodeURIComponent(journey.name)}"
						class="shrink-0 inline-flex px-3 py-2 font-mono text-[11px] uppercase tracking-[1.5px] no-underline hover:opacity-80 transition-opacity"
						style="border: 1px solid var(--ink); color: var(--ink); background: var(--newsprint);"
					>
						Submit correction for this journey
					</a>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">Audience</span>
						<p class="font-body text-sm font-semibold mt-1" style="color: var(--ink);">{audience}</p>
					</div>
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">Applicable area</span>
						<p class="font-body text-sm mt-1" style="color: var(--ink);">{beforeStartArea}</p>
					</div>
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">First step</span>
						<p class="font-body text-sm font-semibold mt-1" style="color: var(--ink);">{firstStepName ?? 'First step pending verification'}</p>
					</div>
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">Main office or offices</span>
						<ul class="mt-1 flex flex-col gap-1">
							{#each mainAgencies.items as agency (agency)}
								<li class="font-body text-sm leading-snug" style="color: var(--ink);">{agency}</li>
							{/each}
							{#if mainAgencies.hasMore}
								<li class="font-body text-sm leading-snug" style="color: var(--text);">and others.</li>
							{/if}
						</ul>
					</div>
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">Documents to prepare</span>
						{#if documentsToPrepare.length > 0}
							<ul class="mt-1 flex flex-col gap-1">
								{#each documentsToPrepare as document (document)}
									<li class="font-body text-sm leading-snug" style="color: var(--ink);">{document}</li>
								{/each}
							</ul>
						{:else}
							<p class="font-body text-sm mt-1" style="color: var(--ink);">Document requirements pending verification.</p>
						{/if}
					</div>
					<div>
						<span class="font-mono text-[10px] uppercase tracking-[1.5px]" style="color: var(--text);">Verification status</span>
						<p class="font-body text-sm font-semibold mt-1" style="color: {verificationStatus === 'Needs verification' ? 'var(--severity-major)' : 'var(--ink)'};">{verificationStatus}</p>
					</div>
				</div>
			</section>

			<div class="mt-6">
				<MatrixGrid {journey} {isMobile} />
			</div>
			<SourcesPanel {journey} references={journey.references ?? []} />
		</main>

		<!-- Node Detail Panel -->
		{#if selectedNodeObj}
			<NodeDetailPanel
				node={selectedNodeObj}
				stepIndex={selectedStepIndex >= 0 ? selectedStepIndex : undefined}
				totalSteps={journey.steps.length}
			/>
		{/if}
	</div>
{/if}
