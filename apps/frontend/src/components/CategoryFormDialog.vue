<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 400px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ category ? 'Edit Category' : 'Add Category' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <q-input v-model="form.name" label="Name *" outlined dense
            :rules="[v => !!v || 'Name is required']" />
          <q-input v-model="form.description" label="Description" outlined dense type="textarea" rows="2" />
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
import { createCategory, updateCategory } from '@/api/categories.api';
import type { Category } from '@/api/categories.api';

const props = defineProps<{ modelValue: boolean; category?: Category | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) initForm(); });
watch(open, v => emit('update:modelValue', v));

const saving = ref(false);
const form = ref({ name: '', description: '' });

function initForm() {
  form.value = { name: props.category?.name ?? '', description: props.category?.description ?? '' };
}

async function handleSubmit() {
  saving.value = true;
  try {
    if (props.category) {
      await updateCategory(props.category.id, form.value);
    } else {
      await createCategory(form.value);
    }
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: props.category ? 'Category updated' : 'Category created' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to save category';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>
