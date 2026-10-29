<script lang="ts">
	import { Sparkles } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import LootLine from '#lib/components/LootLine.svelte';
	import { toasts } from '#lib/toasts.svelte.ts';
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5rem)] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
	aria-live="polite"
>
	{#each toasts.items as t (t.id)}
		<div
			class="pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm"
			style="box-shadow: 0 16px 40px -16px var(--shadow)"
			transition:fly={{ y: 16, duration: 220 }}
		>
			<span class="flex h-7 w-7 items-center justify-center rounded-full bg-reward-soft text-reward"><Sparkles size={15} strokeWidth={2.4} /></span>
			<span class="font-bold">{t.title}</span>
			{#if t.xp}<span class="font-black text-accent">+{t.xp} XP</span>{/if}
			<span class="text-xs"><LootLine loot={t.loot} signed size={12} /></span>
		</div>
	{/each}
</div>
