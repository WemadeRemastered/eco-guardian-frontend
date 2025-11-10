<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CalendarOrder from "@/planning/interfaces/components/calendar-order.component.vue";
import TimeSlotsOrder from "@/planning/interfaces/components/time-slots-order.component.vue";
import Button from "primevue/button";
import { useOrderStore } from "../../../planning/interfaces/stores/order-store.ts";
import { useRouter } from 'vue-router';
import { createModal } from '../../../public/utils/helpers/create-modal.ts';
import CustomDialog from '../../../shared/components/ui/custom-dialog.component.vue';
import ProgressSpinner from 'primevue/progressspinner'
import { useDialog } from 'primevue';
import { usePlantStore } from '../../../monitoring/interfaces/stores/plant-store.ts';
import { createObjectURL } from '../../../public/utils/helpers/plant.ts';
import PlantPreviewInformation from '../components/plant-preview-information.component.vue';
import { DeviceAssembler } from '../../../inventory/domain/assembler/device-assembler.ts';
import { OrderAssembler } from '../../domain/order-assembler.ts';
import { useDeviceStore } from '../../../inventory/stores/device-store.ts';
import { calculateDeviceQuantity } from '../../../public/utils/helpers/order.ts';
import { PaymentAssembler } from '../../../payment/domain/assembler/payment-assembler.ts';
import { usePaymentStore } from '../../../payment/interfaces/store/payment-store.ts';
import {useAuthStore} from "@/iam/interfaces/store/auth-store.ts";

const selectedDate = ref<Date | null>(null);
const selectedSlot = ref<number>(9);
const showPreviewDialog = ref<boolean>(false);
const dialog = useDialog();
//const plantAssembler = new PlantAssembler();
const deviceAssembler = new DeviceAssembler();
const orderAssembler = new OrderAssembler();
const paymentAssembler = new PaymentAssembler();
const orderStore = useOrderStore();
const plantStore = usePlantStore();
const deviceStore = useDeviceStore();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

const router = useRouter();
const isLoading = ref<boolean>(false);

onMounted(() => {
  if (!plantStore.temporalPlant || Object.keys(plantStore.temporalPlant).length === 0) {
    createModal(
      dialog,
      CustomDialog,
      {
        title: 'Proceso de instalación incompleto',
        type: 'error',
        subtitle: 'Primero debes crear una planta/plantación previamente para seguir con este paso. Serás redirigido al inicio para comenzar el proceso.',
        severity: 'warning',
        redirectionPath: '/home'
      }
    );
  }
});


// Computed para verificar si se puede confirmar la instalación
const canConfirmInstallation = computed(() => {
  /* console.log('Selected Date:', selectedDate.value);
  console.log('Selected Time Slot:', selectedSlot.value); */
  return selectedDate.value !== null;
});

