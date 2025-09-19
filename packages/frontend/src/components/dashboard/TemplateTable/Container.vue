<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import type { RoleDTO, RuleStatusDTO, TemplateDTO, UserDTO } from "shared";
import { computed, ref } from "vue";

import RuleStatus from "./RuleStatus.vue";
import TemplateRequestEditor from "./TemplateRequestEditor.vue";

import { useAnalysisService } from "@/services/analysis";
import { useSettingsService } from "@/services/settings";
import { useTemplateService } from "@/services/templates";
import {
  type RoleState,
  type SettingsState,
  type TemplateState,
  type UserState,
} from "@/types";

const props = defineProps<{
  state: TemplateState & { type: "Success" };
  userState: UserState & { type: "Success" };
  roleState: RoleState & { type: "Success" };
  settingsState: SettingsState & { type: "Success" };
}>();

const selectedStatusFilter = ref<RuleStatusDTO | "All">("All");
const editingTemplate = ref<TemplateDTO | undefined>(undefined);

const filteredTemplates = computed(() => {
  if (selectedStatusFilter.value === "All") return props.state.templates;

  return props.state.templates.filter((template) =>
    template.rules.some((rule) => rule.status === selectedStatusFilter.value),
  );
});

const handleStatusFilterChange = (status: RuleStatusDTO | "All") => {
  selectedStatusFilter.value = status;
};

const getRoleValue = (template: TemplateDTO, role: RoleDTO) => {
  const rule = template.rules.find(
    (rule) => rule.type === "RoleRule" && rule.roleId === role.id,
  );
  return rule?.hasAccess ?? false;
};

const getRoleStatus = (template: TemplateDTO, role: RoleDTO) => {
  const rule = template.rules.find(
    (rule) => rule.type === "RoleRule" && rule.roleId === role.id,
  );
  return rule?.status ?? "Untested";
};

const getUserValue = (template: TemplateDTO, user: UserDTO) => {
  const rule = template.rules.find(
    (rule) => rule.type === "UserRule" && rule.userId === user.id,
  );
  return rule?.hasAccess ?? false;
};

const getUserStatus = (template: TemplateDTO, user: UserDTO) => {
  const rule = template.rules.find(
    (rule) => rule.type === "UserRule" && rule.userId === user.id,
  );
  return rule?.status ?? "Untested";
};

const service = useTemplateService();
const toggleRole = (template: TemplateDTO, role: RoleDTO) => {
  service.toggleTemplateRole(template.id, role.id);
};

const toggleUser = (template: TemplateDTO, user: UserDTO) => {
  service.toggleTemplateUser(template.id, user.id);
};

const checkAllTemplatesForRole = (role: RoleDTO) => {
  service.checkAllTemplatesForRole(role.id);
};

const checkAllTemplatesForUser = (user: UserDTO) => {
  service.checkAllTemplatesForUser(user.id);
};

const deleteTemplate = (template: TemplateDTO) => {
  service.deleteTemplate(template.id);
};

const clearTemplates = () => {
  service.clearTemplates();
};

const settingsService = useSettingsService();
const setAutoCaptureRequests = (value: "off" | "all" | "inScope") => {
  settingsService.setAutoCaptureRequests(value);
};

const getAutoCaptureRequestLabel = (value: "off" | "all" | "inScope") => {
  switch (value) {
    case "off":
      return "Off";
    case "all":
      return "All";
    case "inScope":
      return "In Scope";
  }
};

const analysisService = useAnalysisService();
const runAnalysis = () => {
  analysisService.runAnalysis();
};

const fileInput = ref<HTMLInputElement | undefined>(undefined);
const overrideHost = ref<string>("");

const onClickImport = () => {
  fileInput.value?.click();
};

const onFileSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement | undefined;
  const files = target?.files ?? undefined;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (!file) return;
  const text = await file.text();
  await service.importFromSwagger(text, overrideHost.value.trim() || undefined);
  if (fileInput.value) fileInput.value.value = "";
  overrideHost.value = "";
};

const editTemplate = (template: TemplateDTO) => {
  editingTemplate.value = template;
};

const closeEditor = () => {
  editingTemplate.value = undefined;
};

const sendToReplay = async (template: TemplateDTO) => {
  await service.sendToReplay(template.id);
};

const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'r') {
    // Only handle if the DataTable is focused or if no other component has handled it
    const target = event.target as HTMLElement;
    const isInRequestPreview = target.closest('.cm-editor') || target.closest('[data-request-preview]');
    
    if (!isInRequestPreview) {
      event.preventDefault();
      if (selection.value) {
        await sendToReplay(selection.value);
      }
    }
  }
};

