<script lang="ts">
	// Radar des disciplines du pilote : un axe par stat, la distance au centre suit le niveau.
	let { items }: { items: { label: string; level: number; color: string }[] } = $props();

	// Marge latérale large : les libellés des axes gauche et droit doivent tenir dans le cadre.
	const cx = 200;
	const cy = 132;
	const R = 92;

	const max = $derived(Math.max(5, ...items.map((i) => i.level)));
	const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
	const at = (i: number, r: number) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });
	const ring = (f: number) => items.map((_, i) => at(i, R * f)).map((p) => `${p.x},${p.y}`).join(' ');
	const shape = $derived(items.map((it, i) => at(i, (R * it.level) / max)).map((p) => `${p.x},${p.y}`).join(' '));
</script>

{#if items.length >= 3}
	<svg viewBox="0 0 400 264" class="w-full" role="img" aria-label="Radar des disciplines : {items.map((i) => `${i.label} niveau ${i.level}`).join(', ')}">
		{#each [0.25, 0.5, 0.75, 1] as f (f)}
			<polygon points={ring(f)} fill="none" stroke="var(--line)" stroke-width={f === 1 ? 1.4 : 0.8} />
		{/each}
		{#each items as _, i (i)}
			{@const p = at(i, R)}
			<line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" stroke-width="0.8" />
		{/each}
		<polygon points={shape} fill="var(--accent)" fill-opacity="0.22" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" class="transition-all duration-700" />
		{#each items as it, i (it.label)}
			{@const p = at(i, (R * it.level) / max)}
			{@const l = at(i, R + 20)}
			{@const cos = Math.cos(angle(i))}
			<circle cx={p.x} cy={p.y} r="4.5" fill={it.color} stroke="var(--surface)" stroke-width="1.5" />
			<text
				x={l.x}
				y={l.y + 4}
				text-anchor={Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end'}
				class="fill-[var(--ink)] text-[11px] font-bold"
			>
				{it.label}
				<tspan class="fill-[var(--muted)] font-semibold"> {it.level}</tspan>
			</text>
		{/each}
	</svg>
{/if}
