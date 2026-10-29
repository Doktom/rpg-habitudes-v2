<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { TIER_LABEL } from '#lib/labels.ts';
	import type { Tier } from '#lib/types.ts';

	let {
		current,
		minimumOnly = false,
		titles,
		onpick,
		onclear
	}: {
		current?: Tier;
		minimumOnly?: boolean;
		titles?: Record<Tier, string>;
		onpick: (t: Tier) => void;
		onclear: () => void;
	} = $props();

	const tiers = $derived<Tier[]>(minimumOnly ? ['min'] : ['min', 'normal', 'excellent']);
</script>

<div class="inline-flex shrink-0 rounded-full border border-line bg-raised p-0.5" role="group" aria-label="Palier">
	{#each tiers as t (t)}
		<button
			class="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors {current === t
				? t === 'excellent'
					? 'bg-reward text-on-accent'
					: 'bg-accent text-on-accent'
				: 'text-muted hover:text-ink'}"
			title={titles?.[t] ? `${TIER_LABEL[t]} : ${titles[t]}` : TIER_LABEL[t]}
			aria-pressed={current === t}
			onclick={() => (current === t ? onclear() : onpick(t))}
		>
			{#if current === t}<Check size={12} strokeWidth={3} />{/if}{TIER_LABEL[t]}
		</button>
	{/each}
</div>
