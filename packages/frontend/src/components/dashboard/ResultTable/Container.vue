<script setup lang="ts">
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import {UserState} from '@/types/users';
import {RoleState} from '@/types/roles';
import {Role, User} from 'shared';
import {useUserStore} from '@/stores/users';

const props = defineProps<{
  userState: UserState & { type: "Success" }
  roleState: RoleState & { type: "Success" }
}>();

const getRoleValue = (user: User, role: Role) => {
  return user.roles.some((r) => r.id === role.id);
};

const store = useUserStore();
const toggleRole = (user: User, role: Role) => {
  const isEnabled = user.roles.some((r) => r.id === role.id);

  if (isEnabled) {
    store.updateUser(user.id, {
      ...user,
      roles: user.roles.filter((r) => r.id !== role.id),
    });
  } else {
    store.updateUser(user.id, {
      ...user,
      roles: [...user.roles, role]
    });
  }
};


const columns = [
  { field: 'id', header: 'ID' },
  { field: 'host', header: 'Host' },
  { field: 'path', header: 'Path' },
]

const items = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  host: "localhost",
  path: "/path",
}));
</script>

<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{ body: { style: { height: '100%', padding: '0.5rem' } }, content: { style: { height: '100%' } } }">

      <template #header>
        <div class="px-4 pt-4 flex justify-between gap-8">
          <div class="flex flex-col gap-2">
            <IconField>
              <InputIcon class="fas fa-magnifying-glass"/>
              <InputText placeholder="Search" />
            </IconField>
          </div>

          <div class="flex items-center gap-4">
            <!-- Capture requests automatically -->
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
          :value="items"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
        >
          <Column
            v-for="column in columns"
            :key="column.field"
            :field="column.field"
            :header="column.header"
            :pt="{ bodyCell: { style: { padding: '0 0.5rem', lineHeight: '21px' } } }"
          />

          <Column
            v-for="role in roleState.roles"
            :key="role.id"
            :header="role.name"
          >
            <template #body="{ data }">
              <Checkbox :model-value="getRoleValue(data, role)" binary @change="() => toggleRole(data, role)" />
            </template>
          </Column>

        </DataTable>
      </template>
    </Card>
  </div>
</template>
