<template>
  <Dialog :visible="visible" @update:visible="val => emit('update:visible', val)" modal :header="t('editProfile')"
    :style="{ width: '420px', maxWidth: '95vw', padding: 0 }" @hide="onClose" class="custom-profile-dialog">
    <div class="flex flex-col gap-5 p-6">
      <div class="flex flex-col items-center gap-2">
        <div class="relative group">
          <img :src="avatarPreview || '/placeholder-avatar.jpg'" alt="Avatar Preview"
            class="w-20 h-20 rounded-full object-cover border-2 border-emerald-200 shadow" />
          <label class="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center"
            style="width: 2.5rem; height: 2.5rem;">
            <i class="pi pi-camera text-base"></i>
            <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
          </label>
        </div>
        <span class="text-xs text-gray-500">{{ t('uploadPhoto') }}</span>
      </div>
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('name') }}</label>
          <InputText v-model="form.name" class="w-full"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('lastName') }}</label>
          <InputText v-model="form.lastName" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('address') }}</label>
          <InputText v-model="form.address" class="w-full" />
        </div>
      </div>
      <div v-if="errorMessage" class="text-red-600 text-sm mb-2 text-center">{{ errorMessage }}</div>
      <div class="flex justify-end gap-2 mt-4">
        <Button :label="t('cancel')" type="button" severity="secondary" @click="onClose" outlined />
        <Button :label="t('save')" type="button" :loading="loading" @click="onSubmit" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, watch, defineProps, defineEmits, reactive} from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { ProfileStore } from '../store/profile-store';

const props = defineProps({
  visible: Boolean,
  profile: Object,
  currentLocale: Object,
  t: { type: Function, required: true }  //Translation function, e.g. i18n.t //THIS IS REQUIRED
  
});
const emit = defineEmits(['update:visible', 'updated']);

const form = reactive({
  name: '',
  lastName: '',
  address: '',
  avatarUrl: null
});
const loading = ref(false);
const avatarFile = ref<File|null>(null);
const avatarPreview = ref<string|null>(null);
const errorMessage = ref('');
const store = ProfileStore();

function onClose() {
  emit('update:visible', false);
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  avatarFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.value = null;
  }
}

watch(() => props.profile, (val) => {
  if (val) {
    form.name = val.name || '';
    form.lastName = val.lastName || '';
    form.address = val.address || '';
    form.avatarUrl = val.avatarUrl || '';
    avatarPreview.value = val.avatarUrl || null;
    avatarFile.value = null;
  }
}, { immediate: true });

async function onSubmit() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await store.updateProfile(props.profile?.id, {
      Name: form.name,
      LastName: form.lastName,
      Address: form.address,
      AvatarUrl:  avatarFile.value ? avatarFile.value : null
    });
    emit('updated');
    emit('update:visible', false);
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.errors) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(' ');
    } else {
      errorMessage.value = 'An unexpected error occurred.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.custom-profile-dialog .p-dialog-header {
  display: none !important;
}
.custom-profile-dialog .p-dialog-content {
  padding: 0 !important;
}
@media (max-width: 600px) {
  .custom-profile-dialog form {
    padding: 1rem !important;
  }
  .custom-profile-dialog .w-20 {
    width: 4.5rem !important;
    height: 4.5rem !important;
  }
}
</style>
