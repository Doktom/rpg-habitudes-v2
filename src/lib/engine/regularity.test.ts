import { describe, expect, it } from 'vitest';
import { addDays } from '../dates';
import { seed } from '../seed';
import type { AppData, Habit } from '../types';
import { habitStreak, habitWeekStreak, regularityRewards } from './regularity';

const MON = '2026-10-05'; // un lundi

const habit = (id: string, extra: Partial<Habit> = {}): Habit => ({
	id,
	name: id,
	form: 'simple',
	kind: 'obligatory',
	frequency: { type: 'daily' },
	tiers: { min: 'a', normal: 'b', excellent: 'c' },
	moment: 'day',
	difficulty: 'easy',
	domains: [{ domainId: 'bienetre', weight: 100 }],
	createdAt: MON,
	...extra
});

function world(habits: Habit[]): AppData {
	const d = seed(MON);
	d.habits = habits;
	d.danceClasses = [];
	return d;
}

const log = (d: AppData, habitId: string, date: string) => d.habitLogs.push({ id: `${habitId}-${date}`, habitId, date, tier: 'normal' });
const kinds = (d: AppData, date: string) => regularityRewards(d, date).map((r) => r.kind);

describe('régularité', () => {
	it('récompense une journée complète, parfaite si les bonus sont faits aussi', () => {
		const d = world([habit('lire'), habit('air', { kind: 'bonus' })]);
		expect(kinds(d, MON)).toEqual([]);
		log(d, 'lire', MON);
		const r = regularityRewards(d, MON).find((x) => x.kind === 'day')!;
		expect(r.label).toMatch(/complète/);
		log(d, 'air', MON);
		expect(regularityRewards(d, MON).find((x) => x.kind === 'day')!.label).toMatch(/parfaite/);
	});

	it('compte la série en sautant les jours de repos et sans casser le jour en cours', () => {
		const d = world([habit('lire')]);
		for (let i = 0; i < 5; i++) log(d, 'lire', addDays(MON, i));
		d.restDays.push(addDays(MON, 5));
		log(d, 'lire', addDays(MON, 6));
		expect(habitStreak(d, d.habits[0], addDays(MON, 6))).toBe(6);
		expect(habitStreak(d, d.habits[0], addDays(MON, 7))).toBe(6); // pas encore fait aujourd'hui
		log(d, 'lire', addDays(MON, 7));
		const r = regularityRewards(d, addDays(MON, 7));
		expect(r.some((x) => x.source === `reg:streak:lire:7:${addDays(MON, 7)}`)).toBe(true);
	});

	it('verse la semaine pleine une seule fois, le jour où elle se boucle', () => {
		const d = world([habit('lire')]);
		for (let i = 0; i < 7; i++) log(d, 'lire', addDays(MON, i));
		const sunday = addDays(MON, 6);
		expect(kinds(d, addDays(MON, 5))).not.toContain('habit-week');
		expect(kinds(d, sunday)).toContain('habit-week');
		expect(kinds(d, sunday)).toContain('week');
	});

	it("fait grandir la semaine pleine avec les semaines d'affilée", () => {
		const d = world([habit('salle', { frequency: { type: 'weekly', times: 2 } })]);
		for (let w = 0; w < 3; w++) {
			log(d, 'salle', addDays(MON, w * 7));
			log(d, 'salle', addDays(MON, w * 7 + 2));
		}
		const third = regularityRewards(d, addDays(MON, 16)).find((x) => x.kind === 'habit-week')!;
		expect(third.label).toMatch(/3 semaines/);
		expect(third.xp).toBe(50);
		expect(habitWeekStreak(d, d.habits[0], addDays(MON, 17))).toBe(3);
	});

	it("récompense une discipline quand toutes ses habitudes de la semaine sont tenues", () => {
		const sport = { domains: [{ domainId: 'sport', weight: 100 }] };
		const d = world([habit('salle', { ...sport, frequency: { type: 'weekly', times: 2 } }), habit('etirements', { ...sport, frequency: { type: 'days', days: [1, 3] } })]);
		log(d, 'salle', MON);
		log(d, 'etirements', MON);
		log(d, 'etirements', addDays(MON, 2));
		expect(kinds(d, addDays(MON, 2))).not.toContain('family-week');
		log(d, 'salle', addDays(MON, 3));
		expect(regularityRewards(d, addDays(MON, 3)).find((x) => x.kind === 'family-week')?.label).toBe('Semaine pleine en Sport');
	});
});
