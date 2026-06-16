<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ product ? 'Edit Product' : 'Add Product' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="form.sku" label="SKU *" outlined dense :disable="!!product"
                :rules="[v => !!v || 'SKU is required']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.unit" label="Unit" outlined dense />
            </div>
          </div>
          <q-input v-model="form.name" label="Name *" outlined dense
            :rules="[v => !!v || 'Name is required']" />
          <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="form.categoryId"
                :options="categoryOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Category *"
                outlined dense
                :rules="[v => !!v || 'Category is required']"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.supplierId"
                :options="supplierOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Supplier"
                outlined dense
                clearable
              />
            </div>
          </div>
          <q-input v-model.number="form.minStock" label="Min Stock" outlined dense type="number" min="0" />

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
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { listCategories } from '@/api/categories.api';
import { listSuppliers } from '@/api/suppliers.api';
import type { Product } from '@/api/products.api';

const props = defineProps<{ modelValue: boolean; product?: Product | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) initForm(); });
watch(open, v => emit('update:modelValue', v));

const saving = ref(false);
const categoryOptions = ref<{ id: string; name: string }[]>([]);
const supplierOptions = ref<{ id: string; name: string }[]>([]);

const form = ref({
  sku: '', name: '', description: '', unit: 'pcs',
  categoryId: '', supplierId: '', minStock: 0,
});

function initForm() {
  if (props.product) {
    form.value = {
      sku: props.product.sku,
      name: props.product.name,
      description: props.product.description ?? '',
      unit: props.product.unit,
      categoryId: props.product.category.id,
      supplierId: props.product.supplier?.id ?? '',
      minStock: props.product.minStock,
    };
  } else {
    form.value = { sku: '', name: '', description: '', unit: 'pcs', categoryId: '', supplierId: '', minStock: 0 };
  }
}

onMounted(async () => {
  [categoryOptions.value, supplierOptions.value] = await Promise.all([
    listCategories(),
    listSuppliers(),
  ]);
  initForm();
});

async function handleSubmit() {
  saving.value = true;
  try {
    const { useProductsStore } = await import('@/stores/products');
    const store = useProductsStore();
    const payload = {
      sku: form.value.sku,
      name: form.value.name,
      description: form.value.description || undefined,
      unit: form.value.unit || undefined,
      categoryId: form.value.categoryId,
      supplierId: form.value.supplierId || null,
      minStock: form.value.minStock,
    };
    if (props.product) {
      await store.editProduct(props.product.id, payload);
    } else {
      await store.addProduct(payload);
    }
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: props.product ? 'Product updated' : 'Product created' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to save product';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>
