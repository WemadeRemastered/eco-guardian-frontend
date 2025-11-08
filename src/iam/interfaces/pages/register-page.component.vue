<template>
  <div class="min-h-screen h-screen flex">
    <!-- LEFT SIDE - Form Section -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-[#FAF5E7] to-[#F0EBD8]">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <img src="/logo.svg" alt="EcoGuardian Logo" class="h-16 mx-auto mb-5" />
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Create Account</h1>
          <p class="text-gray-600 text-sm lg:text-base">Join EcoGuardian platform today</p>
        </div>

        <div class="space-y-4">

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-[#FAF5E7] text-gray-500">or register with email</span>
            </div>
          </div>

          <!-- Form -->
          <form novalidate @submit.prevent="handleRegister" class="space-y-4">
            <!-- Name and Last Name Row -->
            <div class="grid grid-cols-2 gap-3">
              <!-- First Name -->
              <div class="flex flex-col">
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <Input id="firstName" v-model="firstName" type="text" required :class="[
                  'w-full border-1 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                  firstNameError ? '!border-red-500' : 'border-gray-400/60'
                ]" placeholder="John" />
                <span v-if="firstNameError" class="text-red-500 font-sans text-xs pt-1">{{ firstNameError }}</span>
              </div>

              <!-- Last Name -->
              <div class="flex flex-col">
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <Input id="lastName" v-model="lastName" type="text" required :class="[
                  'w-full border-1 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                  lastNameError ? '!border-red-500' : 'border-gray-400/60'
                ]" placeholder="Doe" />
                <span v-if="lastNameError" class="text-red-500 font-sans text-xs pt-1">{{ lastNameError }}</span>
              </div>
            </div>

            <!-- Email Field -->
            <div class="flex flex-col">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div class="relative">
                <Input id="email" v-model="email" type="email" required :class="[
                  'w-full border-1 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                  emailError ? '!border-red-500' : 'border-gray-400/60'
                ]" placeholder="john.doe@email.com" />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <i class="pi pi-envelope text-gray-400 text-sm"></i>
                </div>
              </div>
              <span v-if="emailError" class="text-red-500 font-sans text-sm pt-1">{{ emailError }}</span>
            </div>

            <!-- Password Field -->
            <div class="flex flex-col">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div class="relative">
                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required :class="[
                  'w-full border-1 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                  passwordError ? '!border-red-500' : 'border-gray-400/60'
                ]" placeholder="Create a strong password" />
                <button type="button" @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                  <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>

              <!-- Password Requirements -->
              <div class="mt-2 space-y-1">
                <p class="text-xs text-gray-600">Password must contain:</p>
                <div class="grid grid-cols-2 gap-1 text-xs">
                  <div :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-400'" class="flex items-center">
                    <i :class="passwordChecks.minLength ? 'pi pi-check' : 'pi pi-circle'" class="mr-1 text-xs"></i>
                    6+ characters
                  </div>
                  <div :class="passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-400'" class="flex items-center">
                    <i :class="passwordChecks.hasUppercase ? 'pi pi-check' : 'pi pi-circle'" class="mr-1 text-xs"></i>
                    Uppercase letter
                  </div>
                  <div :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-400'" class="flex items-center">
                    <i :class="passwordChecks.hasNumber ? 'pi pi-check' : 'pi pi-circle'" class="mr-1 text-xs"></i>
                    Number
                  </div>
                  <div :class="passwordChecks.hasSpecialChar ? 'text-green-600' : 'text-gray-400'" class="flex items-center">
                    <i :class="passwordChecks.hasSpecialChar ? 'pi pi-check' : 'pi pi-circle'" class="mr-1 text-xs"></i>
                    Special character
                  </div>
                </div>
              </div>

              <span v-if="passwordError" class="text-red-500 font-sans text-sm pt-1">{{ passwordError }}</span>
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <Input id="confirmPassword" v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                  required :class="[
                    'w-full border-1 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary',
                    confirmPasswordError ? '!border-red-500' : 'border-gray-400/60'
                  ]" placeholder="Confirm your password" />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                  <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
                </button>
              </div>
              <span v-if="confirmPasswordError" class="text-red-500 font-sans text-sm pt-1">{{ confirmPasswordError
              }}</span>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="isLoading" class="mt-6 w-full py-3 px-4 bg-[#578257] hover:bg-[#4a6b4a] text-white font-medium rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#578257] disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 select-none">
              <span v-if="!isLoading">Create Account</span>
              <div v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                Creating account...
              </div>
            </button>

            <!-- Sign In Link -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account?
                <router-link to="/login" class="font-medium text-[#578257] hover:text-[#4a6b4a] transition-colors">
                  Sign in
                </router-link>
              </p>
            </div>
          </form>
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
import Input from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import { useField, useForm } from 'vee-validate'
import { ref, computed } from 'vue'
import signUpSchema from '../../../public/schemas/sign-up-schema'
import { createModal } from '../../../public/utils/helpers/create-modal'
import CustomDialog from '../../../shared/components/ui/custom-dialog.component.vue'
import { useDialog } from 'primevue'
import { useToast } from "primevue/usetoast";
import { useAuthStore } from '../store/auth-store'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue';

const dialog = useDialog();
const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();
const { loginWithRedirect } = useAuth0();

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const { errors } = useForm({
  validationSchema: signUpSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
})

const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName')
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')

// Password strength checks
const passwordChecks = computed(() => {
  const pwd = password.value || '';
  return {
    minLength: pwd.length >= 6,
    hasUppercase: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  };
});

// Auth0 Register Handler
const handleAuth0Register = async () => {
  try {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: 'Unable to connect to Auth0. Please try again.',
      life: 4000
    });
    console.error('Auth0 registration failed:', error);
  }
};

// Traditional Register Handler
const handleRegister = async () => {

  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    createModal(
      dialog,
      CustomDialog,
      {
        title: 'Missing Fields',
        subtitle: 'Please fill in all required fields.',
        type: 'error',
        severity: 'danger',
      }
    );
    return;
  }

  if (Object.keys(errors.value).length > 0) {
    createModal(
      dialog,
      CustomDialog,
      {
        title: 'Validation Error',
        subtitle: 'Please correct the errors before proceeding.',
        type: 'error',
        severity: 'danger',
      }
    );
    return;
  }

  isLoading.value = true

  try {
    authStore.setUserData({
      name : firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      avatarUrl: null,
      subscriptionId: 0
    });
    router.push('/choose-plan');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: 'An error occurred during registration. Please try again.',
      life: 4000
    });
    console.error('Registration failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>