<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';

	// Sélecteur à pilules : une seule option active, au clavier comme à la souris.
	let {
		options,
		value = $bindable(),
		label,
		size = 'sm',
		onchange
	}: {
		options: { value: T; label: string; icon?: Component<{ size?: number; strokeWidth?: number }> }[];
		value: T;
		label: string;
		size?: 'sm' | 'xs';
		onchange?: (v: T) => void;
	} = $props();

	function pick(v: T) {
		value = v;
		onchange?.(v);
	}
</script>

<div class="inline-flex max-w-full flex-wrap rounded-2xl border border-line bg-raised p-0.5" role="radiogroup" aria-label={label}>
	{#each options as o (o.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === o.value}
			class="flex items-center gap-1.5 rounded-xl font-bold transition-colors {size === 'xs' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} {value === o.value
				? 'bg-accent text-on-accent'
				: 'text-muted hover:text-ink'}"
			onclick={() => pick(o.value)}
		>
			{#if o.icon}<o.icon size={size === 'xs' ? 12 : 14} strokeWidth={2.4} />{/if}{o.label}
		</button>
	{/each}
</div>
