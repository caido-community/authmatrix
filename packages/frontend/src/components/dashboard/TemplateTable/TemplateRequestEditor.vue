<template>
  <div class="template-request-editor">
    <div class="editor-header">
      <h3>Edit Template Request</h3>
      <div class="editor-actions">
        <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
        <button
          class="btn btn-primary"
          :disabled="!hasChanges"
          @click="saveRequest"
        >
          Save Changes
        </button>
      </div>
    </div>

    <div class="editor-content">
      <div ref="requestEditorRef" class="request-editor-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TemplateDTO } from "shared";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useTemplateService } from "@/services/templates";

interface Props {
  template: TemplateDTO;
  onClose: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  saved: [template: TemplateDTO];
}>();

const sdk = useSDK();
const templateService = useTemplateService();

const requestEditorRef = ref<HTMLElement>();
let requestEditor: unknown = undefined;
let originalRequestRaw: string | undefined = undefined;
let currentRequestRaw: string | undefined = undefined;
const hasChanges = ref(false);

const initializeEditor = async () => {
  if (!requestEditorRef.value) return;

  try {
    console.log("=== DEBUGGING EDITOR ISSUE ===");
    console.log("Template ID:", props.template.id);
    console.log("Request ID:", props.template.requestId);

    // Get the current request through the backend API
    const result = await templateService.getRequestResponse(
      props.template.requestId,
    );

    if (result.type === "Err") {
      console.error("Failed to get request:", result.error);
      sdk.window.showToast(`Could not load request: ${result.error}`, {
        variant: "error",
      });
      emit("close");
      return;
    }

    const requestData = result.request;
    console.log("Request data loaded:", requestData);

    // Store the raw request data for comparison
    originalRequestRaw = requestData.raw;
    currentRequestRaw = requestData.raw;

    // Create a simple textarea editor instead of using the problematic Caido editor
    console.log("Creating custom textarea editor...");
    
    const textarea = document.createElement('textarea');
    textarea.value = requestData.raw;
    textarea.style.width = '100%';
    textarea.style.height = '100%';
    textarea.style.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", monospace';
    textarea.style.fontSize = '14px';
    textarea.style.lineHeight = '1.5';
    textarea.style.padding = '1rem';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.backgroundColor = 'transparent';
    textarea.style.color = 'inherit';
    textarea.style.boxSizing = 'border-box';
    
    // Make it fully editable
    textarea.readOnly = false;
    textarea.disabled = false;
    textarea.setAttribute('contenteditable', 'true');
    
    // Store reference to the textarea
    requestEditor = {
      getElement: () => textarea,
      getEditorView: () => ({
        dispatch: () => {},
        state: { doc: { length: textarea.value.length } }
      }),
      onChange: (callback) => {
        textarea.addEventListener('input', () => {
          callback(textarea.value);
        });
      },
      dispose: () => {
        textarea.remove();
      }
    };
    
    requestEditorRef.value.appendChild(textarea);
    console.log("Custom textarea editor created and mounted");
    
    // Focus the textarea
    setTimeout(() => {
      textarea.focus();
      console.log("Textarea focused");
    }, 100);

    console.log("Custom textarea editor setup complete");

    // Listen for changes
    if (requestEditor.onChange) {
      requestEditor.onChange((newRaw: string) => {
        console.log("Editor content changed:", newRaw.substring(0, 50) + "...");
        currentRequestRaw = newRaw;
        hasChanges.value = newRaw !== originalRequestRaw;
      });
    }

    console.log("=== EDITOR INITIALIZATION COMPLETE ===");
  } catch (error) {
    console.error("Failed to initialize request editor:", error);
    sdk.window.showToast(`Failed to initialize request editor: ${error}`, {
      variant: "error",
    });
    emit("close");
  }
};

const saveRequest = async () => {
  if (currentRequestRaw === undefined) return;

  try {
    await templateService.updateTemplateRequestRaw(
      props.template.id,
      currentRequestRaw,
    );
    emit("saved", props.template);
    emit("close");
  } catch (error) {
    console.error("Failed to save request:", error);
    sdk.window.showToast("Failed to save request changes", {
      variant: "error",
    });
  }
};

const cancelEdit = () => {
  emit("close");
};

onMounted(() => {
  initializeEditor();
});

onUnmounted(() => {
  if (requestEditor && requestEditor.dispose) {
    requestEditor.dispose();
  }
});

watch(
  () => props.template,
  () => {
    if (requestEditor !== undefined) {
      initializeEditor();
    }
  },
);
</script>

<style scoped>
.template-request-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-elevated);
}

.editor-header h3 {
  margin: 0;
  color: var(--color-text-primary);
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.request-editor-container {
  flex: 1;
  overflow: hidden;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: var(--color-background-hover);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background-hover);
}
</style>
