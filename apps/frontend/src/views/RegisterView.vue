<template>
  <div class="register-card">
    <div class="register-brand">
      <div class="register-logo">
        <q-icon name="warehouse" size="26px" color="white" />
      </div>
      <div class="register-app-name">STURage</div>
      <div class="register-tagline">Create your account</div>
    </div>

    <div v-if="errorMsg" class="register-error">
      <q-icon name="error" size="16px" />
      {{ errorMsg }}
    </div>

    <q-form @submit="handleRegister" class="register-form">
      <div class="name-row">
        <q-input
          v-model="firstName"
          label="First Name"
          outlined
          dense
          :rules="[val => !!val || 'Required']"
          autocomplete="given-name"
        />
        <q-input
          v-model="lastName"
          label="Last Name"
          outlined
          dense
          :rules="[val => !!val || 'Required']"
          autocomplete="family-name"
        />
      </div>

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
        :rules="[
          val => !!val || 'Password is required',
          val => val.length >= 8 || 'Password must be at least 8 characters',
        ]"
        autocomplete="new-password"
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

      <q-input
        v-model="confirmPassword"
        label="Confirm Password"
        :type="showConfirmPwd ? 'text' : 'password'"
        outlined
        dense
        :rules="[
          val => !!val || 'Please confirm your password',
          val => val === password || 'Passwords do not match',
        ]"
        autocomplete="new-password"
      >
        <template #append>
          <q-icon
            :name="showConfirmPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            style="color: var(--stu-gray-400);"
            @click="showConfirmPwd = !showConfirmPwd"
          />
        </template>
      </q-input>

      <button type="submit" class="register-submit" :disabled="loading">
        {{ loading ? 'Creating account…' : 'Create Account' }}
      </button>
    </q-form>

    <div class="register-footer">
      Already have an account?
      <router-link to="/login" class="register-link">Sign in</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPwd = ref(false);
const showConfirmPwd = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const authStore = useAuthStore();
const router = useRouter();

async function handleRegister() {
  errorMsg.value = '';
  loading.value = true;
  try {
    await authStore.register(email.value, password.value, firstName.value, lastName.value);
    router.push('/dashboard');
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 409) {
      errorMsg.value = 'An account with this email already exists.';
    } else if (status === 429) {
      errorMsg.value = 'Too many attempts — try again in 15 minutes.';
    } else {
      errorMsg.value = 'Something went wrong. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.register-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.register-logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--stu-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.register-app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--stu-gray-900);
}

.register-tagline {
  font-size: 0.85rem;
  color: var(--stu-gray-500);
  margin-top: 4px;
}

.register-error {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.register-submit {
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

.register-submit:hover {
  background: var(--stu-primary-600);
}

.register-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--stu-gray-500);
}

.register-link {
  color: var(--stu-primary);
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    margin: 16px;
    padding: 28px;
  }

  .register-app-name {
    font-size: 1.3rem;
  }

  .name-row {
    grid-template-columns: 1fr;
  }
}
</style>