const handleContextMenu = async (event: MouseEvent) => {
  event.preventDefault();
  
  // Create a simple context menu
  const contextMenu = document.createElement('div');
  contextMenu.className = 'fixed bg-surface-700 border border-surface-600 rounded shadow-lg z-50';
  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.style.top = `${event.clientY}px`;
  
  const sendToReplayItem = document.createElement('div');
  sendToReplayItem.className = 'px-4 py-2 hover:bg-surface-600 cursor-pointer text-sm';
  sendToReplayItem.innerHTML = '<i class="fas fa-play mr-2"></i>Send to Replay';
  
  sendToReplayItem.addEventListener('click', async () => {
    if (selection.value) {
      await sendToReplay(selection.value);
    }
    document.body.removeChild(contextMenu);
  });
  
  contextMenu.appendChild(sendToReplayItem);
  document.body.appendChild(contextMenu);
  
  // Remove context menu when clicking elsewhere
  const removeMenu = () => {
    if (document.body.contains(contextMenu)) {
      document.body.removeChild(contextMenu);
    }
    document.removeEventListener('click', removeMenu);
  };
  
  setTimeout(() => {
    document.addEventListener('click', removeMenu);
  }, 100);
};

const onTemplateSaved = (template: TemplateDTO) => {
  // The template service already updates the store, so we just close the editor
  closeEditor();
};

const selection = computed({
  get: () => {
    const selectionState = analysisService.selectionState;
    if (selectionState.type === "None") return undefined;
    const templateId = selectionState.templateId;
    return props.state.templates.find((t) => t.id === templateId);
  },
  set: (template) => {
    analysisService.selectResult(template?.id);
  },
});

const isAnalyzing = computed(() => {
  return analysisService.jobState.type === "Analyzing";
});

const defaultPorts = [80, 443];

const getHostColumnValue = (template: TemplateDTO) => {
  let host = template.meta.host;
  if (
    !defaultPorts.includes(template.meta.port) ||
    (template.meta.port === 443 && !template.meta.isTls) ||
    (template.meta.port === 80 && template.meta.isTls)
  ) {
    host += `:${template.meta.port}`;
  }
  return host;
};

const getPathColumnValue = (template: TemplateDTO) =>
  template.meta.path.length > 64
    ? template.meta.path.slice(0, 64) + "..."
    : template.meta.path;

const onTemplateUpdate = (
  template: TemplateDTO,
  field: string,
  newValue: unknown,
) => {
  service.updateTemplate(template.id, { ...template, [field]: newValue });
};

const isTemplateScanning = (template: TemplateDTO) => {
  return props.state.scanningTemplateIds.has(template.id);
};

const getRowClass = (data: TemplateDTO) => {
  return isTemplateScanning(data) ? "scanning-row" : "";
};

