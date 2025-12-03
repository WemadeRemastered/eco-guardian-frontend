<template>
   <div class="question-card" @click="handleClick">
        <div class="flex flex-row justify-between items-center">
            <h3 class="question-title text-lg font-bold">{{ displayQuestion.displayTitle }}</h3>
            <span class="status-badge" :class="`status-${question.status.toLowerCase()}`">{{ formatStatus(question.status) }}</span>
        </div>
        <p class="question-content text-sm">{{ question.content }}</p>
        <div class="flex items-center gap-2 mt-2">
            <span class="text-sm font-medium">Created:</span>
            <span class="text-sm">{{ displayQuestion.formattedDate }}</span>
        </div>
    </div>

    <!-- Dialog for displaying question details and expert response -->

    <Dialog 
      v-model:visible="visible" 
      modal 
      :header="displayQuestion.displayTitle" 
      class="question-dialog"
      :dismissableMask="true"
    >
      <!-- Content section -->
      <div class="dialog-content">
          <p class="text-surface-500 dark:text-surface-400 leading-relaxed">
            "{{ question.content }}"
          </p>
            <span class="text-sm text-gray-600">Created: {{ displayQuestion.formattedDate }}</span>

        <div v-if="question.image_urls && question.image_urls.length > 0" class="images-section mb-6">
          <h4 class="images-title">Attached Images</h4>
          
          <div class="images-grid">
            <div v-for="(imageUrl, index) in question.image_urls" :key="index" class="image-wrapper">
              <Image alt="Question Image" preview class="custom-image">
                <template #previewicon>
                  <i class="pi pi-search-plus"></i>
                </template>
                <template #image>
                  <img 
                    :src="getImageSrc(imageUrl)" 
                    :alt="`Question image ${index + 1}`"
                    class="thumbnail-image"
                    @error="handleImageError"
                    loading="lazy"
                  /> 
                </template>
                <template #original="slotProps">
                  <img 
                    :src="getImageSrc(imageUrl)" 
                    :alt="`Question image ${index + 1}`"
                    @error="handleImageError"
                    class="preview-image" 
                    @click="slotProps.previewCallback" 
                  />
                </template>
              </Image>
            </div>
          </div>
        </div>
        <!-- No images state -->
        <div v-else class="no-images-state mb-6">
          <p class="text-gray-500 text-sm">No images attached to this question</p>
        </div>
        <!-- Specialist response section -->
        <div class="specialist-section">
          <div class="specialist-header mb-4">
            <h4 class="specialist-title">The question is currently: {{ question.status.toUpperCase() }}</h4>
          </div>

          <!-- Loading state for answer -->
          <div v-if="answerLoading" class="answer-content">
            <i class="pi pi-spin pi-spinner"></i>
            <span class="ml-2">Loading response...</span>
          </div>

          <!-- Show answer when available -->
          <div v-else-if="questionAnswer" class="answer-content">
            <h2 class="answer-text">{{ questionAnswer.answerText }}</h2>
            <p v-if="questionAnswer.createdAt">Created at: {{ questionAnswer.createdAt }}</p>
          </div>

          <!-- No answer yet -->
          <div v-else class="answer-content">
            <h2>No answer yet</h2>
            <p class="text-sm text-gray-600">This question has not been answered by a specialist yet.</p>
          </div>

        </div>
      </div>
    </Dialog>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import type { Question } from '../../../crm/domain/model/question.entity';
import { QuestionAssemblerService } from '../../infrastructure/services/question-assembler.service';
import {Dialog} from 'primevue';
import {Image} from 'primevue';
import { CrmService } from '../../infrastructure/services/crm.service';
import type { Ref } from 'vue';
import { useAuthStore } from '../../../iam/interfaces/store/auth-store';

let visible = ref(false);
//let expertResponse = ref('');
const authStore = useAuthStore();

// Local representation of the backend answer mapped to friendly names
interface QuestionResponse {
  id: number;
  questionId: number;
  specialistId: number;
  answerText: string;
  createdAt: string;
}

