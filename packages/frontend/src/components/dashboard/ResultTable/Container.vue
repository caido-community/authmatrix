<script setup lang="ts">
import { useRequestStore } from "@/stores/requests";
import {useSettingsStore} from "@/stores/settings";
import { RequestState, SettingsState } from "@/types";
import { RoleState } from "@/types";
import { UserState } from "@/types";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { BaseRequest, Role, User } from "shared";

defineProps<{
	state: RequestState & { type: "Success" };
	userState: UserState & { type: "Success" };
	roleState: RoleState & { type: "Success" };
  settingsState: SettingsState & { type: "Success" };
}>();

const getRoleValue = (request: BaseRequest, role: Role) => {
	return request.roleIds.some((roleId) => roleId === role.id);
};

const getUserValue = (request: BaseRequest, user: User) => {
	return request.userIds.some((userId) => userId === user.id);
};

const store = useRequestStore();
const toggleRole = (request: BaseRequest, role: Role) => {
	store.toggleRequestRole(request.id, role.id);
};

const toggleUser = (request: BaseRequest, user: User) => {
	store.toggleRequestUser(request.id, user.id);
};

const deleteRequest = (request: BaseRequest) => {
	store.deleteRequest(request.id);
};

const settingsStore = useSettingsStore();
const toggleAutoCaptureRequests = () => {
  settingsStore.toggleAutoCaptureRequests();
};

const toggleAutoRunAnalysis = () => {
  settingsStore.toggleAutoRunAnalysis();
};

const runAnalysis = () => {
  store.runAnalysis();
};
</script>

<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{ body: { class: 'flex-1 min-h-0' }, content: { class: 'h-full' } }">

      <template #header>
        <div class="px-4 pt-4 flex justify-between gap-8">
          <div class="flex flex-col gap-2">
            <IconField>
              <InputIcon class="fas fa-magnifying-glass"/>
              <InputText placeholder="Search" />
            </IconField>
          </div>


          <div class="flex items-center gap-4">
            <div
              class="flex gap-2"
              v-tooltip="'Automatically add each intercepted request to the testing queue for analysis.'">
              <label>Auto-capture requests</label>
              <Checkbox
                binary
                :model-value="settingsState.settings.autoCaptureRequests"
                @update:model-value="() => toggleAutoCaptureRequests()" />
            </div>
            <div
              class="flex gap-2"
              v-tooltip="'Automatically trigger the analysis as soon as the request is added to the testing queue.'">
              <label>Auto-run analysis</label>
              <Checkbox
                binary
                :model-value="settingsState.settings.autoRunAnalysis"
                @update:model-value="() => toggleAutoRunAnalysis()" />
            </div>
            <Button
              v-tooltip="'Manually run the analysis on the selected request.'"
              label="Analyze"
              :loading="state.analysisState.type === 'Analyzing'"
              @click="runAnalysis" />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="state.requests"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          edit-mode="cell"
        >
          <Column header="URL">
            <template #body="{ data }">
              {{ data.meta.method }} {{ data.meta.isTls ? 'https' : 'http' }}://{{ data.meta.host }}:{{ data.meta.port }}
            </template>
          </Column>

          <Column field="authSuccessRegex" header="Auth Success Regex">
            <template #editor="{ data }">
              <InputText v-model="data.authSuccessRegex" />
            </template>
          </Column>


          <Column v-for="role in roleState.roles" key="id" :header="role.name">
            <template #body="{ data }">
              <Checkbox
                v-tooltip="'Check this box if this role should have access to this resource.'"
                :model-value="getRoleValue(data, role)"
                binary
                @change="() => toggleRole(data, role)" />
            </template>
          </Column>

          <Column v-for="user of userState.users" :key="user.id" :header="user.name">
            <template #body="{ data }">
              <Checkbox
                v-tooltip="'Check this box if this user should have access to this resource.'"
                :model-value="getUserValue(data, user)"
                binary
                @change="() => toggleUser(data, user)" />
            </template>
          </Column>

          <Column>
            <template #body="{ data }">
              <div class="flex justify-end">
                <Button icon="fas fa-trash" text severity="danger" size="small" @click="() => deleteRequest(data)" />
              </div>
            </template>
          </Column>

        </DataTable>
      </template>
    </Card>
  </div>
</template>
