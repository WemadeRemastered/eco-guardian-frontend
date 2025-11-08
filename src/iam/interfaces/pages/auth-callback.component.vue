<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF5E7] to-[#F0EBD8]">
    <div class="text-center">
      <div class="mb-6">
        <ProgressSpinner
          style="width: 60px; height: 60px; color: #578257;"
          strokeWidth="5"
          fill="transparent"
          animationDuration="5s"
          aria-label="Loading"
        />
      </div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Authenticating...</h2>
      <p class="text-gray-600">Please wait while we complete your login</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '../store/auth-store';

const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const isProcessing = ref(true);

onMounted(async () => {
  try {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code || !state) {
      console.error('Missing auth parameters');
      throw new Error('Missing authentication parameters');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (isAuthenticated.value) {
      router.replace('/home');
      return;
    }

    try {
      await getAccessTokenSilently();
    } catch (err: any) {
      console.log('Token acquisition:', err.message || err);
    }

    if (isAuthenticated.value) {
      console.log('Authentication successful!', user.value);

      if (user.value) {
        const auth0Role = (user.value as any).role || 'Domestic';

        authStore.role = auth0Role;
        authStore.id = user.value.sub || '';
        authStore.user = user.value;
        authStore.isEnterprise = auth0Role === 'Business';
        authStore.isSpecialist = auth0Role === 'Specialist';
        authStore.isAdmin = auth0Role === 'Admin';

        localStorage.setItem('auth0_user', JSON.stringify({
          role: auth0Role,
          id: user.value.sub,
          email: user.value.email,
          name: user.value.name,
          picture: user.value.picture
        }));

      }

      toast.add({
        severity: 'success',
        summary: 'Welcome!',
        detail: `Logged in as ${user.value?.name || user.value?.email}`,
        life: 3000
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Redirecting to /home...');
      router.push('/home');
    } else {
      throw new Error('Authentication timeout - please try again');
    }

  } catch (error: any) {
    console.error('Authentication error:', error);
    isProcessing.value = false;

    const isStateError = error.message?.includes('Invalid state') || error.error === 'invalid_state';
    const isTimeoutError = error.message?.includes('timeout');

    let errorMessage = 'Authentication failed. Please try again.';

    if (isStateError) {
      errorMessage = 'Session expired. Clearing cache and redirecting...';

      console.log('Clearing Auth0 cache...');
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth0') || key.includes('@@auth0spajs@@')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();

    } else if (isTimeoutError) {
      errorMessage = 'Authentication is taking too long. Please try again.';
    }

    toast.add({
      severity: 'error',
      summary: 'Authentication Failed',
      detail: errorMessage,
      life: 5000
    });

    setTimeout(() => {
      router.replace('/login');
    }, 2000);
  }
});
</script>

