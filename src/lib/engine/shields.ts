// Boucliers de série : gagnés avec les journées complètes (ou achetés), dépensés seuls à la clôture
// d'un jour raté qui casserait une série. Le jour protégé ne compte pas comme fait : pas d'XP,
// et la Discipline comme la Motivation voient le raté. Seules les séries et les semaines pleines sont sauves.
import { SHIELD } from '../config';
import { addDays } from '../dates';
import type { AppData, Habit, ISODate } from '../types';
import { moduleLevel } from './effects';
import { habitStreak } from './regularity';
import { isDueOn, isRestDay } from './schedule';

export function shieldMax(data: AppData): number {
	return SHIELD.maxBase + Math.floor(moduleLevel(data, 'hull') / SHIELD.hullLevelsPerSlot);
}

// Réserve rejouée dans l'ordre : gains (toutes les 7 journées complètes, sans dépasser la réserve), achats, usages.
// Renvoie aussi l'avancement vers le prochain gain.
export function shieldState(data: AppData, upTo?: ISODate): { stock: number; max: number; progress: number } {
	const max = shieldMax(data);
	type Step = { date: ISODate; order: number; kind: 'day' | 'buy' | 'use' };
	const steps: Step[] = [];
	for (const e of data.events) {
		if (upTo && e.date > upTo) continue;
		if (e.source.startsWith('reg:day:')) steps.push({ date: e.date, order: 0, kind: 'day' });
		else if (e.source.startsWith('shield:buy:')) steps.push({ date: e.date, order: 1, kind: 'buy' });
	}
	for (const d of data.shieldedDays) if (!upTo || d <= upTo) steps.push({ date: d, order: 2, kind: 'use' });
	steps.sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);

	let stock = 0;
	let progress = 0;
	for (const s of steps) {
		if (s.kind === 'use') stock = Math.max(0, stock - 1);
		else if (s.kind === 'buy') stock = Math.min(max, stock + 1);
		else if (stock < max && ++progress >= SHIELD.earnEvery) {
			stock++;
			progress = 0;
		}
	}
	return { stock, max, progress: stock >= max ? 0 : progress };
}

// Les séries qu'un jour raté casserait (habitudes dues, pas faites, avec une série d'au moins 3 jours la veille).
export function streaksAtRisk(data: AppData, date: ISODate): { habit: Habit; streak: number }[] {
	if (isRestDay(data, date) || data.shieldedDays.includes(date)) return [];
	const out: { habit: Habit; streak: number }[] = [];
	for (const h of data.habits) {
		if (h.frequency.type === 'weekly' || !isDueOn(h, date)) continue;
		if (data.habitLogs.some((l) => l.habitId === h.id && l.date === date)) continue;
		const streak = habitStreak(data, h, addDays(date, -1));
		if (streak >= SHIELD.minStreak) out.push({ habit: h, streak });
	}
	return out;
}
