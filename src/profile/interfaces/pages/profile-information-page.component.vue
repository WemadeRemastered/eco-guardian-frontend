<template>
  <div class="min-h-screen pt-5">

    <h2 class="text-xl font-semibold mb-4 text-gray-800">{{ t('yourAccountDetails') }}</h2>
        <div class="profile-grid grid grid-cols-1 lg:grid-cols-[minmax(0,500px)_1fr] gap-6 mx-auto flex-wrap lg:flex-nowrap">
      <!-- Profile & Subscription Column -->
      <div class="flex flex-col gap-6 w-full max-w-[500px] flex-shrink-0">
        <div class="bg-white rounded-2xl shadow border border-gray-200 p-7 flex flex-col gap-6">
          <div class="flex items-center gap-6">
            <img :src="profile?.avatarUrl || 'https://avatars.githubusercontent.com/u/129230632?v=4'" alt="Profile"
              class="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="uppercase text-xs text-gray-400 tracking-widest">{{ t('userProfile') }}</span>
                <span
                  class="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded">{{ planName }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ profile?.name }} {{ profile?.userName }}</h3>
              <div class="flex flex-col gap-1.5 text-gray-700 text-sm">
                <span><span class="font-medium">{{ t('email') }}</span> {{ profile?.email }}</span>
                <span><span class="font-medium">{{ t('address') }}</span> {{ profile?.address }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
           
           <button
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 hover:bg-gray-200 transition"
              @click="handleEditProfile">{{ t('editProfile') }}</button>
              <button
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold border border-gray-300 hover:bg-gray-200 transition"
              @click="toggleLanguage"
              title="Switch language"
              >
              <p v-if="currentLocale === 'en'">
                <i class="pi pi-globe text-sm mr-1"></i>
                {{ t('ENG') }}
              </p>
              <p v-else>
                <i class="pi pi-globe text-sm mr-1"></i>
                {{ t('ES') }}
              </p>
            </button>
          </div>
        </div>
        <!-- Subscription Card -->
        <div
          class="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl shadow border border-gray-200 p-7 flex flex-col gap-6">
          <div class="flex items-center gap-4 mb-2">
            <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 1 0 6 0v-1c0-1.657-1.343-3-3-3z" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
            <h3 class="text-lg font-bold text-gray-800">{{ t('currentSubscription') }}</h3>
          </div>
          <div class="flex flex-col gap-2 text-gray-700 text-sm leading-relaxed">
            <div>
              <span class="font-medium">{{ t('plan') }}:</span> {{ planName }}
            </div>
            <div>
              <span class="font-medium">{{ t('name') }}:</span> {{ profile?.name }}
            </div>
            <div>
              <span class="font-medium">{{ t('lastName') }}:</span> {{ profile?.lastName }}
            </div>
            <div>
              <span class="font-medium">{{ t('status') }}:</span>
              <span
                class="inline-block ml-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold text-xs">{{ t('active') }}</span>
            </div>
          </div>
          <div v-if="planName === 'Domestic'"
            class="bg-white border border-amber-200 rounded-xl p-5 mt-2 flex flex-col gap-2 shadow-sm">
            <div class="flex items-center gap-2 mb-1">
              <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
              </svg>
              <span class="font-bold text-amber-700">{{ t('upgradeToDomesticPro') }}</span>
            </div>
            <ul class="list-disc list-inside text-gray-700 text-sm mb-2 space-y-1">
              <li>{{ t('allFeaturesFromCurrentPlan') }}</li>
              <li>{{ t('upTo8Plants') }}</li>
              <li>{{ t('extraTipsFromSpecialists') }}</li>
            </ul>
            <button
              class="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-amber-600 transition w-fit">{{ t('upgradeNow') }}</button>
          </div>
        </div>
        <!-- Notifications Widget (only if not Domestic) -->
        <div v-if="!authStore.isSpecialist"
          class="bg-white rounded-2xl shadow border border-gray-200 p-5 flex flex-col gap-3 max-h-72 overflow-y-auto min-h-[120px]">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-bell text-emerald-600 text-lg"></i>
            <h4 class="text-base font-semibold text-gray-800">{{ t('notifications') }}</h4>
          </div>
          <div v-if="notifications.length === 0" class="text-gray-400 text-sm text-center py-4">{{ t('noNotifications') }}</div>
          <div v-else class="flex flex-col gap-2">
            <div v-for="n in notifications" :key="n.id"
              class="border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 flex flex-col">
              <span class="font-medium text-gray-700 text-sm truncate">{{ n.title }}</span>
              <span class="text-xs text-gray-500 truncate">{{ n.subject }} {{ profile?.name }}</span>
              <span class="text-[10px] text-gray-400 mt-1">{{ formatDate(n.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Payment History Column -->
      <div class="w-full flex-shrink-0">
        <div class="bg-white rounded-2xl shadow border border-gray-200 p-7">
          <div class="flex items-center justify-between mb-6">
            <h3 v-if="!authStore.isSpecialist" class="text-xl font-bold text-gray-800">{{t('paymentHistory')}}</h3>
            <h3 v-else class="text-xl font-bold text-gray-800">{{t('ordersHistory')}}</h3>
            <div v-if="!authStore.isSpecialist" class="relative">
              <button @click="showDropdown = !showDropdown"
                class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors">
                {{ t(selectedFilter) }}
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showDropdown }" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="showDropdown"
                class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div class="py-1">
                  <button @click="selectFilter('Payments')"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    :class="{ 'bg-emerald-50 text-emerald-700 font-medium': selectedFilter === 'Payments' }">
                    {{t('Payments')}}
                  </button>
                  <button @click="selectFilter('Orders')"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    :class="{ 'bg-emerald-50 text-emerald-700 font-medium': selectedFilter === 'Orders' }">
                    {{t('Orders')}}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- Desktop Table -->
          <div>
            <div v-if="authStore.isSpecialist">
              <orders-list :orders="allOrders" />
            </div>
            <div v-else>
              <payments-table v-if="selectedFilter === 'Payments'" :payments="payments" />
              <orders-table v-else :orders="orders" />
            </div>
          </div>        
        </div>
      </div>
    </div>
    <EditProfileDialog :visible="showEditDialog" :profile="profile" @update:visible="showEditDialog = $event"
      @updated="handleProfileUpdated" :current-locale="currentLocale"
      :t="t" />
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed, h, watch } from 'vue';
import { useAuthStore } from '../../../iam/interfaces/store/auth-store';
import { ProfileStore } from '../store/profile-store';
import EditProfileDialog from '../components/edit-profile-dialog.component.vue';
import { useNotificationStore } from '../../interfaces/store/notification-store';
import axios from 'axios';
import PaymentsTable from '../components/payments-table.component.vue';
import OrdersTable from '../components/orders-table.component.vue';
import { usePaymentStore } from '../../../payment/interfaces/store/payment-store';
import { useOrderStore } from '../../../planning/interfaces/stores/order-store';
import { PaymentResponse } from '../../../payment/domain/assembler/payment-response';
import OrdersList from '../components/orders-list.component.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useI18n } from '../../../shared/services/usei18n';

const showDropdown = ref(false);
const selectedFilter = ref('Payments');
const authStore = useAuthStore();
const profileStore = ProfileStore();
const paymentStore = usePaymentStore();
const orderStore = useOrderStore();
const notificationStore = useNotificationStore()

const payments = ref([]);
const orders = ref([]);
const allOrders = ref([]);

const planNames = {
  1: 'Domestic',
  2: 'Pro',
  3: 'Business',
  4: 'Specialist',
  5: 'Admin',
};

const profile = computed(() => profileStore.profile);
const planName = computed(() => planNames[profile.value?.subscriptionId] || 'Unknown');
// Remove TS generic from ref for Vue SFC compatibility
const notifications = ref([]);

async function fetchPayments() {
  if (!profile.value?.userId) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}api/v1/payments/${profile.value.userId}`);
    payments.value = res.data || [];
  } catch (e) {
    payments.value = [];
  }
}

onMounted(async () => {
  if (authStore.user && authStore.user.email) {
    await profileStore.getProfileByEmail(authStore.email);
    payments.value = await paymentStore.fetchPaymentByUserId(authStore.user.id);
    orders.value = await orderStore.getOrdersByUserId(authStore.user.id);
    allOrders.value = await orderStore.getAllOrders();
  }
});

watch(profile, async (val) => {
  if (val?.id) {
    await notificationStore.getNotifications(val.id);
    await fetchPayments();
  }
});

const showEditDialog = ref(false);

function selectFilter(filter) {
  selectedFilter.value = filter;
  showDropdown.value = false;
}

function handleEditProfile() {
  showEditDialog.value = true;
}

async function handleProfileUpdated() {
  // Reload profile after update to refresh avatar and info
  if (authStore.user && authStore.user.email) {
    await profileStore.getProfileByEmail(authStore.user.email);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function formatDateOnly(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
}

function formatHourOnly(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function amountTemplate(row) {
  return `$${(row.amount / 100).toFixed(2)}`
}

function statusTemplate(row) {
  const statusColor = {
    Succeeded: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Failed: 'bg-red-100 text-red-700'
  }
  return h(
    'span',
    {
      class: `px-2 py-1 rounded text-xs font-semibold ${statusColor[row.paymentStatus] || 'bg-gray-100 text-gray-700'}`
    },
    row.paymentStatus
  )
}

function methodTemplate(row) {
  return h(
    'div',
    { class: 'flex items-center gap-2' },
    [
      h('i', { class: 'pi pi-credit-card text-emerald-600 text-base' }),
      h('span', {}, row.paymentMethodId)
    ]
  )
}

function typeTemplate(row) {
  return `$${(row.amount / 100).toFixed(2)}`
}

function actionTemplate(row) {
  return h(
    'div',
    { class: 'flex items-center justify-center' },
    [
      h(
        'button',
        {
          class: 'flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 border border-blue-200 hover:border-blue-300',
          title: 'View Details',
          onClick: () => console.log('View details for:', row.paymentIntentId)
        },
        [
          // Icono SVG del ojo
          h('svg', {
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
            h('circle', { cx: '12', cy: '12', r: '3' })
          ])
        ]
      )
    ]
  )
}

function amountWithCurrencyTemplate(row) {
  const symbols = { usd: '$', eur: '€', pen: 'S/' };
  const symbol = symbols[(row.currency || '').toLowerCase()] || (row.currency ? row.currency.toUpperCase() : '');
  return `${symbol}${(row.amount / 100).toFixed(2)}`;
}

function statusTextTemplate(row) {
  // Capitalize first letter
  if (!row.paymentStatus) return '';
  return row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1);
}

function dateOnlyTemplate(row) {
  if (!row.createdAt) return '';
  const date = new Date(row.createdAt);
  if (isNaN(date.getTime())) return '';
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
}

function hourOnlyTemplate(row) {
  if (!row.createdAt) return '';
  const date = new Date(row.createdAt);
  if (isNaN(date.getTime())) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

const { t, toggleLanguage, currentLocale } = useI18n();

</script>

<style scoped>
:deep(.p-datatable) {
  font-size: 0.97rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  padding: 1rem 0.75rem !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background: #fff;
  padding: 0.8rem 0.75rem !important;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover > td) {
  background: #f9fafb;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s ease !important;
}

.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-grid>div {
  min-width: 0;
}

.bg-white,
.bg-gradient-to-br {
  word-break: break-word;
  overflow-wrap: anywhere;
}

@media (min-width: 1024px) {
  .profile-grid {
    display: grid;
    grid-template-columns: minmax(0, 500px) 1fr;
    flex-direction: unset;
  }
}

.responsive-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.custom-datatable {
  min-width: 600px;
}

@media (max-width: 640px) {
  .p-7 {
    padding: 1.25rem !important;
  }

  .rounded-2xl {
    border-radius: 1rem !important;
  }

  .shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07) !important;
  }

  .flex-col {
    gap: 1rem !important;
  }

  .custom-datatable {
    min-width: 480px;
  }
}
</style>