// Computed para obtener la información completa de la instalación
const installationInfo = computed(() => {
  const date = selectedDate.value;
  if (!date) return null;
  const hour = selectedSlot.value;


  const dateTime = dateBuilder(date, hour);

  return {
    date: dateTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    fullDateTime: (() => {
      let hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      const amPm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes.toString().padStart(2, '0')} ${amPm}`;
    })(),
  };
});

function dateBuilder(date: Date, hour: number): Date {
  const newDate = new Date(date);
  // Establecemos la hora, minutos, segundos y milisegundos a cero
  newDate.setHours(hour, 0, 0, 0);
  return newDate;
}

async function confirmInstallation() {
  if (!canConfirmInstallation.value) {
    alert('Por favor selecciona una fecha y hora para la instalación');
    return;
  }

  try {
    isLoading.value = true;

    if (!selectedDate.value || selectedSlot.value === null || selectedSlot.value === undefined) {
      alert('Error: No se pudo obtener la fecha y hora de instalación');
      return;
    }

    const plantResponse = await plantStore.createPlant({
      areaCoverage: plantStore.temporalPlant.areaCoverage,
      id: 0,
      image: plantStore.temporalPlant.image,
      isPlantation: plantStore.temporalPlant.isPlantation,
      lightThreshold: plantStore.temporalPlant.lightThreshold,
      name: plantStore.temporalPlant.name,
      temperatureThreshold: plantStore.temporalPlant.temperatureThreshold,
      type: plantStore.temporalPlant.type,
      userId: plantStore.temporalPlant.userId,
      waterThreshold: plantStore.temporalPlant.waterThreshold,
      wellnessStateId: plantStore.temporalPlant.wellnessStateId
    });

    //console.log('Plant created successfully:', plantResponse.id);

    const deviceRequest = deviceAssembler.toRequest({
      type: plantStore.temporalPlant.type,
      voltage: 20, // voltage por defecto de ahi updateara el especialista imagino)?
      plantId: plantResponse.id ?? 1
    });

    const deviceResponse = await deviceStore.createDevice(deviceRequest);

    //console.log('Device created successfully:', deviceResponse);

    const deviceQuantity = calculateDeviceQuantity(
      plantStore.temporalPlant.areaCoverage,
      plantStore.temporalPlant.isPlantation
    );

    // funcion para crear multiple cantida de dispositivos, de acuerdo al coverafqeq (esa wea)
    const createOrderDetails = () => {
      const details = [];

      const areaPerDevice = plantStore.temporalPlant.areaCoverage / deviceQuantity;

      for (let i = 0; i < deviceQuantity; i++) {
        details.push({
          deviceId: deviceResponse.id ?? 0,
          quantity: 1,
          unitPrice: 36,
          description: `Instalación de dispositivo IoT ${i + 1}/${deviceQuantity} para ${plantStore.temporalPlant.name}`,
          area: Number(areaPerDevice.toFixed(2))
        });
      }

      return details;
    };

    console.log('Device quantity calculated:', createOrderDetails());

    const orderRequest = orderAssembler.toRequest({
      action: plantStore.temporalPlant.isPlantation ? "Plantation" : "Plant",
      consumerId: plantStore.temporalPlant.userId,
      installationDate: dateBuilder(selectedDate.value, selectedSlot.value).toISOString(),
      details: createOrderDetails(),
    });

    console.log('Order request created:', orderRequest);

    // aqui se guarda en la base de datos la orden pero ya esta registrado en caso salga del flujo
    // va a poder pagarlo en el historial de ordenes
    const orderResponse = await orderStore.createOrder(orderRequest);
    // este de aqui es para seguir con el siguiente que es el de pago
    orderStore.setNewOrder({
      ...orderRequest,
      id: orderResponse.id
    });

    const paymentRequest = paymentAssembler.toRequest({
      paymentIntentId: "",
      paymentMethodId: "1",
      currency: 'usd',
      amount: orderRequest.details.reduce((total, detail) => total + (detail.unitPrice * detail.quantity), 0),
      paymentStatus: 'pending',
      userId: authStore.id,
      referenceId: orderResponse.id || 0, // ID de la orden
      referenceType: 'order' // aqui se especifica que es un pago de orden
    });

    console.log('Payment request created:', paymentRequest);

    // Guardamos el pago en la base de datos
    const paymentResponse = await paymentStore.createPayment(paymentRequest);
    // Guardamos el pago temporalmente para usarlo en el flujo de pago
    paymentStore.setTemporalPaymentId(paymentResponse.id);

    console.log('Payment created successfully:', paymentResponse.id);

    console.log('Order created successfully:', orderRequest);

    //Aca deberia crearse la orden


    //Aca el custom dialog debe darte la opcion de pagar o proceder a tu perfil donde se ve el estadop de tus ordenes (con estado pending due o algo asi)
    // Entonces si decides continuar se deberia generar una 

    // En la vista de especialista LA vista de KUNI q no esta porque le dije q lo iba a hacer poero el iam roto
  
    //EL especialista selecciona una orden y le cambia el estado, al hacer esto se le asigna su id de especialista a la orden
    //En esa misma vita deberia de haber un boton para probar la conexion con el servidor edge o configurarlo (Osea a donde apunta en la red local.)
    


    createModal(
      dialog,
      CustomDialog,
      {
        title: '¡Tu orden ha sido agendada!',
        subtitle: `El horario de instalación fue seleccionado con éxito. Ahora puedes realizar el pago para completar tu pedido. Puedes ver el estado en el panel de administración`,
        type: 'success',
        severity: 'success',
        redirectionPath: '/order-payment',
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
      alert(`Error al agendar la instalación: ${error.message}`);
    } else {
      alert('Ocurrió un error inesperado al agendar la instalación.');
    }
  } finally {
    isLoading.value = false;
  }
}

function cancelInstallation() {
  // limpiamos el baño
  plantStore.clearTemporalPlant();
  orderStore.clearNewOrder();
  deviceStore.clearSelectedDevice();
  router.push('/home');
}

function showPreviewPlantInformtion() {
  showPreviewDialog.value = true;
}
</script>

<template>
  <div class="flex flex-1 flex-row items-center justify-center">
    <div class="flex flex-col flex-1">
      <div class="timepicker-container">
        <calendar-order v-model="selectedDate" />
        <div class="flex flex-col flex-1 time-slot-picker">
          <div v-if="plantStore.temporalPlant" class="plant-preview-card" @click="showPreviewPlantInformtion()">
            <div class="card-content">
              <div class="plant-icon">
                <img v-if="plantStore.temporalPlant.image"
                  :src="createObjectURL(plantStore.temporalPlant.image as unknown as File)" alt="Plant image"
                  class="plant-image rounded-full w-12 h-12 object-cover" />
                <i v-else class="pi pi-rose text-green-600"></i>
              </div>
              <div class="plant-info">
                <h3>{{ plantStore.temporalPlant.name }}</h3>
                <p>{{ plantStore.temporalPlant.isPlantation ? 'Plantation' : 'Plant' }} • {{
                  plantStore.temporalPlant.type }}</p>
              </div>
              <div class="view-icon">
                <i class="pi pi-eye" style="font-size: 1.2rem;"></i>
              </div>
            </div>
          </div>
          <time-slots-order v-model="selectedSlot" />

          <!-- Información de la instalación seleccionada -->
          <div v-if="installationInfo" class="installation-summary">
            <h3>Resumen de Instalación</h3>
            <p><strong>Fecha:</strong> {{ installationInfo.date }}</p>
            <p><strong>Hora:</strong> {{ installationInfo.fullDateTime }}</p>
          </div>

          <div class="action-buttons">
            <Button class="cancel-button" @click="cancelInstallation" variant="outline">
              <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
              Cancel
            </Button>

            <Button class="confirm-button" @click="confirmInstallation" :disabled="!canConfirmInstallation"
              variant="primary">
              <svg class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
              Confirm Installation
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
    <ProgressSpinner style="width: 50px; height: 50px; color: #578257;" strokeWidth="5" fill="transparent"
      animationDuration=".5s" aria-label="Custom ProgressSpinner" />
  </div>
  <plant-preview-information :plant-data="plantStore.temporalPlant" v-model:visible="showPreviewDialog" />
</template>

<style scoped>
.installation-summary {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #10b981;
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
}

.installation-summary h3 {
  color: #064e3b;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.installation-summary p {
  color: #047857;
  font-size: 0.95rem;
  margin: 0.25rem 0;
}

.action-buttons {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.cancel-button,
.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #ffffff;
  color: #64748b;
  border-color: #cbd5e1;
}

.cancel-button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #475569;
}

.confirm-button {
  background: #426138;
  color: white;
  border-color: #426138;
  min-width: 180px;
}

.confirm-button:hover:not(:disabled) {
  background: #365530;
  border-color: #365530;
}

.confirm-button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-icon {
  width: 16px;
  height: 16px;
}

.timepicker-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
    min-width: auto;
  }
}

.plant-preview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plant-preview-card:hover {
  border-color: #578257;
  box-shadow: 0 2px 8px rgba(87, 130, 87, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.8rem;
}

.plant-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  background: #f0fdf4;
  border-radius: 50%;
  font-size: 1.2rem;
}

.plant-info {
  flex: 1;
}

.plant-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.plant-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.view-icon {
  color: #94a3b8;
  font-size: 1.1rem;
}

.plant-preview-card:hover .view-icon {
  color: #578257;
}
</style>