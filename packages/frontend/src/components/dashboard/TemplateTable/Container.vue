<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import type { RoleDTO, RuleStatusDTO, TemplateDTO, UserDTO } from "shared";
import { computed, ref } from "vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import RuleStatus from "./RuleStatus.vue";

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

const selectedTemplate = computed({
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

const editingTemplateId = ref<string | undefined>(undefined);
const editingField = ref<string | undefined>(undefined);
const editingValue = ref<string>("");

const startEditing = (template: TemplateDTO, field: string) => {
  editingTemplateId.value = template.id;
  editingField.value = field;
  editingValue.value =
    ((template as Record<string, unknown>)[field] as string) ?? "";
};

const finishEditing = (template: TemplateDTO) => {
  if (
    editingField.value !== undefined &&
    editingTemplateId.value === template.id
  ) {
    service.updateTemplate(template.id, {
      ...template,
      [editingField.value]: editingValue.value,
    });
  }
  editingTemplateId.value = undefined;
  editingField.value = undefined;
};

const isEditing = (template: TemplateDTO, field: string) => {
  return (
    editingTemplateId.value === template.id && editingField.value === field
  );
};

const isTemplateScanning = (template: TemplateDTO) => {
  return props.state.scanningTemplateIds.has(template.id);
};

const onRowClick = (event: MouseEvent, template: TemplateDTO) => {
  if (event.button !== 0) return;
  if (selectedTemplate.value?.id === template.id) {
    selectedTemplate.value = undefined;
  } else {
    selectedTemplate.value = template;
  }
};

const isSmallScreen = useMediaQuery("(max-width: 1150px)");

const formatLength = (length: number | undefined): string => {
  if (length === undefined || length === 0) return "-";
  return length.toString();
};

const getModifiedLength = (template: TemplateDTO): string => {
  const results = analysisService.resultState;
  if (results.type !== "Success") return "-";
  const templateResults = results.results.filter(
    (r) => r.templateId === template.id,
  );
  if (templateResults.length === 0) return "-";
  const avgLength =
    templateResults.reduce((sum, r) => sum + r.responseLength, 0) /
    templateResults.length;
  return formatLength(Math.round(avgLength));
};

const columnWidths = {
  method: "85px",
  host: "200px",
  path: "400px",
  regex: "180px",
  origLen: "80px",
  modLen: "80px",
  roleUser: "120px",
  actions: "60px",
};
</script>

<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{
        body: { class: 'flex-1 min-h-0' },
        content: { class: 'h-full flex flex-col' },
      }"
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
        <div class="flex flex-col grow min-h-0 overflow-hidden">
          <!-- Header Table -->
          <div class="pr-[12px] flex-shrink-0">
            <table class="w-full border-spacing-0 border-separate table-fixed">
              <thead class="bg-surface-900">
                <tr class="bg-surface-800/50 text-surface-0/50">
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.method }"
                  >
                    Method
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.host }"
                  >
                    Host
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.path }"
                  >
                    Path
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.regex }"
                  >
                    Auth Success Regex
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.origLen }"
                  >
                    Orig Len
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.modLen }"
                  >
                    Mod Len
                  </th>
                  <th
                    v-for="role in roleState.roles"
                    :key="role.id"
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.roleUser }"
                  >
                    {{ role.name }}
                  </th>
                  <th
                    v-for="user in userState.users"
                    :key="user.id"
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.roleUser }"
                  >
                    {{ user.name }}
                  </th>
                  <th
                    class="font-semibold text-left text-xs border-y border-surface-700 py-2 px-2"
                    :style="{ width: columnWidths.actions }"
                  ></th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Virtualized Body -->
          <DynamicScroller
            class="flex-1 overflow-auto bg-surface-800"
            :items="filteredTemplates"
            :min-item-size="36"
            key-field="id"
          >
            <template #default="{ item, index, active }">
              <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[item.authSuccessRegex]"
                :data-index="index"
              >
                <table
                  class="w-full border-spacing-0 border-separate table-fixed"
                >
                  <tbody>
                    <tr
                      :class="[
                        'cursor-pointer text-white/80 text-sm',
                        {
                          'bg-highlight': selectedTemplate?.id === item.id,
                          'bg-surface-800':
                            index % 2 === 0 && selectedTemplate?.id !== item.id,
                          'bg-surface-900':
                            index % 2 === 1 && selectedTemplate?.id !== item.id,
                          'hover:bg-surface-700/50':
                            selectedTemplate?.id !== item.id,
                          'scanning-row': isTemplateScanning(item),
                        },
                      ]"
                      @mousedown="onRowClick($event, item)"
                    >
                      <td
                        class="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        :style="{ width: columnWidths.method }"
                      >
                        {{ item.meta.method }}
                      </td>
                      <td
                        class="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        :style="{ width: columnWidths.host }"
                      >
                        {{ getHostColumnValue(item) }}
                      </td>
                      <td
                        class="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        :style="{ width: columnWidths.path }"
                      >
                        {{ getPathColumnValue(item) }}
                      </td>
                      <td
                        class="py-2 px-2"
                        :style="{ width: columnWidths.regex }"
                        @dblclick="startEditing(item, 'authSuccessRegex')"
                      >
                        <InputText
                          v-if="isEditing(item, 'authSuccessRegex')"
                          v-model="editingValue"
                          class="w-full"
                          size="small"
                          autofocus
                          @blur="finishEditing(item)"
                          @keyup.enter="finishEditing(item)"
                        />
                        <span
                          v-else
                          class="block overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          {{ item.authSuccessRegex }}
                        </span>
                      </td>
                      <td
                        class="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        :style="{ width: columnWidths.origLen }"
                      >
                        {{ formatLength(item.originalResponseLength) }}
                      </td>
                      <td
                        class="py-2 px-2 overflow-hidden text-ellipsis whitespace-nowrap"
                        :style="{ width: columnWidths.modLen }"
                      >
                        {{ getModifiedLength(item) }}
                      </td>
                      <td
                        v-for="role in roleState.roles"
                        :key="role.id"
                        class="py-2 px-2"
                        :style="{ width: columnWidths.roleUser }"
                      >
                        <div class="flex items-center gap-2">
                          <Checkbox
                            v-tooltip="'Check if this role should have access.'"
                            :model-value="getRoleValue(item, role)"
                            binary
                            @change="() => toggleRole(item, role)"
                          />
                          <RuleStatus :status="getRoleStatus(item, role)" />
                        </div>
                      </td>
                      <td
                        v-for="user in userState.users"
                        :key="user.id"
                        class="py-2 px-2"
                        :style="{ width: columnWidths.roleUser }"
                      >
                        <div class="flex items-center gap-2">
                          <Checkbox
                            v-tooltip="'Check if this user should have access.'"
                            :model-value="getUserValue(item, user)"
                            binary
                            @change="() => toggleUser(item, user)"
                          />
                          <RuleStatus :status="getUserStatus(item, user)" />
                        </div>
                      </td>
                      <td
                        class="py-2 px-2"
                        :style="{ width: columnWidths.actions }"
                      >
                        <Button
                          icon="fas fa-trash"
                          text
                          severity="danger"
                          size="small"
                          @click.stop="() => deleteTemplate(item)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>
        </div>
      </template>
    </Card>
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
