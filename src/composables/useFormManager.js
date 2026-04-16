import { ref, computed } from 'vue';
import { useVisitorStore } from '@/stores/visitor';

/**
 * CONTROLLER: useFormManager
 * Manages the data collection portal logic.
 * Handles validation and submits the "Virtual Logbook" data to the Model.
 */
export function useFormManager() {
  const visitorStore = useVisitorStore();
  
  const formData = ref({
    name: '',
    address: '',
    affiliations: '',
    gender: '',
    clientType: '',
    email: '',
    feedback: ''
  });

  const errors = ref({});
  const isSubmitting = ref(false);

  const isFormValid = computed(() => {
    return formData.value.name.length > 2 && 
           formData.value.address.length > 2 &&
           formData.value.email.includes('@');
  });

  const submitForm = async () => {
    if (!isFormValid.value) {
      errors.value = { form: 'Please complete all required fields correctly.' };
      return;
    }

    isSubmitting.value = true;
    
    // Simulate a brief network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    visitorStore.registerVisitor(formData.value);
    
    isSubmitting.value = false;
    console.log('CONTROLLER: Logbook entry recorded.');
  };

  return {
    formData,
    errors,
    isSubmitting,
    isFormValid,
    submitForm
  };
}
