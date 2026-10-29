<script lang="ts">
	import { Moon, Sun, SunMoon } from '@lucide/svelte';
	import { theme, type ThemePref } from '#lib/theme.svelte.ts';

	const options: { id: ThemePref; label: string; icon: typeof Moon }[] = [
		{ id: 'dark', label: 'Nuit douce', icon: Moon },
		{ id: 'light', label: 'Aube orbitale', icon: Sun },
		{ id: 'auto', label: 'Automatique', icon: SunMoon }
	];
</script>

<div class="inline-flex rounded-full border border-line bg-raised p-0.5" role="radiogroup" aria-label="Thème">
	{#each options as o (o.id)}
		<button
			role="radio"
			aria-checked={theme.pref === o.id}
			title={o.label}
			aria-label={o.label}
			class="flex h-7 w-9 items-center justify-center rounded-full transition-colors {theme.pref === o.id
				? 'bg-accent text-on-accent'
				: 'text-muted hover:text-ink'}"
			onclick={() => theme.set(o.id)}
		>
			<o.icon size={15} strokeWidth={2.2} />
		</button>
	{/each}
</div>
