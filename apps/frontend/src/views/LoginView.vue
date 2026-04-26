<template>
  <q-card class="login-card" flat>
    <q-card-section class="login-header">
      <q-icon name="warehouse" size="40px" color="primary" />
      <div class="login-brand">STURage</div>
      <div class="login-subtitle">Warehouse Inventory Management</div>
    </q-card-section>

    <q-card-section>
      <q-banner
        v-if="errorMsg"
        class="q-mb-md"
        rounded
        dense
        :class="errorMsg.includes('many') ? 'bg-warning text-white' : 'bg-negative text-white'"
      >
        <template #avatar><q-icon name="error" /></template>
        {{ errorMsg }}
      </q-banner>

      <q-form @submit="handleLogin" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          dense
          :rules="[val => !!val || 'Email is required']"
          autocomplete="email"
        />
        <q-input
          v-model="password"
          label="Password"
          :type="showPwd ? 'text' : 'password'"
          outlined
          dense
          :rules="[val => !!val || 'Password is required']"
          autocomplete="current-password"
        >
          <template #append>
            <q-icon
              :name="showPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPwd = !showPwd"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          label="Log In"
          color="primary"
          class="full-width"
          size="md"
          :loading="loading"
          unelevated
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const showPwd = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const authStore = useAuthStore();
const router = useRouter();

async function handleLogin() {
  errorMsg.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401) {
      errorMsg.value = 'Invalid email or password.';
    } else if (status === 429) {
      errorMsg.value = 'Too many login attempts — try again in 15 minutes.';
    } else {
      errorMsg.value = 'Something went wrong. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}

.login-header {
  text-align: center;
  padding-bottom: 8px;
}

.login-brand {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1565C0;
  margin-top: 8px;
}

.login-subtitle {
  font-size: 0.85rem;
  color: #757575;
  margin-top: 4px;
}
</style>
