<script lang="ts">
	import type { Sector, SectorState } from '#lib/engine/ship.ts';
	import { PLANET_NAME } from '#lib/universe.ts';

	// L'orbite de la semaine dessinée comme une ellipse autour de Kronos : un nœud par jour, du lundi (à gauche)
	// en passant par le haut, et le vaisseau sur le secteur courant.
	let { sectors, current, labels = true }: { sectors: Sector[]; current: string; labels?: boolean } = $props();

	const W = 340;
	const H = 150;
	const cx = W / 2;
	const cy = 78;
	const rx = 140;
	const ry = 46;

	const pos = (i: number) => {
		const a = ((180 + (i * 360) / 7) * Math.PI) / 180;
		return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), top: Math.sin(a) < 0 };
	};

	const LABEL: Record<SectorState, string> = {
		lit: 'allumé',
		rest: 'repos',
		partial: 'à moitié',
		today: 'en cours',
		missed: 'manqué',
		future: 'à venir'
	};
</script>

<svg viewBox="0 0 {W} {H}" class="w-full" role="img" aria-label="Orbite de la semaine autour de {PLANET_NAME}">
	<ellipse {cx} {cy} {rx} {ry} fill="none" stroke="var(--line)" stroke-width="1.5" />
	<ellipse {cx} {cy} rx={rx - 10} ry={ry - 6} fill="none" stroke="var(--line)" stroke-width="0.6" stroke-dasharray="2 5" />

	<circle {cx} {cy} r="24" fill="var(--accent-soft)" />
	<circle {cx} {cy} r="24" fill="none" stroke="var(--accent)" stroke-opacity="0.35" />
	<ellipse {cx} {cy} rx="36" ry="7" fill="none" stroke="var(--accent)" stroke-opacity="0.3" />
	<text x={cx} y={cy + 4} text-anchor="middle" class="fill-[var(--muted)] text-[9px] font-bold tracking-widest uppercase">{PLANET_NAME}</text>

	{#each sectors as s, i (s.date)}
		{@const p = pos(i)}
		{@const here = s.date === current}
		<g>
			<title>{s.name} : {LABEL[s.state]}{s.expected ? ` (${s.done}/${s.expected})` : ''}</title>
			{#if s.state === 'lit'}
				<circle cx={p.x} cy={p.y} r="12" fill="var(--accent)" fill-opacity="0.18" />
				<circle cx={p.x} cy={p.y} r="7" fill="var(--accent)" />
			{:else if s.state === 'partial'}
				<circle cx={p.x} cy={p.y} r="7" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5" />
				<path d="M {p.x} {p.y - 7} A 7 7 0 0 1 {p.x} {p.y + 7} Z" fill="var(--accent)" />
			{:else if s.state === 'rest'}
				<circle cx={p.x} cy={p.y} r="7" fill="var(--g-inspiration)" fill-opacity="0.55" />
			{:else if s.state === 'today'}
				<circle cx={p.x} cy={p.y} r="9" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2.5" class="orbit-pulse" />
				{#if s.done}
					<path d="M {p.x} {p.y - 5} A 5 5 0 0 1 {p.x} {p.y + 5} Z" fill="var(--accent)" fill-opacity={0.3 + (0.7 * s.done) / s.expected} />
				{/if}
			{:else if s.state === 'missed'}
				<circle cx={p.x} cy={p.y} r="5.5" fill="var(--surface)" stroke="var(--reward)" stroke-opacity="0.7" stroke-width="1.5" />
			{:else}
				<circle cx={p.x} cy={p.y} r="4" fill="var(--line)" />
			{/if}

			{#if here}
				<g transform="translate({p.x} {p.y + (p.top ? -24 : 24)})" aria-label="Position du vaisseau">
					<path d="M 0 -7 L 5 5 L 0 2.5 L -5 5 Z" fill="var(--reward)" transform={p.top ? '' : 'rotate(180)'} />
				</g>
			{/if}

			{#if labels}
				<text
					x={p.x}
					y={p.y + (p.top ? (here ? -36 : -15) : here ? 42 : 21)}
					text-anchor="middle"
					class="text-[10px] font-bold {here ? 'fill-[var(--ink)]' : 'fill-[var(--muted)]'}"
				>
					{s.name}
				</text>
			{/if}
		</g>
	{/each}
</svg>

<style>
	.orbit-pulse {
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 2.8s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.15);
			opacity: 0.75;
		}
	}
</style>