let questionAnswer: Ref<QuestionResponse | null> = ref<QuestionResponse | null>(null);
const answerLoading = ref(false);

const emit = defineEmits<{
  click: [question: Question];
  expertResponse: [questionId: number, response: string];
}>();
const props = defineProps<{
  question: Question;
}>();

const getImageSrc = (url: string) => {
  // Verificar si la URL tiene http o https
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
  }
  return url;
};

const handleImageError = (event: Event) => {
  // Fallback adicional si la imagen falla al cargar
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';
  }
};


// Transform the question prop to a display model using the assembler service
const displayQuestion = QuestionAssemblerService.toDisplayModel(props.question);

// Async function to fetch the answer and map fields returned by backend
const getQuestionAnswer = async (questionId: number): Promise<void> => {
  const consultingService = new CrmService();
  answerLoading.value = true;
  questionAnswer.value = null;

  try {
    const response: any = await consultingService.getAnswersByQuestionId(questionId);
    console.log(response);
    let payload: any = response;

   while (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
      payload = payload.data;
    }

    let data: any = null;
    if (Array.isArray(payload)) {
      data = payload.length > 0 ? payload[0] : null;
    } else {
      data = payload || null;
    }
    
    if (!data) {
      questionAnswer.value = null;
      return;
    }
    console.log(data?.answerText ?? data?.answer_text ?? data?.answer);

    const mapped: QuestionResponse = {
      id: Number(data.id || data.answer_id || 0),
      questionId: Number(data.question_id || data.questionId || data.question || 0),
      specialistId: Number(data.specialist_id || data.specialistId || 0),
      answerText: String(data.answerText || data.answer_text || data.answer || ''),
      createdAt: data.created_at ? new Date(data.created_at).toLocaleString() : (data.createdAt ? new Date(data.createdAt).toLocaleString() : '')
    };

    questionAnswer.value = mapped;

    console.log('[getQuestionAnswer] mapped questionAnswer:', questionAnswer.value);
  } catch (error) {
    console.error('Error fetching question answer:', error);
    questionAnswer.value = null;
  } finally {
    answerLoading.value = false;
  }
};

const handleClick = () => {  
  emit('click', props.question);
  if(authStore.isSpecialist){
    return props.question;
  }
  visible.value = true;
  void getQuestionAnswer(props.question.id);
};


const formatStatus = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    default:
      return status;
  }
};

</script>

<style>
@import url('../../../style.css');
.question-card {
    background-color: #ffffff;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.p-dialog{
    max-width: 60%;
}

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}

.status-pending {
    background-color: #fef3c7;
    color: #f59e0b;
}

.status-resolved {
    background-color: #d1fae5;
    color: #10b981;
}

.status-closed {
    background-color: #fad1d1;
    color: #f4422a;
}

.answer-content {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f0f9ff;
    border-radius: 0.5rem;
    border: 1px solid #dbeafe;
}

.question-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background-color: var(--color-gray-100);
    transform: translateY(-1px);
    cursor: pointer;
}

.question-card:active {
    transform: translateY(-1px) scale(0.95);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.question-dialog {
  --dialog-padding: 1.5rem;
  max-width: 70%; 
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.question-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 70%; /* or any width you prefer */
}



.question-content {
  margin-top: 0.5rem;
  color: #4b5563; /* Tailwind gray-700 */
  font-size: 0.875rem; /* Tailwind text-sm */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 80%; /* or any width you prefer */
}

.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* 🔧 IMAGES SECTION */
.images-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.images-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}




.image-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thumbnail-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s ease;
}

.thumbnail-image:hover {
  border-color: #059669;
}

.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

.image-details {
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.image-url-summary {
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: #6b7280;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.image-url-summary:hover {
  background: #f3f4f6;
}

.image-url {
  display: block;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.7rem;
  color: #4b5563;
  word-break: break-all;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.no-images-state {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
}


.specialist-section {
  border-top: 2px solid #e5e7eb;
  padding-top: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.specialist-header {
  text-align: center;
}

.specialist-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #059669;
  margin: 0;
}

.specialist-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.response-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.character-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: -0.5rem;
}

.response-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

</style>