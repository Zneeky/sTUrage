import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationsStore } from '../../stores/notifications';

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

vi.mock('../../api/notifications.api', () => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

import * as notificationsApi from '../../api/notifications.api';

const mockNotifications = [
  {
    id: 'n1',
    type: 'LOW_STOCK' as const,
    message: 'Product A is running low',
    isRead: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    product: { id: 'p1', name: 'Product A', sku: 'SKU-001' },
  },
  {
    id: 'n2',
    type: 'OUT_OF_STOCK' as const,
    message: 'Product B is out of stock',
    isRead: true,
    createdAt: '2025-01-01T01:00:00.000Z',
    product: { id: 'p2', name: 'Product B', sku: 'SKU-002' },
  },
];

describe('useNotificationsStore - TC-024', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts with empty items and zero unread count', () => {
    const store = useNotificationsStore();
    expect(store.items).toHaveLength(0);
    expect(store.unreadCount).toBe(0);
  });

  it('TC-024: fetch loads notifications from the API', async () => {
    vi.mocked(notificationsApi.listNotifications).mockResolvedValue(mockNotifications);
    const store = useNotificationsStore();
    await store.fetch();

    expect(store.items).toHaveLength(2);
  });

  it('TC-024: unreadCount reflects notifications where isRead is false', async () => {
    vi.mocked(notificationsApi.listNotifications).mockResolvedValue(mockNotifications);
    const store = useNotificationsStore();
    await store.fetch();

    expect(store.unreadCount).toBe(1); // only n1 is unread
  });

  it('markRead updates target notification to isRead true', async () => {
    vi.mocked(notificationsApi.listNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(notificationsApi.markNotificationRead).mockResolvedValue({ ...mockNotifications[0], isRead: true });

    const store = useNotificationsStore();
    await store.fetch();
    await store.markRead('n1');

    expect(store.items.find(n => n.id === 'n1')?.isRead).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it('markAllRead sets every notification to isRead true', async () => {
    vi.mocked(notificationsApi.listNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(notificationsApi.markAllNotificationsRead).mockResolvedValue({ updated: 1 });

    const store = useNotificationsStore();
    await store.fetch();
    await store.markAllRead();

    expect(store.items.every(n => n.isRead)).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it('remove deletes the notification from the items list', async () => {
    vi.mocked(notificationsApi.listNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(notificationsApi.deleteNotification).mockResolvedValue(undefined);

    const store = useNotificationsStore();
    await store.fetch();
    await store.remove('n1');

    expect(store.items.find(n => n.id === 'n1')).toBeUndefined();
    expect(store.items).toHaveLength(1);
  });
});
