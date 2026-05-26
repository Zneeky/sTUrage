<template>
  <div class="login-card">
    <div class="login-brand">
      <div class="login-logo">
        <q-icon name="warehouse" size="26px" color="white" />
      </div>
      <div class="login-app-name">STURage</div>
      <div class="login-tagline">Warehouse Inventory Management</div>
    </div>

    <div
      v-if="errorMsg"
      class="login-error"
    >
      <q-icon name="error" size="16px" />
      {{ errorMsg }}
    </div>

    <q-form @submit="handleLogin" class="login-form">
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
            style="color: var(--stu-gray-400);"
            @click="showPwd = !showPwd"
          />
        </template>
      </q-input>

      <button type="submit" class="login-submit" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </q-form>
  </div>
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
      errorMsg.value = 'Too many login attempts - try again in 15 minutes.';
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
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--stu-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.login-app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--stu-gray-900);
}

.login-tagline {
  font-size: 0.85rem;
  color: var(--stu-gray-500);
  margin-top: 4px;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--stu-danger-light);
  color: #991B1B;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-submit {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--stu-primary);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  margin-top: 4px;
}

.login-submit:hover {
  background: var(--stu-primary-600);
}

.login-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

@media (max-width: 480px) {
  .login-card {
    margin: 16px;
    padding: 28px;
  }

  .login-app-name {
    font-size: 1.3rem;
  }
}
</style>
