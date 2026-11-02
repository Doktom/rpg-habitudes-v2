<script lang="ts">
	import type { DayMark } from '#lib/engine/regularity.ts';

	// Sept pastilles (lundi → dimanche) : fait, raté, à faire, non dû. La pastille du jour est entourée.
	let { marks, current }: { marks: DayMark[]; current: number } = $props();

	const LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
	const STYLE: Record<DayMark, string> = {
		done: 'bg-done text-on-accent',
		missed: 'bg-rose-100 text-rose-700',
		todo: 'border border-dashed border-accent text-accent',
		later: 'bg-raised text-muted',
		shield: 'bg-sky-100 text-sky-800',
		off: 'text-muted opacity-40'
	};
	const SAY: Record<DayMark, string> = { done: 'fait', missed: 'raté', todo: 'à faire', later: 'à venir', shield: 'protégé par un bouclier', off: 'libre' };
</script>

<span class="inline-flex items-center gap-0.5" role="img" aria-label={marks.map((m, i) => `${LETTERS[i]} ${SAY[m]}`).join(', ')}>
	{#each marks as m, i (i)}
		<span
			class="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black {STYLE[m]} {i === current ? 'ring-2 ring-accent/40' : ''}"
		>
			{LETTERS[i]}
		</span>
	{/each}
</span>
