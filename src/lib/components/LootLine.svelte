<script lang="ts">
	import { Gem, Hexagon, Zap } from '@lucide/svelte';
	import { MATERIALS } from '#lib/universe.ts';
	import type { Loot, Material } from '#lib/types.ts';

	// Affiche un butin (ou un stock) avec l'icône de chaque matériau. `signed` ajoute le + devant les gains.
	let { loot, signed = false, size = 13 }: { loot?: Loot | Record<Material, number>; signed?: boolean; size?: number } = $props();

	const ICON = { metal: Hexagon, energy: Zap, crystal: Gem } as const;
	const COLOR = { metal: 'text-zinc-500', energy: 'text-amber-500', crystal: 'text-accent' } as const;
	const order: Material[] = ['metal', 'energy', 'crystal'];
	const items = $derived(order.filter((m) => loot?.[m]).map((m) => ({ m, n: loot![m]! })));
</script>

{#if items.length}
	<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
		{#each items as { m, n } (m)}
			{@const Icon = ICON[m]}
			<span class="inline-flex items-center gap-0.5 font-semibold tabular-nums" title={MATERIALS[m].name}>
				<Icon {size} strokeWidth={2.2} class={COLOR[m]} />{signed && n > 0 ? '+' : ''}{n}
			</span>
		{/each}
	</span>
{/if}
