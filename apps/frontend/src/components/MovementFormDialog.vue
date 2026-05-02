<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 480px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">New Stock Movement</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-md" rounded dense>
          <template #avatar><q-icon name="error" /></template>
          {{ errorMsg }}
        </q-banner>

        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Movement Type *"
            outlined dense
            :rules="[v => !!v || 'Type is required']"
          />

          <q-select
            v-if="!productId"
            v-model="form.productId"
            :options="productOptions"
            option-value="id"
            option-label="name"
            emit-value map-options
            use-input
            label="Product *"
            outlined dense
            @filter="filterProducts"
            :rules="[v => !!v || 'Product is required']"
          />

          <q-select
            v-if="needsSource"
            v-model="form.warehouseId"
            :options="warehouseOptions"
            option-value="id" option-label="name"
            emit-value map-options
            label="Source Warehouse *"
            outlined dense
            :rules="[v => needsSource ? !!v || 'Source warehouse required' : true]"
          />

          <q-select
            v-if="needsTarget"
            v-model="form.targetWarehouseId"
            :options="warehouseOptions"
            option-value="id" option-label="name"
            emit-value map-options
            label="Target Warehouse *"
            outlined dense
            :rules="[
              v => needsTarget ? !!v || 'Target warehouse required' : true,
              v => !(form.type === 'TRANSFER' && !!v && v === form.warehouseId) || 'Must differ from source warehouse',
            ]"
          />

          <q-input
            v-model.number="form.quantity"
            label="Quantity *"
            type="number" min="1"
            outlined dense
            :rules="[v => (v > 0) || 'Must be positive']"
          />

          <q-input v-model="form.note" label="Note" outlined dense />

          <div class="row justify-end q-gutter-sm q-mt-sm">
            <q-btn label="Cancel" flat v-close-popup />
            <q-btn label="Save" type="submit" color="primary" unelevated :loading="saving" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listWarehouses } from '@/api/warehouses.api';
import { listProducts } from '@/api/products.api';
import { createMovement } from '@/api/stockMovements.api';
import type { Warehouse } from '@/api/warehouses.api';
import type { Product } from '@/api/products.api';

const props = defineProps<{ modelValue: boolean; productId?: string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) resetForm(); });
watch(open, v => {
  emit('update:modelValue', v);
  if (!v) errorMsg.value = '';
});

const saving = ref(false);
const errorMsg = ref('');
const warehouseOptions = ref<Warehouse[]>([]);
const productOptions = ref<Product[]>([]);

const typeOptions = ['INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT'];

const form = ref({
  type: '' as string,
  productId: props.productId ?? '',
  warehouseId: '',
  targetWarehouseId: '',
  quantity: 1,
  note: '',
});

const needsSource = computed(() => ['OUTBOUND', 'TRANSFER', 'ADJUSTMENT'].includes(form.value.type));
const needsTarget = computed(() => ['INBOUND', 'TRANSFER'].includes(form.value.type));

function resetForm() {
  form.value = { type: '', productId: props.productId ?? '', warehouseId: '', targetWarehouseId: '', quantity: 1, note: '' };
  errorMsg.value = '';
}

async function filterProducts(val: string, update: (fn: () => void) => void) {
  const res = await listProducts({ search: val, limit: 20 });
  update(() => { productOptions.value = res.data; });
}

onMounted(async () => {
  warehouseOptions.value = await listWarehouses();
  if (!props.productId) {
    const res = await listProducts({ limit: 20 });
    productOptions.value = res.data;
  }
});

async function handleSubmit() {
  saving.value = true;
  errorMsg.value = '';
  try {
    await createMovement({
      productId: props.productId ?? form.value.productId,
      warehouseId: form.value.warehouseId || form.value.targetWarehouseId,
      type: form.value.type as 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT',
      quantity: form.value.quantity,
      note: form.value.note || undefined,
      targetWarehouseId: needsTarget.value && form.value.type === 'TRANSFER' ? form.value.targetWarehouseId : undefined,
    });
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: 'Movement recorded' });
  } catch (err: unknown) {
    const data = (err as { response?: { data?: { error?: string } } }).response?.data;
    errorMsg.value = data?.error ?? 'Failed to record movement';
  } finally {
    saving.value = false;
  }
}
</script>
