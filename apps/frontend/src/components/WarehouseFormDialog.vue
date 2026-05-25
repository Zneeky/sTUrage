<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 460px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ warehouse ? 'Edit Warehouse' : 'Add Warehouse' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <q-input
            v-model="form.name"
            label="Name *"
            outlined dense
            :rules="[v => !!v || 'Name is required']"
          />
          <q-input
            v-model="form.location"
            label="Location *"
            outlined dense
            :rules="[v => !!v || 'Location is required']"
          />
          <q-input
            v-model="form.description"
            label="Description"
            outlined dense
            type="textarea"
            rows="3"
          />
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
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { createWarehouse, updateWarehouse } from '@/api/warehouses.api';
import type { Warehouse } from '@/api/warehouses.api';

const props = defineProps<{ modelValue: boolean; warehouse?: Warehouse | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) initForm(); });
watch(open, v => emit('update:modelValue', v));

const saving = ref(false);
const form = ref({ name: '', location: '', description: '' });

function initForm() {
  form.value = {
    name:        props.warehouse?.name        ?? '',
    location:    props.warehouse?.location    ?? '',
    description: props.warehouse?.description ?? '',
  };
}

async function handleSubmit() {
  saving.value = true;
  try {
    const payload = {
      name:        form.value.name,
      location:    form.value.location,
      description: form.value.description || undefined,
    };
    if (props.warehouse) {
      await updateWarehouse(props.warehouse.id, payload);
    } else {
      await createWarehouse(payload);
    }
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: props.warehouse ? 'Warehouse updated' : 'Warehouse created' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to save warehouse';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>
