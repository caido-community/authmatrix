<script setup lang="ts">
import { useUserStore } from "@/stores/users";
import { useCloned } from "@vueuse/core";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import type { User } from "shared";
import { computed, toRefs } from "vue";

import AttributeTable from "./AttributeTable.vue";

const props = defineProps<{
  user: User;
}>();

const { user } = toRefs(props);
const { cloned, sync } = useCloned(user);

const isDirty = computed(() => {
  return JSON.stringify(props.user) !== JSON.stringify(cloned.value);
});

const userStore = useUserStore();
const onSaveClick = () => {
  userStore.updateUser(props.user.id, cloned.value);
};

const onResetClick = () => {
  sync();
};
</script>

<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between items-center">
        <h1 class="font-bold">{{ user.name }}</h1>
        <div>
          <Button v-if="isDirty" text icon="fas fa-rotate-left" @click="onResetClick" />
          <Button label="Save" :disabled="!isDirty" @click="onSaveClick" />
        </div>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col h-full gap-8 min-h-0">
        <div class="flex flex-col gap-2">
          <label for="name" class="text-sm">Name</label>
          <InputText id="name" label="Name" v-model="cloned.name" autocomplete="off" />
        </div>

        <AttributeTable v-model:user="cloned" />
      </div>
    </template>
  </Card>
</template>
