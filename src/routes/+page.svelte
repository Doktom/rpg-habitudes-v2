<script lang="ts">
	import {
		AudioLines,
		BedDouble,
		Check,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Feather,
		Flame,
		ListTodo,
		MoonStar,
		Orbit,
		Plus,
		Sunrise,
		SunMedium
	} from '@lucide/svelte';
	import Gauges from '#lib/components/Gauges.svelte';
	import LevelRing from '#lib/components/LevelRing.svelte';
	import LootLine from '#lib/components/LootLine.svelte';
	import OrbitRing from '#lib/components/OrbitRing.svelte';
	import TierButtons from '#lib/components/TierButtons.svelte';
	import { GAUGES } from '#lib/config.ts';
	import { addDays, formatLong, formatShort, today, weekday } from '#lib/dates.ts';
	import { discipline, gaugeValue, totalXp } from '#lib/engine/progress.ts';
	import { danceClassesOn, habitsForDay, logsInWeek, partiesOn, routineOn, tasksForDay } from '#lib/engine/schedule.ts';
	import { addLoot, orbit, orbitReward, sectorsLit } from '#lib/engine/ship.ts';
	import { levelInfo } from '#lib/engine/xp.ts';
	import { DANCE_LABEL, MOMENT_LABEL } from '#lib/labels.ts';
	import { store, uid } from '#lib/store.svelte.ts';
	import type { Habit, Loot, Moment } from '#lib/types.ts';
	import { SECTORS } from '#lib/universe.ts';

	let date = $state(today());
	const data = $derived(store.data);

	const isToday = $derived(date === today());
	const restDay = $derived(data.restDays.includes(date));
	const minimumMode = $derived(data.minimumModeDays.includes(date));
	const disc = $derived(discipline(data, date));
	const motivation = $derived(gaugeValue(data, 'motivation'));
	const inspiration = $derived(gaugeValue(data, 'inspiration'));
	const level = $derived(levelInfo(totalXp(data)));
	const xpDay = $derived(totalXp(data, date, date));
	const dayEvents = $derived(data.events.filter((e) => e.date === date && (e.xp?.length || e.loot)));
	// Butin gagné ce jour (les dépenses du chantier ne comptent pas).
	const dayLoot = $derived(
		dayEvents.reduce<Loot>((acc, e) => (e.loot && Object.values(e.loot).every((v) => (v ?? 0) >= 0) ? addLoot(acc, e.loot) : acc), {})
	);
	const sectors = $derived(orbit(data, date, today()));
	const sector = $derived(SECTORS[(weekday(date) + 6) % 7]);

	const habits = $derived(habitsForDay(data, date));
	const classes = $derived(danceClassesOn(data, date));
	const parties = $derived(partiesOn(data, date));
	// Les tâches de la semaine et du mois non planifiées s'affichent aussi dans la journée courante.
	const tasks = $derived(tasksForDay(data, date, today()));
	const tasksLeft = $derived(tasks.filter((t) => !t.done).length);

	const moments: Moment[] = ['morning', 'day', 'evening'];
	const MOMENT_ICON = { morning: Sunrise, day: SunMedium, evening: MoonStar } as const;

	// État local des routines et séances avant validation
	let checked = $state<Record<string, string[]>>({});
	let sessionPick = $state<Record<string, string>>({});
	let open = $state<Record<string, boolean>>({});
	let newTask = $state('');

	const logOf = (h: Habit) => data.habitLogs.find((l) => l.habitId === h.id && l.date === date);

	// Ce qu'une validation a rapporté, pour l'afficher sur la carte.
	function earned(source: string) {
		const e = data.events.find((x) => x.source === source);
		return e ? { xp: e.xp?.reduce((s, x) => s + x.amount, 0) ?? 0, loot: e.loot } : null;
	}

	function toggleExercise(habitId: string, exId: string) {
		const list = checked[habitId] ?? [];
		checked[habitId] = list.includes(exId) ? list.filter((x) => x !== exId) : [...list, exId];
	}

	function addTask() {
		if (!newTask.trim()) return;
		store.saveTask({ id: uid(), title: newTask.trim(), list: 'today', date });
		newTask = '';
	}
</script>

