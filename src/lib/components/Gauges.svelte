<script lang="ts">
	import { Flame, Shield, Sparkles } from '@lucide/svelte';
	import { GAUGES } from '#lib/config.ts';

	let {
		discipline,
		motivation,
		inspiration,
		stacked = false
	}: { discipline: number; motivation: number; inspiration: number; stacked?: boolean } = $props();

	const rows = $derived([
		{
			name: 'Discipline',
			lore: 'cohésion de bord',
			value: discipline,
			color: 'var(--g-discipline)',
			icon: Shield,
			hint: `XP ×${(1 + discipline / 100).toFixed(2)}`
		},
		{
			name: 'Motivation',
			lore: 'énergie du réacteur',
			value: motivation,
			color: 'var(--g-motivation)',
			icon: Flame,
			hint: motivation < GAUGES.minimumModeBelow ? 'Mode minimum conseillé' : ''
		},
		{
			name: 'Inspiration',
			lore: "portée de l'antenne",
			value: inspiration,
			color: 'var(--g-inspiration)',
			icon: Sparkles,
			hint: inspiration >= GAUGES.momentumFrom ? 'Élan bientôt disponible' : ''
		}
	]);
</script>

<div class="grid gap-4 {stacked ? '' : 'sm:grid-cols-3'}">
	{#each rows as g (g.name)}
		<div>
			<div class="mb-1.5 flex items-center gap-2">
				<span class="flex h-7 w-7 items-center justify-center rounded-full" style="background: color-mix(in oklab, {g.color} 18%, transparent); color: {g.color}">
					<g.icon size={15} strokeWidth={2.4} />
				</span>
				<div class="min-w-0 flex-1 leading-tight">
					<div class="text-sm font-bold">{g.name}</div>
					<div class="text-[11px] text-muted">{g.lore}</div>
				</div>
				<span class="text-lg font-black tabular-nums">{g.value}</span>
			</div>
			<div class="h-2.5 overflow-hidden rounded-full bg-zinc-200" role="meter" aria-label={g.name} aria-valuenow={g.value} aria-valuemin="0" aria-valuemax="100">
				<div class="h-full rounded-full transition-[width] duration-700" style="width: {g.value}%; background: {g.color}"></div>
			</div>
			{#if g.hint}<div class="mt-1 text-[11px] font-semibold text-muted">{g.hint}</div>{/if}
		</div>
	{/each}
</div>
