<script setup lang="ts">
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import Column from 'primevue/column';
import {ref} from 'vue';
import {computed} from 'vue';
import {RoleState} from '@/types/roles';
import Checkbox from 'primevue/checkbox';
import {UserState} from '@/types/users';
import {useUserStore} from '@/stores/users';
import {User} from 'shared';

const props = defineProps<{
  state: UserState & { type: 'Success' };
  roleState: RoleState & { type: "Success" }
}>();

const roles = computed(() => {
  return props.roleState.roles.map((role) => {
    return { field: role.name, header: role.name };
  })
});

const selection = ref();

const store = useUserStore();

const onAddUser = () => {
  store.addUser("New user");
};

const onDeleteUser = (user: User) => {
  store.deleteUser(user.id);
};

const onRowEditSave = (user: User, fields: Omit<User, "id">) => {
  store.updateUser(user.id, fields);
};

</script>


<template>
  <div class="h-full">
    <Card class="h-full">
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
          data-key="name"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          selection-mode="single"
          class="w-full"
        >
          <Column field="name" header="Name" />
          <Column
            v-for="role in roles"
            :key="role.field"
            :field="role.field"
            :header="role.header"
          >
            <template #body>
              <Checkbox :model-value="true" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