const isSmallScreen = useMediaQuery("(max-width: 1150px)");
</script>
<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{ body: { class: 'flex-1 min-h-0' }, content: { class: 'h-full' } }"
    >
      <template #header>
        <div
          :class="[
            'header-container p-4 flex justify-between gap-8',
            { 'flex-col gap-4': isSmallScreen, 'flex-row': !isSmallScreen },
          ]"
        >
          <div
            :class="[
              'header-info flex flex-col',
              { 'w-full': isSmallScreen, 'w-[40%]': !isSmallScreen },
            ]"
          >
            <h2 class="text-lg font-semibold">Templates</h2>
            <p class="text-sm text-gray-400">
              Add template requests to the queue for analysis.
            </p>
            <p class="text-sm text-gray-400">
              Specify which roles and users should have access to each resource.
              <br />
              Configure a regex to determine if the authentication was
              successful.
            </p>
          </div>
          <div class="flex items-end gap-4">
            <div class="flex flex-col gap-2">
              <div
                v-tooltip="
                  'Check this box if you want analysis to automatically run in the background.'
                "
                class="flex items-center gap-2"
              >
                <Checkbox
                  input-id="auto-analysis"
                  :model-value="settingsState.settings.autoRunAnalysis"
                  binary
                  @change="() => settingsService.toggleAutoRunAnalysis()"
                />
                <label for="auto-analysis" class="text-sm text-gray-400"
                  >Auto-run analysis</label
                >
              </div>
              <label class="text-sm text-gray-400">Auto-capture requests</label>
              <SelectButton
                v-tooltip="
                  'Automatically add each intercepted request to the testing queue for analysis.'
                "
                :model-value="settingsState.settings.autoCaptureRequests"
                :options="['off', 'all', 'inScope']"
                :option-label="getAutoCaptureRequestLabel"
                @update:model-value="setAutoCaptureRequests"
              />
            </div>
            <div
              v-tooltip="
                'Filter table by the status value of at least one role/user.'
              "
              class="flex flex-col gap-2"
            >
              <label class="text-sm text-gray-400"
                >Filter table by status</label
              >
              <SelectButton
                :options="['All', 'Enforced', 'Bypassed']"
                :model-value="selectedStatusFilter"
                placeholder="Filter by Status"
                @update:model-value="handleStatusFilterChange"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm text-gray-400">Override Host (optional)</label>
              <InputText
                v-model="overrideHost"
                placeholder="e.g., api.example.com"
                v-tooltip="'Override the host from the Swagger file. Leave empty to use the host from the file.'"
              />
            </div>
            <Button
              v-tooltip="'Import Swagger/OpenAPI JSON to create templates.'"
              label="Import Swagger"
              icon="fas fa-file-import"
              @click="onClickImport"
            />
            <input
              ref="fileInput"
              type="file"
              accept="application/json,.json"
              class="hidden"
              @change="onFileSelected"
            />
            <Button
              v-tooltip="'Clear all template entries.'"
              label="Clear All"
              @click="clearTemplates"
            />

            <Button
              v-tooltip="'Run the analysis on the current requests.'"
              label="Analyze"
              :loading="isAnalyzing"
              :disabled="
                userState.users.length === 0 || state.templates.length === 0
              "
              @click="runAnalysis"
            />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          v-model:selection="selection"
          :value="filteredTemplates"
          :row-class="getRowClass"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          edit-mode="cell"
          selection-mode="single"
          v-tooltip="'Right-click or press Ctrl+R to send to Replay'"
          @cell-edit-complete="
            ({ data, field, newValue }) =>
              onTemplateUpdate(data, field, newValue)
          "
          @contextmenu="handleContextMenu"
          @keydown="handleKeyDown"
          tabindex="0"
        >
          <Column field="method" header="Method" class="w-[85px]">
            <template #body="{ data }">
              {{ data.meta.method }}
            </template>
          </Column>

          <Column header="Host" class="w-[230px] overflow-hidden">
            <template #body="{ data }">
              {{ getHostColumnValue(data) }}
            </template>
          </Column>

          <Column header="Path" class="w-[500px] whitespace-nowrap">
            <template #body="{ data }">
              {{ getPathColumnValue(data) }}
            </template>
          </Column>

          <Column
            field="authSuccessRegex"
            header="Auth Success Regex"
            class="w-[200px] min-w-[200px]"
          >
            <template #editor="{ data }">
              <InputText v-model="data.authSuccessRegex" />
            </template>
          </Column>

          <Column v-for="role in roleState.roles" :key="role.id">
            <template #header>
              <div class="flex items-center gap-2">
                <span>{{ role.name }}</span>
                <Button
                  v-tooltip="`Check all templates for ${role.name}`"
                  icon="fas fa-check-square"
                  text
                  severity="success"
                  size="small"
                  @click="() => checkAllTemplatesForRole(role)"
                />
              </div>
            </template>
            <template #body="{ data }">
              <div class="flex items-center gap-4">
                <Checkbox
                  v-tooltip="
                    'Check this box if this role should have access to this resource.'
                  "
                  :model-value="getRoleValue(data, role)"
                  binary
                  @change="() => toggleRole(data, role)"
                />
                <RuleStatus :status="getRoleStatus(data, role)" />
              </div>
            </template>
          </Column>

          <Column v-for="user of userState.users" :key="user.id">
            <template #header>
              <div class="flex items-center gap-2">
                <span>{{ user.name }}</span>
                <Button
                  v-tooltip="`Check all templates for ${user.name}`"
                  icon="fas fa-check-square"
                  text
                  severity="success"
                  size="small"
                  @click="() => checkAllTemplatesForUser(user)"
                />
              </div>
            </template>
            <template #body="{ data }">
              <div class="flex items-center gap-4">
                <Checkbox
                  v-tooltip="
                    'Check this box if this user should have access to this resource.'
                  "
                  :model-value="getUserValue(data, user)"
                  binary
                  @change="() => toggleUser(data, user)"
                />
                <RuleStatus :status="getUserStatus(data, user)" />
              </div>
            </template>
          </Column>

          <Column header="">
            <template #body="{ data }">
              <div class="flex justify-end gap-2">
                <Button
                  icon="fas fa-edit"
                  text
                  severity="info"
                  size="small"
                  @click="() => editTemplate(data)"
                />
                <Button
                  icon="fas fa-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="() => deleteTemplate(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Template Request Editor Modal -->
    <div
      v-if="editingTemplate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="closeEditor"
    >
      <div
        class="w-full max-w-6xl h-5/6 bg-surface-700 rounded-lg shadow-lg"
        @click.stop
      >
        <TemplateRequestEditor
          :template="editingTemplate"
          @close="closeEditor"
          @saved="onTemplateSaved"
        />
      </div>
    </div>
  </div>
</template>

<style>
.scanning-row {
  background: linear-gradient(
    90deg,
    rgba(from var(--c-bg-secondary) r g b / 0.1) 0%,
    rgba(from var(--c-bg-secondary) r g b / 0.05) 100%
  );
  border-left: 3px solid #22c55e;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
