<template>
  <div class="min-h-screen h-screen flex">
    <!-- LEFT SIDE - Form Section -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-[#FAF5E7] to-[#F0EBD8]">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="/logo.svg" alt="EcoGuardian Logo" class="h-16 mx-auto mb-5" />
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Welcome Back</h1>
          <p class="text-gray-600 text-sm lg:text-base">Sign in to your EcoGuardian account</p>
        </div>

        <div class="space-y-4">
          <div class="w-full">
            <button
              @click="handleAuth0Login"
              :disabled="isLoading"
              class="w-full py-3 px-4 bg-[#578257] hover:bg-[#4a6b4a] text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#578257] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span v-if="!isLoading">Sign In</span>
              <div v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Signing in...
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- RIGHT SIDE - Image Section -->
    <div class="hidden lg:block lg:w-1/2 relative select-none">
      <div class="absolute inset-0 bg-gradient-to-br from-[#578257]/20 to-transparent z-10"></div>
      <img src="/src/assets/images/bg-ecoguardian-alpha.jpeg" alt="EcoGuardian Background"
        class="w-full h-full object-cover" />
    </div>
  </div>

  <!-- Loading Spinner -->
  <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <ProgressSpinner style="width: 50px; height: 50px; color: #578257;" strokeWidth="5" fill="transparent"
      animationDuration=".5s" aria-label="Custom ProgressSpinner" />
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import { useAuth0 } from '@auth0/auth0-vue';

const toast = useToast();
const { loginWithRedirect } = useAuth0();


const isLoading = ref<boolean>(false);

const handleAuth0Login = async () => {
  try {
    await loginWithRedirect();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: 'Unable to connect to Auth0. Please try again.',
      life: 4000
    });
    console.error('Auth0 login failed:', error);
  }
};

</script>