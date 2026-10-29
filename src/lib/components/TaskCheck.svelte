<script lang="ts">
	import { Check } from '@lucide/svelte';
	import type { Difficulty } from '#lib/types.ts';

	// Case ronde d'une tâche, dont l'anneau prend la couleur de l'effort.
	let { done, effort = 'easy', label, ontoggle }: { done: boolean; effort?: Difficulty; label: string; ontoggle: () => void } = $props();

	const RING = { easy: 'var(--g-inspiration)', medium: 'var(--accent)', hard: 'var(--reward)' } as const;
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={done}
	aria-label={label}
	class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
	style="border-color: {RING[effort]}; background: {done ? RING[effort] : 'transparent'}"
	onclick={ontoggle}
>
	{#if done}<Check size={14} strokeWidth={3.2} class="text-on-accent" />{/if}
</button>
