const KEY = 'ecomap:tutorial-seen';

export function hasTutorialBeenSeen(): boolean {
  return localStorage.getItem(KEY) === 'true';
}

export function markTutorialSeen(): void {
  localStorage.setItem(KEY, 'true');
}
