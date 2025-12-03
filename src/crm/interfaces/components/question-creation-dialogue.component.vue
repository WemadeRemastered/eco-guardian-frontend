<template>
  <div class="new-question-dialog">
    <h3>New Question</h3>
      <!-- Context info cuando hay planta específica -->
    <div v-if="isPlantSpecificView" class="context-info">
      <span> {{ selectedPlantName }}</span>
    </div>
    
    <!-- Form wrapper - siempre mostrar el formulario -->
    <div class="form-wrapper">
      <form class="form-content" @submit.prevent.stop="handleFormSubmit">
        <!-- Plant selector solo cuando NO hay planta específica -->
        <select v-if="!isPlantSpecificView" v-model="selectedPlantId" required name="plant_id">
          <option v-if="authStore.isEnterprise!" value="">Select plantation...</option>
          <option v-else value="">Select plant...</option>
          

          <option v-for="plant in userPlants" :key="plant.id" :value="plant.id">
            {{ plant.name }}
          </option>
        </select>

        <input 
          v-model="questionTitle" 
          placeholder="Question title" 
          />
        
        <textarea
          v-model="questionContent" 
          placeholder="Describe your question..." 
          required
        ></textarea>
        
        <input 
          ref="fileInput"
          type="file" 
          @change="handleFileUpload" 
          accept="image/*" 
          multiple 
          placeholder="Add images (optional)"          
        />
        
        <!-- Display selected images -->
        <div v-if="questionImages.length > 0" class="selected-images">
          <div class="image-list">
            <div v-for="(image, index) in questionImages" :key="index" class="image-item">
              <span class="image-name">{{ image.name }}</span>
              <button type="button" @click="removeImage(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="actions">
        <button type="button" @click="handleCancel" class="btn-cancel">
          Cancel
        </button>
        <button type="submit"
        :disabled="!canSubmit" class="btn-submit">
          Create
        </button>
      </div>
      </form>
      
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../../iam/interfaces/store/auth-store';
import { PlantResponse } from '../../../monitoring/domain/plant-response';
import { PlantService } from '../../../monitoring/infrastructure/services/plant.service';
import { useQuestionStore } from '../stores/question-store';
import type { CreateQuestionFormRequest } from '../../infrastructure/services/question-assembler.service';

const authStore = useAuthStore();
const questionStore = useQuestionStore();

const handleFormSubmit = async (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log('Form submit intercepted - no page reload!');
    
    try {
        await submitQuestion();
        console.log('Question submission completed successfully');
    } catch (error) {
        console.error('Error in handleFormSubmit:', error);
    }
};
const route = useRoute();
const plantService = new PlantService();

const props = defineProps({
  selectedPlantId: { type: Number, default: 0 },
  mode: { type: String, default: 'general' }
});

const emit = defineEmits(['question-created', 'cancel']);

// Estado simplificado
const questionTitle = ref('');
const questionContent = ref('');
const questionImages = ref<File[]>([]);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement>();
const selectedPlantId = ref<string>(
  route.params.plantId as string || '' // ← Desde la URL o vacío
);

// Computed properties
const isPlantSpecificView = computed(() => !!route.params.plantId || !!props.selectedPlantId);

const canSubmit = computed(() => {
  const hasTitle = questionTitle.value.trim().length > 0;
  const hasContent = questionContent.value.trim().length > 0;
  const hasPlantId = isPlantSpecificView.value || selectedPlantId.value;
  
  return hasTitle && hasContent && hasPlantId && !isSubmitting.value;
});



let userPlants = ref<PlantResponse[]>([]);

onMounted(async () => {  
    
    if (!authStore.user || !authStore.user.id) {
        console.error('No user ID available');
        return;
    }
    
    try {
        const response = await plantService.getPlantsByUserId(authStore.id);
        if (response && response.data && Array.isArray(response.data)) {
            userPlants.value = response.data;

        } else if (Array.isArray(response)) {
            userPlants.value = response;
        } else {
            console.warn('Unexpected response structure:', response);
            userPlants.value = [];
        }
    } catch (error) {
        console.error('Error message:', (error as Error)?.message || 'Unknown error');
        userPlants.value = [];
    }
  });


//Falta que monitoring tenga un get plants by user ID

const selectedPlantName = computed(() => {
  const plant = userPlants.value.find(p => p.id == parseInt(selectedPlantId.value));
  return plant ? plant.name : 'Plant';
});

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const submitQuestion = async () => {
  
  if (!canSubmit.value) {
    console.log('Cannot submit - validation failed');
    return;
  }
  isSubmitting.value = true;  
  try {
    // Prepare the FormData request with proper interface
    const questionData: CreateQuestionFormRequest = {
      title: questionTitle.value.trim(),
      content: questionContent.value.trim(),
      plantId: parseInt(selectedPlantId.value),
      userId: authStore.id,
      images: questionImages.value.length > 0 ? questionImages.value : undefined,
    };
    
    console.log('🚀 Question data prepared:', {
      title: questionData.title,
      content: questionData.content,
      plantId: questionData.plantId,
      userId: questionData.userId,
      images: questionData.images,
      imagesLength: questionData.images?.length,
      imagesDetails: questionData.images?.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      }))
    });
    
    const success = await questionStore.createQuestion(questionData);
    
    if (success) {
      console.log('Question created successfully');
      resetForm();
      emit('question-created');
    } else {
      console.error('Error creating question:', questionStore.error);
    }
    
  } catch (error) {
    console.error('Caught error in submitQuestion:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  questionTitle.value = '';
  questionContent.value = '';
  questionImages.value = [];
  
  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  if (!isPlantSpecificView.value) {
    selectedPlantId.value = '';
  }
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  console.log('📸 File upload event triggered');
  console.log('📸 Input element:', input);
  console.log('📸 Input files:', input.files);
  
  if (input.files && input.files.length > 0) {
    const selectedFiles = Array.from(input.files).slice(0, 3);
    questionImages.value = selectedFiles;
    
    console.log('📸 Files selected:', selectedFiles.length);
    console.log('📸 Files details:', selectedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    })));
    
    if (input.files.length > 3) {
      console.warn('📸 Max 3 images allowed, selected first 3');
    }
  } else {
    console.log('📸 No files selected');
    questionImages.value = [];
  }
  
  console.log('📸 Current questionImages.value:', questionImages.value);
};

const removeImage = (index: number) => {
  questionImages.value.splice(index, 1);
};
</script>

<style scoped>
@import url('../../../style.css');

.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1; 
}

.new-question-dialog {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  width: 100%;  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.new-question-dialog h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  text-align: start;
}

.context-info {
  background: #f0f9ff;
  border: 1px solid var(--color-secondary);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-secondary);
  font-weight: 500;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  min-width: 0; /* Permite que flex-children se encojan */  
  flex: 1;
}

.form-content input,
.form-content select,
.form-content textarea {
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  background: #fafafa;
}

.form-content input:focus,
.form-content select:focus,
.form-content textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  background: #ffffff;
}

.form-content textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  resize: none; 
  flex: 1; 
}

.form-content input[type="file"] {
  padding: 8px 12px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  cursor: pointer;
  font-size: 0.8rem;
}

.form-content input[type="file"]:hover {
  border-color: var(--color-secondary);
  background: #eff6ff;
}

.selected-images {
  margin-top: 8px;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.85rem;
}

.image-name {
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-submit {
  background: var(--color-primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* Select dropdown arrow */
.form-content select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

/* Responsive */
@media (max-width: 640px) {
  .new-question-dialog {
    margin: 16px;
    padding: 16px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions button {
    width: 100%;
  }
}
</style>