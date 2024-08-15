<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import {computed} from 'vue';
import {RoleState} from '@/types/roles';
import Checkbox from 'primevue/checkbox';
import {UserState} from '@/types/users';
import {useUserStore} from '@/stores/users';
import {Role, User} from 'shared';

defineProps<{
  state: UserState & { type: 'Success' };
  roleState: RoleState & { type: "Success" }
}>();

const selection = defineModel<User | null>("selection", { required: true });

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



const onAddUser = () => {
  store.addUser("New user");
};

const onDeleteUser = (user: User) => {
  store.deleteUser(user.id);
};
</script>


<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between items-center w-full">
        <h1>User List</h1>
        <Button label="+ Add User" @click="onAddUser" />
      </div>
    </template>

    <template #content>
      <DataTable
        :value="state.users"
        v-model:selection="selection"
        data-key="id"
        striped-rows
        scrollable
        scroll-height="flex"
        size="small"
        selection-mode="single"
        class="w-full"
      >
        <template #empty>
          <div class="flex flex-col items-center p-8 w-full">
            <p class="text-gray-400">No users configured.</p>
            <p class="text-gray-400">Click on the button above to add a new user.</p>
          </div>
        </template>
        <Column field="name" header="Name" />
        <Column
          v-for="role in roleState.roles"
          :key="role.id"
          :header="role.name"
        >
          <template #body="{ data }">
            <Checkbox :model-value="getRoleValue(data, role)" binary @change="() => toggleRole(data, role)" />
          </template>
        </Column>

        <Column>
          <template #body="{ data }">
            <div class="flex justify-end">
              <Button icon="fas fa-trash" text severity="danger" size="small" @click="() => onDeleteUser(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
