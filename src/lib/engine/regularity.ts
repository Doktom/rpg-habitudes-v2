// Récompenses de régularité : journée complète, séries d'une habitude, semaines pleines.
// Tout est recalculé depuis les journaux : une récompense disparaît si on décoche ce qui l'a déclenchée.
import { REGULARITY } from '../config';
import { addDays, range, startOfWeek } from '../dates';
import type { AppData, DanceClass, DomainShare, Habit, ISODate, Loot } from '../types';
import { obligationsOn } from './progress';
import { danceClassesOn, isActiveOn, isDueOn, isRestDay, logsInWeek } from './schedule';

export interface RegularityReward {
	source: string; // toujours préfixé par « reg: »
	kind: 'day' | 'streak' | 'habit-week' | 'family-week' | 'week';
	label: string;
	xp: number;
	shares: DomainShare[];
	loot: Loot;
}

// Jour qui ne compte pas pour les séries : repos, ou raté protégé par un bouclier.
const skipped = (data: AppData, date: ISODate) => isRestDay(data, date) || data.shieldedDays.includes(date);
const logged = (data: AppData, habitId: string, date: ISODate) => data.habitLogs.some((l) => l.habitId === habitId && l.date === date);
const danced = (data: AppData, classId: string, date: ISODate) => data.danceLogs.some((l) => l.refId === classId && l.date === date);

// Ce que contient une semaine pour un ensemble d'habitudes et de cours : combien était attendu,
// et si tout est fait en date du jour donné (rien d'attendu ne reste après lui).
interface WeekItems {
	habits: Habit[];
	classes: DanceClass[];
}

function weekStatus(data: AppData, items: WeekItems, monday: ISODate, asOf: ISODate): { expected: number; complete: boolean } {
	let expected = 0;
	let complete = true;
	const days = range(monday, addDays(monday, 6));
	for (const h of items.habits) {
		if (h.frequency.type === 'weekly') {
			if (!isActiveOn(h, monday)) continue;
			expected += h.frequency.times;
			const count = logsInWeek(data, h.id, monday).filter((l) => l.date <= asOf).length;
			if (count < h.frequency.times) complete = false;
			continue;
		}
		for (const d of days) {
			if (!isDueOn(h, d) || skipped(data, d)) continue;
			expected++;
			if (d > asOf || !logged(data, h.id, d)) complete = false;
		}
	}
	for (const c of items.classes) {
		for (const d of days) {
			if (skipped(data, d) || !danceClassesOn(data, d).some((x) => x.id === c.id)) continue;
			expected++;
			if (d > asOf || !danced(data, c.id, d)) complete = false;
		}
	}
	return { expected, complete: complete && expected > 0 };
}

// Vrai seulement le jour où la semaine devient complète : la récompense tombe une fois, au bon moment.
function completesOn(data: AppData, items: WeekItems, date: ISODate, minItems = 1): boolean {
	const monday = startOfWeek(date);
	const now = weekStatus(data, items, monday, date);
	if (!now.complete || now.expected < minItems) return false;
	return date === monday || !weekStatus(data, items, monday, addDays(date, -1)).complete;
}

// Semaines pleines d'affilée qui se terminent par celle qui contient la date.
function weeksInARow(data: AppData, items: WeekItems, date: ISODate, minItems: number): number {
	let n = 1;
	for (let monday = addDays(startOfWeek(date), -7); n < 104; monday = addDays(monday, -7)) {
		const s = weekStatus(data, items, monday, addDays(monday, 6));
		if (!s.complete || s.expected < minItems) break;
		n++;
	}
	return n;
}

// Série en cours d'une habitude quotidienne ou à jours fixes : jours dus consécutifs tenus, jusqu'à la date.
// Les jours de repos et les jours non dus ne cassent pas la série. Le jour même ne la casse pas s'il n'est pas encore fait.
export function habitStreak(data: AppData, habit: Habit, asOf: ISODate): number {
	if (habit.frequency.type === 'weekly') return 0;
	let streak = 0;
	for (let d = asOf, i = 0; d >= habit.createdAt && i < 400; d = addDays(d, -1), i++) {
		if (!isDueOn(habit, d)) continue;
		if (logged(data, habit.id, d)) streak++;
		else if (skipped(data, d)) continue;
		else if (d !== asOf) break;
	}
	return streak;
}

// Semaines d'affilée tenues pour une habitude « X fois par semaine » (la semaine en cours compte si elle est déjà tenue).
export function habitWeekStreak(data: AppData, habit: Habit, asOf: ISODate): number {
	const items = { habits: [habit], classes: [] };
	const current = weekStatus(data, items, startOfWeek(asOf), asOf).complete;
	let n = current ? 1 : 0;
	for (let monday = addDays(startOfWeek(asOf), -7); n < 104; monday = addDays(monday, -7)) {
		if (!weekStatus(data, items, monday, addDays(monday, 6)).complete) break;
		n++;
	}
	return n;
}

// Prochain palier de série, pour l'afficher (« encore 3 jours pour la série de 7 »).
export function nextMilestone(streak: number) {
	return REGULARITY.streakMilestones.find((m) => m.days > streak);
}

const topDomain = (data: AppData, id: string) => {
	const d = data.domains.find((x) => x.id === id);
	return d?.parentId ?? d?.id ?? id;
};

// Disciplines : les catégories de premier niveau, avec leurs habitudes et (pour la danse) leurs cours.
function families(data: AppData): { domainId: string; name: string; items: WeekItems }[] {
	return data.domains
		.filter((d) => !d.parentId)
		.map((d) => ({
			domainId: d.id,
			name: d.name,
			items: {
				habits: data.habits.filter((h) => !h.archived && h.domains.some((s) => topDomain(data, s.domainId) === d.id)),
				classes: data.danceClasses.filter((c) => topDomain(data, c.style) === d.id)
			}
		}));
}

