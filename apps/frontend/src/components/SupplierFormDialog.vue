<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 460px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ supplier ? 'Edit Supplier' : 'Add Supplier' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <q-input v-model="form.name" label="Name *" outlined dense
            :rules="[v => !!v || 'Name is required']" />
          <q-input v-model="form.contactName" label="Contact Name" outlined dense />
          <q-input v-model="form.email" label="Email" type="email" outlined dense
            :rules="[v => !v || /.+@.+\..+/.test(v) || 'Invalid email']" />
          <q-input v-model="form.phone" label="Phone" outlined dense />
          <q-input v-model="form.address" label="Address" outlined dense type="textarea" rows="2" />
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
import { createSupplier, updateSupplier } from '@/api/suppliers.api';
import type { Supplier } from '@/api/suppliers.api';

const props = defineProps<{ modelValue: boolean; supplier?: Supplier | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) initForm(); });
watch(open, v => emit('update:modelValue', v));

const saving = ref(false);
const form = ref({ name: '', contactName: '', email: '', phone: '', address: '' });

function initForm() {
  form.value = {
    name:        props.supplier?.name        ?? '',
    contactName: props.supplier?.contactName ?? '',
    email:       props.supplier?.email       ?? '',
    phone:       props.supplier?.phone       ?? '',
    address:     props.supplier?.address     ?? '',
  };
}

async function handleSubmit() {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      contactName: form.value.contactName || undefined,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
      address: form.value.address || undefined,
    };
    if (props.supplier) {
      await updateSupplier(props.supplier.id, payload);
    } else {
      await createSupplier(payload);
    }
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: props.supplier ? 'Supplier updated' : 'Supplier created' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to save supplier';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>
