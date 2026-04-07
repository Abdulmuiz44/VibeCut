export function getBillingCycleStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export function formatBillingCycleLabel(now = new Date()) {
  return now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function shouldShowUpgradePrompt(projectCount: number, exportCount: number) {
  return projectCount >= 3 || exportCount >= 8;
}