function dayShares(data: AppData, date: ISODate): DomainShare[] {
	const shares: DomainShare[] = [];
	for (const h of data.habits) if (logged(data, h.id, date)) shares.push(...h.domains);
	for (const l of data.danceLogs) {
		const c = data.danceClasses.find((x) => x.id === l.refId);
		if (l.date === date && c) shares.push({ domainId: c.style, weight: 100 });
	}
	return shares;
}

// Toutes les récompenses de régularité gagnées ce jour-là.
export function regularityRewards(data: AppData, date: ISODate): RegularityReward[] {
	const out: RegularityReward[] = [];
	const R = REGULARITY;
	if (isRestDay(data, date)) return out;

	// Journée complète / parfaite
	const { expected, done } = obligationsOn(data, date);
	if (expected > 0 && done === expected) {
		const bonus = data.habits.filter((h) => h.kind === 'bonus' && isDueOn(h, date));
		const perfect = bonus.length > 0 && bonus.every((h) => logged(data, h.id, date));
		const r = perfect ? R.dayPerfect : R.dayComplete;
		out.push({
			source: `reg:day:${date}`,
			kind: 'day',
			label: perfect ? 'Journée parfaite' : 'Journée complète',
			xp: r.xp,
			shares: dayShares(data, date),
			loot: r.loot
		});
	}

	for (const h of data.habits) {
		if (!isActiveOn(h, date)) continue;
		// Paliers de série (le jour où on les atteint)
		if (h.frequency.type !== 'weekly' && isDueOn(h, date) && logged(data, h.id, date)) {
			const streak = habitStreak(data, h, date);
			const m = R.streakMilestones.find((x) => x.days === streak);
			if (m)
				out.push({
					source: `reg:streak:${h.id}:${m.days}:${date}`,
					kind: 'streak',
					label: `Série de ${m.days} jours : ${h.name}`,
					xp: m.xp,
					shares: h.domains,
					loot: m.loot
				});
		}
		// Semaine pleine de l'habitude
		const items = { habits: [h], classes: [] };
		if (completesOn(data, items, date, R.habitWeekMinItems)) {
			const n = weeksInARow(data, items, date, R.habitWeekMinItems);
			const milestone = (R.habitWeekMilestones as readonly number[]).includes(n);
			out.push({
				source: `reg:hweek:${h.id}:${startOfWeek(date)}`,
				kind: 'habit-week',
				label: `Semaine pleine : ${h.name}${n > 1 ? ` (${n} semaines d'affilée)` : ''}`,
				xp: R.habitWeek.xp + R.habitWeek.perStreakWeek * Math.min(n - 1, R.habitWeek.maxStreakBonus),
				shares: h.domains,
				loot: milestone ? { ...R.habitWeek.loot, crystal: 1 } : R.habitWeek.loot
			});
		}
	}

	// Semaine pleine d'une discipline : seulement si elle regroupe plusieurs habitudes ou cours.
	for (const f of families(data)) {
		if (f.items.habits.length + f.items.classes.length < 2) continue;
		if (!completesOn(data, f.items, date, R.familyWeek.minItems)) continue;
		out.push({
			source: `reg:fweek:${f.domainId}:${startOfWeek(date)}`,
			kind: 'family-week',
			label: `Semaine pleine en ${f.name}`,
			xp: R.familyWeek.xp,
			shares: [{ domainId: f.domainId, weight: 100 }],
			loot: R.familyWeek.loot
		});
	}

	// Semaine sans faille : toutes les obligations
	const obligations = {
		habits: data.habits.filter((h) => h.kind === 'obligatory' && !h.archived),
		classes: data.danceClasses.filter((c) => c.kind === 'obligatory')
	};
	if (completesOn(data, obligations, date, 3)) {
		out.push({
			source: `reg:week:${startOfWeek(date)}`,
			kind: 'week',
			label: 'Semaine sans faille',
			xp: R.weekComplete.xp,
			shares: obligations.habits.flatMap((h) => h.domains),
			loot: R.weekComplete.loot
		});
	}
	return out;
}

// Avancement de la semaine pour une habitude : fait / attendu, pour les petites barres de l'écran.
export function habitWeekProgress(data: AppData, habit: Habit, date: ISODate): { done: number; expected: number } {
	const monday = startOfWeek(date);
	if (habit.frequency.type === 'weekly') return { done: logsInWeek(data, habit.id, monday).length, expected: habit.frequency.times };
	let done = 0;
	let expected = 0;
	for (const d of range(monday, addDays(monday, 6))) {
		if (!isDueOn(habit, d) || skipped(data, d)) continue;
		expected++;
		if (logged(data, habit.id, d)) done++;
	}
	return { done, expected };
}

export type DayMark = 'done' | 'missed' | 'todo' | 'later' | 'off' | 'shield';

// Les sept jours de la semaine d'une habitude : fait, raté, à faire ou non dû (repos compris).
export function habitWeekDays(data: AppData, habit: Habit, date: ISODate, asOf: ISODate): DayMark[] {
	const monday = startOfWeek(date);
	return range(monday, addDays(monday, 6)).map((d) => {
		if (logged(data, habit.id, d)) return 'done';
		const due = habit.frequency.type !== 'weekly' && isDueOn(habit, d);
		if (due && data.shieldedDays.includes(d)) return 'shield';
		if (!due || isRestDay(data, d)) return 'off';
		return d < asOf ? 'missed' : d === asOf ? 'todo' : 'later';
	});
}
