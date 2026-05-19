<script lang="ts">
	import { app } from '$lib/stores/app.svelte';
	import type { Journey, PlcNode, Reference } from '$lib/types';

	let { journey, references }: { journey: Journey; references: Reference[] } = $props();
	let isOpen = $state(true);

	type RefGroup = 'regulatory' | 'guide' | 'dataset';
	const groupOrder: RefGroup[] = ['regulatory', 'guide', 'dataset'];
	const typeLabels: Record<RefGroup, string> = {
		regulatory: 'Regulatory',
		guide: 'Industry Guides',
		dataset: 'Datasets'
	};

	const grouped = $derived.by(() => {
		const groups: Record<RefGroup, Reference[]> = { regulatory: [], guide: [], dataset: [] };
		for (const ref of references) {
			if (ref.type in groups) groups[ref.type].push(ref);
		}
		return groups;
	});

	const stepNodes = $derived.by(() => {
		return journey.steps
			.map((id) => app.nodeMap[id])
			.filter((node): node is PlcNode => Boolean(node));
	});

	const uniqueStepSources = $derived.by(() => {
		const seen = new Set<string>();
		for (const node of stepNodes) {
			if (!node.source?.title || !node.source.url) continue;
			seen.add(`${node.source.title}|${node.source.url}`);
		}
		return seen.size;
	});

	function verificationStatus(description?: string | null) {
		if (!description) return null;
		if (description.includes('Verification status: Needs verification')) return 'Needs verification';
		if (description.includes('Verification status: Draft')) return 'Draft';
		return null;
	}
</script>

<section class="mt-8 pt-5" style="border-top: 1px solid var(--muted);">
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
		style="background: none; border: none; padding: 0; color: var(--text); cursor: pointer;"
		aria-expanded={isOpen}
	>
		<span
			class="inline-block transition-transform"
			style="transform: rotate({isOpen ? 90 : 0}deg); font-size: 0.7em;"
			aria-hidden="true"
		>&gt;</span>
		Sources and verification ({uniqueStepSources + references.length})
	</button>

	{#if isOpen}
		<div class="mt-4 flex flex-col gap-5">
			<p class="font-body text-sm leading-relaxed max-w-3xl" style="color: var(--text);">
				These references are used to support journey mapping and verification. The journeys are draft, illustrative, and should not be treated as legal advice or official instructions.
			</p>

			<div>
				<h5 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style="color: var(--text);">
					Step references
				</h5>
				<ul class="flex flex-col" style="border-top: 1px solid var(--muted);">
					{#each stepNodes as node, i (node.id)}
						{@const status = verificationStatus(node.description)}
						<li
							class="grid gap-2 py-3 md:grid-cols-[minmax(0,1fr)_minmax(180px,auto)] md:items-center"
							style="border-bottom: 1px solid var(--muted);"
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-mono text-[10px] uppercase tracking-wider" style="color: var(--text);">Step {i + 1}</span>
									{#if status}
										<span
											class="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5"
											style="border: 1px solid var(--muted); color: {status === 'Needs verification' ? 'var(--severity-major)' : 'var(--text)'};"
										>{status}</span>
									{/if}
								</div>
								<p class="font-body text-sm mt-1" style="color: var(--ink);">{node.name}</p>
							</div>
							{#if node.source?.url}
								<a
									href={node.source.url}
									target="_blank"
									rel="noopener noreferrer"
									class="font-body text-sm underline decoration-1 underline-offset-2 hover:opacity-70 transition-opacity md:text-right"
									style="color: var(--ink);"
								>
									{node.source.title}
								</a>
							{:else}
								<span class="font-mono text-[10px] uppercase tracking-wider md:text-right" style="color: var(--text);">
									Source pending verification
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			{#each groupOrder as type (type)}
				{#if grouped[type].length > 0}
					<div>
						<h5 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style="color: var(--text);">
							{typeLabels[type]}
						</h5>
						<ul class="flex flex-col">
							{#each grouped[type] as ref (ref.url)}
								<li
									class="flex justify-between items-baseline gap-3 py-1.5"
									style="border-bottom: 1px solid var(--muted);"
								>
									<a
										href={ref.url}
										target="_blank"
										rel="noopener noreferrer"
										class="font-body text-sm underline decoration-1 underline-offset-2 hover:opacity-70 transition-opacity"
										style="color: var(--ink);"
									>
										{ref.title}
									</a>
									<span
										class="font-mono text-[10px] uppercase tracking-wider shrink-0"
										style="color: var(--text);"
									>{ref.accessed}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</section>
