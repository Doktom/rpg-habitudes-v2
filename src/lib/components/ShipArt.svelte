<script lang="ts">
	import { MODULE_MAX_LEVEL } from '#lib/config.ts';
	import type { ModuleId } from '#lib/types.ts';

	// Le Sillage dessiné en SVG ; chaque module a une partie visible qui évolue avec son niveau :
	// Réacteur = cœur lumineux, Coque = blindage (fissurée au niveau 0), Propulseurs = flamme, Antenne = mât.
	let { levels, highlight }: { levels: Record<ModuleId, number>; highlight?: ModuleId | null } = $props();

	const r = $derived(levels.reactor);
	const h = $derived(levels.hull);
	const t = $derived(levels.thrusters);
	const a = $derived(levels.antenna);
	const flame = $derived(14 + 11 * t);
	const mast = $derived(a === 0 ? 7 : 12 + 7 * a);
	const glow = (id: ModuleId) => (highlight === id ? 'ship-flash' : '');
</script>

<svg viewBox="0 0 360 170" class="w-full" role="img" aria-label="Le Sillage : réacteur niveau {r}, coque niveau {h}, propulseurs niveau {t}, antenne niveau {a}">
	<g class="ship-float">
		<!-- Propulseurs -->
		<g class={glow('thrusters')}>
			{#if t > 0}
				<path d="M 100 82 Q {100 - flame * 0.55} 84 {100 - flame} 92 Q {100 - flame * 0.55} 100 100 102 Z" fill="var(--reward)" fill-opacity="0.85" class="ship-flame" />
				<path d="M 100 87 Q {100 - flame * 0.35} 88 {100 - flame * 0.6} 92 Q {100 - flame * 0.35} 96 100 97 Z" fill="var(--surface)" fill-opacity="0.75" class="ship-flame" />
			{/if}
			<rect x="98" y="80" width="16" height="24" rx="5" fill="var(--n-300)" stroke="var(--muted)" stroke-opacity="0.5" />
		</g>

		<!-- Ailerons -->
		<path d="M 150 68 L 172 30 Q 178 26 184 32 L 206 64 Z" fill="var(--accent-soft)" stroke="var(--muted)" stroke-opacity="0.45" stroke-width="1.2" />
		<path d="M 150 116 L 172 154 Q 178 158 184 152 L 206 120 Z" fill="var(--accent-soft)" stroke="var(--muted)" stroke-opacity="0.45" stroke-width="1.2" />

		<!-- Antenne -->
		<g class={glow('antenna')}>
			<line x1="226" y1="66" x2={a === 0 ? 230 : 226} y2={66 - mast} stroke="var(--muted)" stroke-width="2" stroke-linecap="round" />
			{#if a > 0}
				<path d="M {218} {62 - mast} Q 226 {70 - mast} {234} {62 - mast}" fill="none" stroke="var(--g-inspiration)" stroke-width="2.2" stroke-linecap="round" />
				<circle cx="226" cy={64 - mast} r="2.2" fill="var(--g-inspiration)" />
				{#each Array(Math.min(3, a - 1)) as _, i (i)}
					<path
						d="M {214 - 5 * i} {54 - mast - 4 * i} Q 226 {44 - mast - 7 * i} {238 + 5 * i} {54 - mast - 4 * i}"
						fill="none"
						stroke="var(--g-inspiration)"
						stroke-opacity={0.5 - 0.12 * i}
						stroke-width="1.4"
						stroke-linecap="round"
						class="ship-signal"
						style="animation-delay: {i * 0.4}s"
					/>
				{/each}
			{:else}
				<circle cx="231" cy="57" r="1.6" fill="var(--reward)" class="ship-spark" />
			{/if}
		</g>

		<!-- Coque -->
		<g class={glow('hull')}>
			<path
				d="M 112 92 C 112 64 160 58 228 64 C 268 68 300 80 314 92 C 300 104 268 116 228 120 C 160 126 112 120 112 92 Z"
				fill="var(--surface)"
				stroke="var(--muted)"
				stroke-opacity={0.55 + 0.08 * h}
				stroke-width={1.4 + 0.35 * h}
			/>
			{#each Array(h) as _, i (i)}
				<path d="M {136 + i * 17} {69 - i * 0.6} Q {143 + i * 17} 92 {136 + i * 17} {115 + i * 0.6}" fill="none" stroke="var(--accent)" stroke-opacity="0.35" stroke-width="1.3" />
			{/each}
			{#if h === 0}
				<path d="M 246 70 L 240 80 L 248 86 L 241 96" fill="none" stroke="var(--reward)" stroke-opacity="0.8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
			{/if}
		</g>

		<!-- Hublot du cockpit -->
		<ellipse cx="282" cy="88" rx="15" ry="8.5" fill="var(--accent)" fill-opacity="0.55" />
		<ellipse cx="278" cy="85.5" rx="5" ry="2.2" fill="var(--surface)" fill-opacity="0.7" />

		<!-- Réacteur -->
		<g class={glow('reactor')}>
			{#each Array(r) as _, i (i)}
				<circle cx="190" cy="92" r={15 + 5 * (i + 1)} fill="var(--accent)" fill-opacity={0.13 - 0.02 * i} />
			{/each}
			<circle cx="190" cy="92" r="14" fill={r ? 'var(--accent)' : 'var(--line)'} fill-opacity={r ? 0.45 + (0.55 * r) / MODULE_MAX_LEVEL : 1} class={r ? 'ship-core' : ''} />
			<circle cx="190" cy="92" r="6" fill="var(--surface)" fill-opacity={r ? 0.85 : 0.4} />
		</g>
	</g>
</svg>

<style>
	.ship-float {
		animation: float 7s ease-in-out infinite;
	}
	.ship-flame {
		transform-box: fill-box;
		transform-origin: right center;
		animation: flicker 0.9s ease-in-out infinite alternate;
	}
	.ship-core {
		transform-box: fill-box;
		transform-origin: center;
		animation: breathe 3.2s ease-in-out infinite;
	}
	.ship-signal {
		animation: signal 2.4s ease-in-out infinite;
	}
	.ship-spark {
		animation: signal 1.3s steps(2) infinite;
	}
	.ship-flash {
		animation: flash 1.2s ease-out;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}
	@keyframes flicker {
		from {
			transform: scaleX(0.88);
		}
		to {
			transform: scaleX(1.06);
		}
	}
	@keyframes breathe {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
	}
	@keyframes signal {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes flash {
		0% {
			filter: drop-shadow(0 0 0 transparent);
		}
		30% {
			filter: drop-shadow(0 0 10px var(--accent));
		}
		100% {
			filter: drop-shadow(0 0 0 transparent);
		}
	}
</style>
