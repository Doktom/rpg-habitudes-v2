// Notifications de gain (« Tâche terminée · +20 XP »), affichées un instant en bas de l'écran.
import type { Loot } from './types';

export interface Toast {
	id: number;
	title: string;
	xp?: number;
	loot?: Loot;
}

class Toasts {
	items = $state<Toast[]>([]);
	private next = 1;

	push(t: Omit<Toast, 'id'>) {
		const id = this.next++;
		this.items = [...this.items.slice(-2), { ...t, id }];
		setTimeout(() => this.dismiss(id), 2800);
	}

	dismiss(id: number) {
		this.items = this.items.filter((t) => t.id !== id);
	}
}

export const toasts = new Toasts();
