<script lang="ts">
	// Anneau de progression du niveau du pilote.
	let { level, into, needed, size = 64 }: { level: number; into: number; needed: number; size?: number } = $props();

	const r = 26;
	const c = 2 * Math.PI * r;
	const ratio = $derived(Math.min(1, needed ? into / needed : 0));
</script>

<div class="relative shrink-0" style="width:{size}px;height:{size}px" title="{into} / {needed} XP vers le niveau {level + 1}">
	<svg viewBox="0 0 64 64" width={size} height={size} class="-rotate-90" aria-hidden="true">
		<circle cx="32" cy="32" {r} fill="none" stroke="var(--line)" stroke-width="5" />
		<circle
			cx="32"
			cy="32"
			{r}
			fill="none"
			stroke="var(--accent)"
			stroke-width="5"
			stroke-linecap="round"
			stroke-dasharray={c}
			stroke-dashoffset={c * (1 - ratio)}
			class="transition-[stroke-dashoffset] duration-700"
		/>
	</svg>
	<div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
		<span class="text-[9px] font-bold tracking-wider text-muted uppercase">niv.</span>
		<span class="text-lg font-black">{level}</span>
	</div>
</div>
