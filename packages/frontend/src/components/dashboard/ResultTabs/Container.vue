<script setup lang="ts">
import Card from 'primevue/card';
import SelectButton from 'primevue/selectbutton';
import {RequestState, RoleState, UserState} from '@/types';
import {computed, ref} from 'vue';

const props = defineProps<{
	state: RequestState & { type: "Success" };
	userState: UserState & { type: "Success" };
	roleState: RoleState & { type: "Success" };
}>();

const selection = ref();

const isDisabled = computed(() => {
  return !props.state.selection;
});

</script>

<template>
  <Card :pt="{ body: { class: 'p-3' } }">
    <template #content>
      <div class="flex gap-2 items-center w-full">
        <div class="flex flex-col gap-1">
          <label for="role" class="pl-1 text-sm">Roles</label>
          <SelectButton
            v-if="roleState.roles.length !== 0"
            v-model="selection"
            :options="roleState.roles"
            option-label="name"
            :disabled="isDisabled" />
          <SelectButton
            v-else
            v-model="selection"
            :options="[{ name: 'No roles found' }]"
            option-label="name"
            disabled />
        </div>

        <div class="flex flex-col gap-1">
          <label for="user" class="pl-1 text-sm">Users</label>
          <SelectButton
            v-if="userState.users.length !== 0"
            v-model="selection"
            :options="userState.users"
            option-label="name"
            :disabled="isDisabled" />
          <SelectButton
            v-else
            v-model="selection"
            :options="[{ name: 'No users found' }]"
            option-label="name"
            disabled />
        </div>

        <div class = "flex flex-col gap-1">
          <label for="request" class="pl-1 text-sm">&nbsp;</label>
          <SelectButton v-model="selection" :options="[{ name: 'Original' }]" option-label="name" :disabled="isDisabled" />
        </div>
      </div>
    </template>
  </Card>
</template>