<!-- En-tête : la date, le secteur de l'orbite et le gain du jour -->
<header class="mb-5 flex flex-wrap items-end justify-between gap-4">
	<div class="min-w-0">
		<div class="eyebrow mb-1 flex items-center gap-1.5 text-accent">
			<Orbit size={13} strokeWidth={2.4} /> Secteur {sector.name} · jour {(weekday(date) + 6) % 7 + 1} sur 7
		</div>
		<div class="-ml-2 flex items-center gap-0.5">
			<button class="btn btn-ghost h-9 w-9 p-0" onclick={() => (date = addDays(date, -1))} aria-label="Jour précédent"><ChevronLeft size={20} /></button>
			<h1 class="text-2xl font-black tracking-tight capitalize sm:text-3xl">{formatLong(date)}</h1>
			<button class="btn btn-ghost h-9 w-9 p-0" onclick={() => (date = addDays(date, 1))} aria-label="Jour suivant"><ChevronRight size={20} /></button>
		</div>
		<p class="text-sm text-muted">{sector.lore}</p>
		{#if !isToday}<button class="btn mt-2 text-xs" onclick={() => (date = today())}>Revenir à aujourd'hui</button>{/if}
	</div>
	<div class="card flex items-center gap-3 px-3.5 py-2.5">
		<LevelRing level={level.level} into={level.into} needed={level.needed} size={56} />
		<div class="leading-tight">
			<div class="text-[11px] font-semibold text-muted">{isToday ? "Aujourd'hui" : 'Ce jour-là'}</div>
			<div class="text-xl font-black text-accent tabular-nums">+{xpDay} XP</div>
			<div class="text-xs"><LootLine loot={dayLoot} signed size={12} /></div>
		</div>
	</div>
</header>

<!-- Orbite et jauges -->
<div class="mb-4 grid gap-4 lg:grid-cols-5">
	<section class="card lg:col-span-3">
		<div class="mb-1 flex items-baseline justify-between gap-2">
			<h2 class="font-extrabold">Orbite de la semaine</h2>
			<a href="#/vaisseau" class="text-xs font-semibold text-accent hover:underline">Vaisseau</a>
		</div>
		<OrbitRing {sectors} current={date} />
		<p class="text-xs text-muted">
			<strong class="text-ink">{sectorsLit(sectors)}/7</strong> secteurs allumés · à l'amarrage du dimanche :
			<span class="text-ink"><LootLine loot={orbitReward(data, sectors)} signed size={11} /></span>
		</p>
	</section>
	<section class="card lg:col-span-2">
		<Gauges discipline={disc} {motivation} {inspiration} stacked />
	</section>
</div>

<!-- Réglages du jour -->
<div class="mb-6 flex flex-wrap items-center gap-2">
	<button class="btn text-xs {minimumMode ? 'border-accent bg-accent-soft' : ''}" aria-pressed={minimumMode} onclick={() => store.toggleMinimumMode(date)}>
		<Feather size={14} /> Mode minimum
	</button>
	<button class="btn text-xs {restDay ? 'border-accent bg-accent-soft' : ''}" aria-pressed={restDay} onclick={() => store.toggleRestDay(date)}>
		<BedDouble size={14} /> Jour de repos
	</button>
	{#if motivation < GAUGES.minimumModeBelow && !minimumMode && isToday}
		<p class="flex items-center gap-1.5 rounded-xl bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-800">
			<Flame size={14} /> Réacteur faible : le mode minimum préserve ta Discipline.
		</p>
	{/if}
	{#if restDay}
		<p class="rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-800">Jour de repos : rien n'est compté comme raté.</p>
	{/if}
</div>

<!-- Routines du jour, par moment -->
{#each moments as moment (moment)}
	{@const items = habits.filter((h) => h.moment === moment)}
	{@const danceHere = moment === 'evening'}
	{@const MomentIcon = MOMENT_ICON[moment]}
	{#if items.length || (danceHere && (classes.length || parties.length))}
		<section class="mb-6">
			<h2 class="mb-2 flex items-center gap-2 px-1">
				<MomentIcon size={16} class="text-accent" strokeWidth={2.3} />
				<span class="eyebrow">{MOMENT_LABEL[moment]}</span>
				<span class="text-[11px] font-bold text-muted">{items.filter((h) => logOf(h)).length}/{items.length}</span>
			</h2>
			<div class="flex flex-col gap-2.5">
				{#each items as h (h.id)}
					{@const log = logOf(h)}
					{@const gain = log ? earned(`habit:${log.id}`) : null}
					{@const routine = h.form === 'routine' ? routineOn(h, date) : undefined}
					<div class="card p-3.5 transition-colors {log ? 'border-done/40 bg-done-soft' : ''}">
						<div class="flex flex-wrap items-center gap-3">
							<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors {log ? 'bg-done text-on-accent' : 'bg-accent-soft text-accent'}">
								{#if log}<Check size={20} strokeWidth={3} />{:else}<MomentIcon size={19} strokeWidth={2.2} />{/if}
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-1.5 font-bold">
									{h.name}
									{#if h.kind === 'bonus'}<span class="chip bg-amber-100 text-amber-800">bonus</span>{/if}
								</div>
								<div class="truncate text-xs text-muted">
									{#if h.frequency.type === 'weekly'}
										{logsInWeek(data, h.id, date).length}/{h.frequency.times} cette semaine ·
									{/if}
									{log ? h.tiers[log.tier] : minimumMode ? h.tiers.min : h.tiers.normal}
									{#if log?.session}· {log.session}{/if}
								</div>
								{#if gain}
									<div class="mt-0.5 flex items-center gap-2 text-xs font-bold text-done">+{gain.xp} XP <LootLine loot={gain.loot} signed size={11} /></div>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								{#if h.form === 'program' && !log}
									<select class="input w-auto py-1 text-xs" bind:value={sessionPick[h.id]} aria-label="Séance">
										<option value={undefined}>Séance…</option>
										{#each h.sessions ?? [] as s (s)}<option value={s}>{s}</option>{/each}
									</select>
								{/if}
								<TierButtons
									current={log?.tier}
									minimumOnly={minimumMode && !log}
									titles={h.tiers}
									onpick={(t) =>
										store.logHabit(h, date, t, {
											session: sessionPick[h.id],
											doneExercises: checked[h.id]
										})}
									onclear={() => log && store.unlog(log.id)}
								/>
							</div>
						</div>
						{#if routine}
							<button class="mt-2 ml-13 flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink" aria-expanded={!!open[h.id]} onclick={() => (open[h.id] = !open[h.id])}>
								<ChevronDown size={14} class="transition-transform {open[h.id] ? 'rotate-180' : ''}" />
								Exercices ({routine.exercises.length})
							</button>
							{#if open[h.id]}
								{#if routine.exercises.length === 0}
									<p class="mt-2 ml-13 text-xs text-muted">
										Aucun exercice pour l'instant : ajoute-les dans <a class="font-semibold text-accent hover:underline" href="#/habitudes">Habitudes</a>.
									</p>
								{:else}
									<ul class="mt-2 ml-13 flex flex-col gap-1.5">
										{#each routine.exercises as ex (ex.id)}
											<li>
												<label class="flex items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={(log?.doneExercises ?? checked[h.id] ?? []).includes(ex.id)}
														disabled={!!log}
														onchange={() => toggleExercise(h.id, ex.id)}
													/>
													{ex.name}
													{#if ex.detail}<span class="text-xs text-muted">{ex.detail}</span>{/if}
												</label>
											</li>
										{/each}
									</ul>
								{/if}
							{/if}
						{/if}
					</div>
				{/each}

				{#if danceHere}
					{#each classes as c (c.id)}
						{@const log = data.danceLogs.find((l) => l.refId === c.id && l.date === date)}
						{@const gain = log ? earned(`dance:${log.id}`) : null}
						<div class="card flex flex-wrap items-center gap-3 p-3.5 transition-colors {log ? 'border-done/40 bg-done-soft' : ''}">
							<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {log ? 'bg-done text-on-accent' : 'bg-pink-100 text-pink-700'}">
								{#if log}<Check size={20} strokeWidth={3} />{:else}<AudioLines size={19} />{/if}
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-1.5 font-bold">
									Cours de {DANCE_LABEL[c.style]}
									{#if c.kind === 'bonus'}<span class="chip bg-amber-100 text-amber-800">bonus</span>{/if}
								</div>
								<div class="text-xs text-muted">{c.time} · {c.durationMin} min{c.place ? ' · ' + c.place : ''}</div>
								{#if gain}<div class="mt-0.5 flex items-center gap-2 text-xs font-bold text-done">+{gain.xp} XP <LootLine loot={gain.loot} signed size={11} /></div>{/if}
							</div>
							<TierButtons
								current={log?.tier}
								onpick={(t) => store.logDance(c.id, `Cours de ${DANCE_LABEL[c.style]}`, [c.style], c.kind, date, t)}
								onclear={() => log && store.unlogDance(log.id)}
							/>
						</div>
					{/each}
					{#each parties as p (p.id)}
						{@const log = data.danceLogs.find((l) => l.refId === p.id && l.date === date)}
						{@const gain = log ? earned(`dance:${log.id}`) : null}
						<div class="card flex flex-wrap items-center gap-3 p-3.5 transition-colors {log ? 'border-done/40 bg-done-soft' : ''}">
							<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {log ? 'bg-done text-on-accent' : 'bg-fuchsia-100 text-fuchsia-700'}">
								{#if log}<Check size={20} strokeWidth={3} />{:else}<AudioLines size={19} />{/if}
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-1.5 font-bold">
									Soirée {p.styles.map((s) => DANCE_LABEL[s]).join(' / ')}
									<span class="chip bg-amber-100 text-amber-800">bonus</span>
								</div>
								<div class="text-xs text-muted">{p.time}{p.place ? ' · ' + p.place : ''}{p.note ? ' · ' + p.note : ''}</div>
								{#if gain}<div class="mt-0.5 flex items-center gap-2 text-xs font-bold text-done">+{gain.xp} XP <LootLine loot={gain.loot} signed size={11} /></div>{/if}
							</div>
							<TierButtons
								current={log?.tier}
								onpick={(t) => store.logDance(p.id, 'Soirée de danse', p.styles, 'bonus', date, t)}
								onclear={() => log && store.unlogDance(log.id)}
							/>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	{/if}
{/each}

{#if !habits.length && !classes.length && !parties.length}
	<div class="card mb-6 text-center">
		<p class="font-bold">Rien de prévu dans ce secteur</p>
		<p class="text-sm text-muted">Profite du calme, ou crée tes routines dans <a class="font-semibold text-accent hover:underline" href="#/habitudes">Habitudes</a>.</p>
	</div>
{/if}

<!-- Todo du jour -->
<section class="mb-6">
	<h2 class="mb-2 flex items-center gap-2 px-1">
		<ListTodo size={16} class="text-accent" strokeWidth={2.3} />
		<span class="eyebrow">À faire</span>
		<span class="text-[11px] font-bold text-muted">{tasksLeft} restante{tasksLeft > 1 ? 's' : ''}</span>
	</h2>
	<div class="card p-2">
		{#each tasks as t (t.id)}
			<label class="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-raised">
				<input type="checkbox" checked={!!t.done} onchange={() => store.toggleTask(t)} />
				<span class="min-w-0 flex-1 font-semibold {t.done ? 'text-muted line-through' : ''}">{t.title}</span>
				{#if !t.done && !t.date && t.list === 'week'}<span class="chip bg-sky-100 text-sky-800">semaine</span>{/if}
				{#if !t.done && !t.date && t.list === 'month'}<span class="chip bg-violet-100 text-violet-800">mois</span>{/if}
				{#if !t.done && t.date && t.date < date}<span class="chip bg-orange-100 text-orange-800">reportée</span>{/if}
				{#if !t.done && t.due}<span class="chip {t.due < date ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-muted'}">échéance {formatShort(t.due)}</span>{/if}
				{#if t.subtasks?.length}<span class="text-[11px] font-bold text-muted">{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span>{/if}
				{#if t.start}<span class="text-xs text-muted">{t.start}</span>{/if}
			</label>
		{:else}
			<p class="px-2.5 py-2 text-sm text-muted">Aucune tâche pour ce jour.</p>
		{/each}
		<form class="mt-1 flex gap-2 p-1" onsubmit={(e) => (e.preventDefault(), addTask())}>
			<input class="input" placeholder="Ajouter une tâche…" bind:value={newTask} aria-label="Nouvelle tâche" />
			<button class="btn btn-primary shrink-0" aria-label="Ajouter"><Plus size={16} strokeWidth={2.6} /></button>
		</form>
		<div class="px-2.5 pt-1 pb-1.5 text-right">
			<a href="#/taches" class="text-xs font-semibold text-accent hover:underline">Détailler et organiser mes tâches</a>
		</div>
	</div>
</section>

<!-- Journal de bord du jour -->
{#if dayEvents.length}
	<section>
		<h2 class="eyebrow mb-2 px-1">Journal de bord</h2>
		<ul class="card flex flex-col divide-y divide-line p-0 text-sm">
			{#each dayEvents as e (e.id)}
				<li class="flex items-center justify-between gap-3 px-4 py-2.5">
					<span class="min-w-0">{e.label}</span>
					<span class="flex shrink-0 items-center gap-2 text-xs font-bold text-muted">
						{#if e.xp?.length}<span class="text-accent">+{e.xp.reduce((s, x) => s + x.amount, 0)} XP</span>{/if}
						<LootLine loot={e.loot} signed size={11} />
					</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}
