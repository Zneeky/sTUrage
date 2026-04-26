<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 440px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ user ? 'Edit User' : 'Add User' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model="form.firstName" label="First Name *" outlined dense
                :rules="[v => !!v || 'Required']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.lastName" label="Last Name *" outlined dense
                :rules="[v => !!v || 'Required']" />
            </div>
          </div>
          <q-input v-model="form.email" label="Email *" type="email" outlined dense
            :rules="[v => !!v || 'Required']" />
          <q-input
            v-if="!user"
            v-model="form.password"
            label="Password *"
            :type="showPwd ? 'text' : 'password'"
            outlined dense
            :rules="[v => !user ? (v?.length >= 8 || 'Min 8 characters') : true]"
          >
            <template #append>
              <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
            </template>
          </q-input>
          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="Role *"
            outlined dense
            :rules="[v => !!v || 'Required']"
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
import { useUsersStore } from '@/stores/users';
import type { User } from '@/api/users.api';

const props = defineProps<{ modelValue: boolean; user?: User | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const store = useUsersStore();
const open = ref(props.modelValue);
watch(() => props.modelValue, v => { open.value = v; if (v) initForm(); });
watch(open, v => emit('update:modelValue', v));

const saving = ref(false);
const showPwd = ref(false);
const roleOptions = ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'];

const form = ref({ firstName: '', lastName: '', email: '', password: '', role: 'OPERATOR' as User['role'] });

function initForm() {
  if (props.user) {
    form.value = { firstName: props.user.firstName, lastName: props.user.lastName, email: props.user.email, password: '', role: props.user.role };
  } else {
    form.value = { firstName: '', lastName: '', email: '', password: '', role: 'OPERATOR' };
  }
}

async function handleSubmit() {
  saving.value = true;
  try {
    if (props.user) {
      await store.editUser(props.user.id, { firstName: form.value.firstName, lastName: form.value.lastName, email: form.value.email, role: form.value.role });
    } else {
      await store.addUser({ ...form.value });
    }
    emit('saved');
    open.value = false;
    $q.notify({ type: 'positive', message: props.user ? 'User updated' : 'User created' });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save user' });
  } finally {
    saving.value = false;
  }
}
</script>
