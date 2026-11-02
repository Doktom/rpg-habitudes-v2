// Constantes de jeu, à calibrer après 2-3 semaines d'usage réel.
import type { Difficulty, Loot } from './types';

export const XP_BASE = { easy: 10, medium: 20, hard: 40 } as const;
export const TIER_FACTOR = { min: 0.5, normal: 1, excellent: 1.5 } as const;

export const XP_REWARDS = {
	chapter: 300,
	campaign: 1000,
	weeklyReview: 50,
	monthlyReview: 150
} as const;

// Butin de base par difficulté (× facteur du palier). Alliage = tout, Cellules = effort moyen, Cristaux = rare.
export const LOOT_BASE: Record<Difficulty, Loot> = {
	easy: { metal: 2 },
	medium: { metal: 2, energy: 1 },
	hard: { metal: 3, energy: 2, crystal: 1 }
};

export const LOOT_REWARDS: Record<string, Loot> = {
	quest: { metal: 2, energy: 2 },
	boss: { energy: 2, crystal: 2 },
	chapter: { crystal: 3 },
	campaign: { crystal: 10 },
	weeklyReview: { energy: 3 },
	monthlyReview: { energy: 5, crystal: 1 },
	orbitSector: { metal: 4 }, // par secteur allumé (un secteur à moitié compte pour 0,5), versé à l'amarrage (revue hebdo)
	orbitPerfect: { crystal: 3 } // 7 secteurs sur 7
};

// Récompenses de régularité (XP de base avant Discipline et bonus du vaisseau).
export const REGULARITY = {
	// Journée complète : toutes les obligations faites ; parfaite : les bonus du jour aussi.
	dayComplete: { xp: 25, loot: { energy: 1 } as Loot },
	dayPerfect: { xp: 45, loot: { energy: 2, metal: 2 } as Loot },
	// Série d'une habitude (jours dus consécutifs tenus) : palier → récompense.
	streakMilestones: [
		{ days: 7, xp: 40, loot: { energy: 2 } as Loot },
		{ days: 14, xp: 80, loot: { energy: 3 } as Loot },
		{ days: 30, xp: 200, loot: { crystal: 2 } as Loot },
		{ days: 60, xp: 400, loot: { crystal: 3 } as Loot },
		{ days: 100, xp: 700, loot: { crystal: 5 } as Loot },
		{ days: 200, xp: 1200, loot: { crystal: 8 } as Loot },
		{ days: 365, xp: 2000, loot: { crystal: 12 } as Loot }
	],
	// Semaine pleine d'une habitude : grandit avec les semaines d'affilée (jusqu'à +70).
	habitWeek: { xp: 30, perStreakWeek: 10, maxStreakBonus: 7, loot: { metal: 3 } as Loot },
	habitWeekMilestones: [4, 8, 12, 26, 52], // semaines d'affilée : +1 Cristal
	habitWeekMinItems: 2, // au moins 2 séances dans la semaine pour compter
	// Semaine pleine d'une discipline (Danse, Sport, Mobilité…) : tout ce qui la concerne fait.
	familyWeek: { xp: 60, loot: { energy: 3 } as Loot, minItems: 3 },
	// Semaine sans faille : toutes les obligations de la semaine.
	weekComplete: { xp: 150, loot: { crystal: 2 } as Loot }
} as const;

// Bonus des modules du vaisseau et des compétences du pilote, par niveau.
export const EFFECTS = {
	reactorXp: 0.06, // Réacteur : +6 % d'XP
	hullShield: 0.1, // Coque : −10 % de Motivation perdue par raté
	antennaInspiration: 0.2, // Antenne : +20 % d'Inspiration gagnée
	thrustersOrbit: 0.25, // Propulseurs : +25 % de butin d'orbite
	recoveryPull: 0.03, // Second souffle : retour vers 50 plus rapide
	logisticsTask: 0.15, // Logistique : +15 % d'XP et de butin sur les tâches
	enduranceMin: 0.06, // Endurance : le palier minimum vaut 0,06 de plus
	engineeringCost: 0.05 // Ingénierie : −5 % sur le coût des améliorations
} as const;

export const MODULE_MAX_LEVEL = 5;
// 5 niveaux × 4 compétences = 20 points, soit le niveau 21 du pilote : les points servent longtemps.
export const SKILL_MAX_LEVEL = 5;

// XP pour passer du niveau n au niveau n+1 = LEVEL_BASE × n^LEVEL_EXPONENT
export const LEVEL_BASE = 100;
export const LEVEL_EXPONENT = 1.5;

export const GAUGES = {
	disciplineWindowDays: 28,
	motivationStart: 50,
	inspirationStart: 50,
	motivation: {
		obligatoryDone: 3,
		bonusDone: 2,
		questDone: 6,
		obligatoryMissed: -8,
		dailyPullToward: 50,
		dailyPullRatio: 0.15 // part de l'écart à 50 rattrapée chaque jour
	},
	inspiration: {
		weeklyReview: 25,
		chapterDone: 15,
		campaignDone: 30,
		newChallenge: 10,
		idleCampaignPerDay: -2
	},
	minimumModeBelow: 30,
	momentumFrom: 80
} as const;

export const DANCE_XP_DIFFICULTY = 'medium' as const;
