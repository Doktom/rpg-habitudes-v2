import { describe, expect, it } from 'vitest';
import { addDays } from '../dates';
import { seed } from '../seed';
import type { AppData, Habit } from '../types';
import { habitStreak } from './regularity';
import { shieldState, streaksAtRisk } from './shields';

const MON = '2026-10-05';

const lire: Habit = {
	id: 'lire',
	name: 'Lire',
	form: 'simple',
	kind: 'obligatory',
	frequency: { type: 'daily' },
	tiers: { min: 'a', normal: 'b', excellent: 'c' },
	moment: 'day',
	difficulty: 'easy',
	domains: [{ domainId: 'bienetre', weight: 100 }],
	createdAt: MON
};

function world(): AppData {
	const d = seed(MON);
	d.habits = [lire];
	d.danceClasses = [];
	return d;
}

const completeDay = (d: AppData, date: string) =>
	d.events.push({ id: date, at: date, date, source: `reg:day:${date}`, label: 'Journée complète' });

describe('boucliers de série', () => {
	it('se gagnent toutes les 7 journées complètes, sans dépasser la réserve', () => {
		const d = world();
		for (let i = 0; i < 6; i++) completeDay(d, addDays(MON, i));
		expect(shieldState(d)).toEqual({ stock: 0, max: 2, progress: 6 });
		completeDay(d, addDays(MON, 6));
		expect(shieldState(d).stock).toBe(1);
		for (let i = 7; i < 30; i++) completeDay(d, addDays(MON, i));
		expect(shieldState(d)).toEqual({ stock: 2, max: 2, progress: 0 });
	});

	it("s'achètent et se dépensent", () => {
		const d = world();
		d.events.push({ id: 'b', at: MON, date: MON, source: 'shield:buy:x', label: 'achat', loot: { energy: -6 } });
		expect(shieldState(d).stock).toBe(1);
		d.shieldedDays.push(addDays(MON, 1));
		expect(shieldState(d).stock).toBe(0);
		expect(shieldState(d, MON).stock).toBe(1);
	});

	it("protègent une série d'au moins 3 jours, qui continue ensuite", () => {
		const d = world();
		const log = (i: number) => d.habitLogs.push({ id: `l${i}`, habitId: 'lire', date: addDays(MON, i), tier: 'normal' });
		[0, 1].forEach(log);
		expect(streaksAtRisk(d, addDays(MON, 2))).toEqual([]); // série de 2 : pas la peine
		log(2);
		expect(streaksAtRisk(d, addDays(MON, 3)).map((r) => r.streak)).toEqual([3]);
		d.shieldedDays.push(addDays(MON, 3));
		log(4);
		expect(habitStreak(d, lire, addDays(MON, 4))).toBe(4);
	});
});
