<script setup lang="ts">
import { useRequestStore } from "@/stores/requests";
import { RequestState } from "@/types/requests";
import { RoleState } from "@/types/roles";
import { UserState } from "@/types/users";
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

const devAddRequest = () => {
	store.addRequest();
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
            <Button label="+ [DEV] Add request" @click="devAddRequest" />
            <div
              class="flex gap-2"
              v-tooltip="'Automatically add each intercepted request to the testing queue for analysis.'">
              <label>Auto-capture requests</label>
              <Checkbox></Checkbox>
            </div>
            <div
              class="flex gap-2"
              v-tooltip="'Automatically trigger the analysis as soon as the request is added to the testing queue.'">
              <label>Auto-run analysis</label>
              <Checkbox></Checkbox>
            </div>
            <Button v-tooltip="'Manually run the analysis on the selected request.'">Analyze</Button>
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
        >
          <Column field="id" header="ID"/>
          <Column field="host" header="Host">
            <template #body="{ data }">
              {{ data.host }}:{{ data.port }}
            </template>
          </Column>

          <Column field="method" header="Method"/>

          <Column field="path" header="Path"/>
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
