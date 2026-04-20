import client from './client';
import type { Notification } from '@/stores/notifications';

export async function listNotifications(): Promise<Notification[]> {
  const res = await client.get('/notifications');
  return res.data.data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const res = await client.patch(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const res = await client.patch('/notifications/read-all');
  return res.data.data;
}

export async function deleteNotification(id: string): Promise<void> {
  await client.delete(`/notifications/${id}`);
}
