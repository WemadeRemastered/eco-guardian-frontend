<template>
  <div class="main-dashboard-container">
    <div v-if="isEnterprise || isDomestic" class="dashboard-container">
      <div class="dashboard-column">
        <div class="line-chart">
          <lines-chart></lines-chart>
        </div>
        <div class="widgets">
          <widgets-container></widgets-container>
        </div>
      </div>
      <div class="list-container">
        <plants-list></plants-list>
      </div>
      <div class="tips-container">
        <div class="tips-carousel-container">
          <tips-carousel></tips-carousel>
        </div>
        <div class="alerts-list-container">
          <alerts-list></alerts-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../iam/interfaces/store/auth-store.ts';
import AlertsList from '../../../monitoring/interfaces/alerts-list.component.vue';
import LinesChart from '../../../analytics/interfaces/components/line-chart.component.vue';

import TipsCarousel from '../../../crm/interfaces/components/tips-carousel.component.vue';
import WidgetsContainer from '../components/widgets-container.component.vue';
import PlantsList from '../../../monitoring/interfaces/components/plants-list.component.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {ProfileStore} from "../../../profile/interfaces/store/profile-store.ts";

const authStore = useAuthStore();
const router = useRouter();
const profileStore = ProfileStore();
console.log('Dashboard component loaded with role:', authStore.role);
const isEnterprise = authStore.role === 'Business' || authStore.role === 'Admin';
const isDomestic = authStore.role === 'Domestic';


 const loadProfile = async () =>{
  await profileStore.getProfileByEmail(authStore.email);
}


onMounted(() => {
  if (authStore.user && authStore.user.email) {
    loadProfile();
  }
  if (authStore.role === 'Specialist') {
    router.push('/consulting');
  }
  if (!localStorage.getItem('reloaded')) {
    localStorage.setItem('reloaded', 'true');
    window.location.reload();
  }
});
</script>
<style>
.dashboard-container {
  display: flex;
  gap: 1rem;
  height: 100%;
  width: 100%;

}

.main-dashboard-container {
  height: 100%;
  overflow-y: hidden;
}

.list-container {
  width: 30%;
  height: 100%;
  flex: 1;
  display: flex;
}

.tips-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  flex: 1;
  width: 30%;

}

.tips-carousel-container {
  flex: 1;
  width: 100%;
}

.alerts-list-container {
  width: 100%;
  flex: 1;
}

.dashboard-column {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  width: 40%;
}

.widgets {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.line-chart {
  flex: 1;
}



@media (max-width: 1024px) {

  .dashboard-container {
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
    /* Firefox */
    scrollbar-color: #9CA3AF transparent;
    /* Firefox */
  }

  .dashboard-column {
    width: 100%;
    height: auto;
  }

  .list-container {
    width: 100%;
    height: 50%;
  }

  .tips-container {
    flex-direction: row;
    width: 100%;
  }

}

@media (max-width: 1024px) {


  .tips-container {
    flex-direction: column;
    width: 100%;
  }
}
</style>