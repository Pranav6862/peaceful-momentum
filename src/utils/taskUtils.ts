import { Task, TaskLifespan } from '../types';
import { differenceInDays, differenceInHours, parseISO, format } from 'date-fns';

export function getExpiresAt(lifespan: TaskLifespan, customDays?: number): string | null {
  if (lifespan === 'none') return null;
  const now = new Date();
  let days = 0;
  if (lifespan === '1day') days = 1;
  else if (lifespan === '3days') days = 3;
  else if (lifespan === '1week') days = 7;
  else if (lifespan === 'custom' && customDays) days = customDays;
  else return null;

  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return expiry.toISOString();
}

export function getTaskAge(task: Task): number {
  return differenceInDays(new Date(), parseISO(task.createdAt));
}

export function getTaskAgeHours(task: Task): number {
  return differenceInHours(new Date(), parseISO(task.createdAt));
}

export function getAgingOpacity(task: Task): number {
  const ageDays = getTaskAge(task);
  if (ageDays <= 1) return 1;
  if (ageDays >= 7) return 0.55;
  return Math.max(0.55, 1 - (ageDays - 1) * 0.075);
}

export function getAgingTint(task: Task): number {
  // Returns 0-1 for how much paper-yellow tint to apply
  const ageDays = getTaskAge(task);
  if (ageDays <= 1) return 0;
  if (ageDays >= 7) return 1;
  return Math.min(1, (ageDays - 1) / 6);
}

export function isExpired(task: Task): boolean {
  if (!task.expiresAt) return false;
  return new Date() > parseISO(task.expiresAt);
}

export function formatRelativeDate(isoString: string): string {
  const date = parseISO(isoString);
  const days = differenceInDays(new Date(), date);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return format(date, 'MMM d');
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function shouldTriggerReset(
  resetTime: string,
  lastResetDate: string | null
): boolean {
  const today = getTodayString();
  if (lastResetDate === today) return false;

  const [hours, minutes] = resetTime.split(':').map(Number);
  const now = new Date();
  const resetMoment = new Date();
  resetMoment.setHours(hours, minutes, 0, 0);

  return now >= resetMoment;
}

export function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'high': return '#e07070';
    case 'medium': return '#e0a870';
    case 'low': return '#70a8e0';
  }
}

export function getEnergyTagShort(tag: string): string {
  return tag.split(' ')[0];
}
