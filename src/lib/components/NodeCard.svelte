<script lang="ts">
	import { app, JC } from '$lib/stores/app.svelte';
	import { getResponsibleLevelLabel } from '$lib/utils/responsibleLevel';
	import type { PlcNode } from '$lib/types';

	let { node, stepIndex, mobile = false }: { node: PlcNode; stepIndex?: number; mobile?: boolean } = $props();

	function handleClick() {
		app.selectedNode = app.selectedNode === node.id ? null : node.id;
	}

	const isSelected = $derived(app.selectedNode === node.id);

	const jurColor = $derived(JC[node.jurisdiction] ?? '#666');
	const responsibleLevel = $derived(getResponsibleLevelLabel(node));

	const badge = $derived(stepIndex != null ? String(stepIndex + 1) : null);
	const verificationStatus = $derived.by(() => {
		if (!node.description) return null;
		if (node.description.includes('Verification status: Needs verification')) return 'Needs verification';
		if (node.description.includes('Verification status: Draft')) return 'Draft';
		return null;
	});

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="node-card {mobile ? 'w-full' : 'w-[160px]'} p-2 cursor-pointer transition-all relative"
	style="border: {isSelected ? '2px' : '1px'} solid var(--ink); background: {isSelected ? 'var(--surface)' : 'var(--newsprint)'};"
	data-node-id={node.id}
	onclick={handleClick}
>
	{#if badge}
		<span
			class="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs leading-none"
			style="background: var(--ink); color: var(--newsprint);"
		>{badge}</span>
	{/if}
	<div class="font-body text-sm font-medium leading-tight mb-1.5" style="color: var(--ink);">
		{node.name}
	</div>
	<div class="mb-1.5 flex flex-col gap-1">
		<span
			class="inline-block w-fit font-mono text-[8px] uppercase tracking-wider px-1 py-0.5"
			style="border: 1px solid {jurColor}; color: {jurColor};"
		>{responsibleLevel}</span>
		<span class="font-mono text-[9px] leading-snug" style="color: var(--text);" title={node.agency ?? 'Responsible office pending'}>
			{node.agency ?? 'Responsible office pending'}
		</span>
	</div>
	{#if verificationStatus}
		<span
			class="inline-block font-mono text-[8px] uppercase tracking-wider px-1 py-0.5 mb-1.5"
			style="border: 1px solid var(--muted); color: {verificationStatus === 'Needs verification' ? 'var(--severity-major)' : 'var(--text)'};"
		>{verificationStatus}</span>
	{/if}
	{#if node.estTime || node.blocking || node.renewalTerm}
		<div class="font-mono text-[10px] space-y-0.5" style="color: var(--text);">
			{#if node.estTime}
				<div class="flex justify-between">
					<span>Est. Time</span>
					<span class="font-medium" style="color: var(--ink);">{node.estTime}</span>
				</div>
			{/if}
			{#if node.blocking}
				<div class="flex justify-between">
					<span>Status</span>
					<span class="font-medium" style="color: var(--accent);">Blocking</span>
				</div>
			{/if}
			{#if node.renewalTerm}
				<div class="flex justify-between">
					<span>Renewal</span>
					<span class="font-medium" style="color: var(--ink);">&#8635; {node.renewalTerm}</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.node-card:hover {
		border-width: 2px !important;
		background: var(--surface) !important;
	}
</style>
