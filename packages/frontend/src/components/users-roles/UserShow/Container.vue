<script setup lang="ts">
import { useUserService } from "@/services/users";
import { useCloned } from "@vueuse/core";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import type { User } from "shared";
import { toRefs, watch } from "vue";

import AttributeTable from "./AttributeTable.vue";

const props = defineProps<{
  user: User;
}>();

const { user } = toRefs(props);
const { cloned, sync } = useCloned(user);

const service = useUserService();
const onFocusOut = () => {
  service.updateUser(props.user.id, cloned.value);
};

watch(user, () => {
  sync();
});


</script>

<template>
  <Card class="h-full" :pt="{ body: { class: 'h-full' }, content: { class: 'flex-1 min-h-0' } } ">
    <template #title>
      <div class="flex justify-between items-center">
        <h1 class="font-bold">{{ user.name }}</h1>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col h-full gap-8 min-h-0">
        <div class="flex flex-col gap-2">
          <label for="name" class="text-sm">Name</label>
          <InputText id="name" label="Name" v-model="cloned.name" autocomplete="off" @focusout="onFocusOut"/>
        </div>

        <AttributeTable :user="cloned" />
      </div>
    </template>
  </Card>
</template>
