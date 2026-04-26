<template>
  <q-page>
    <div class="page-title">Dashboard</div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <KpiCard label="Total Products" :value="store.totalProducts" icon="inventory_2" color="primary" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <KpiCard label="Low Stock Items" :value="store.lowStockCount" icon="warning" color="warning" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <KpiCard label="Today's Movements" :value="store.todayMovementsCount" icon="swap_horiz" color="info" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <KpiCard label="Unread Notifications" :value="notifStore.unreadCount" icon="notifications" color="accent" />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-8">
        <q-card flat bordered>
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-medium">Recent Movements</div>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <MovementsTable :movements="store.recentMovements" :loading="store.loading" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-xs-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-medium">Low Stock Alerts</div>
          </q-card-section>
          <q-card-section class="q-pt-sm">
            <q-list v-if="store.lowStockItems.length" dense>
              <q-item
                v-for="item in (store.lowStockItems as LowStockItem[])"
                :key="item.id"
                :to="`/products/${item.id}`"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="warning" color="warning" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.name }}</q-item-label>
                  <q-item-label caption>{{ item.sku }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey-5 text-caption q-pa-sm">No low-stock items</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useNotificationsStore } from '@/stores/notifications';
import KpiCard from '@/components/KpiCard.vue';
import MovementsTable from '@/components/MovementsTable.vue';

interface LowStockItem { id: string; name: string; sku: string }

const store = useDashboardStore();
const notifStore = useNotificationsStore();

onMounted(() => store.fetchAll());
</script>
