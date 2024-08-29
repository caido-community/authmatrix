<script setup lang="ts">
import Card from 'primevue/card';
import SelectButton from 'primevue/selectbutton';
import {TemplateState, RoleState, UserState} from '@/types';
import {computed, ref} from 'vue';

const props = defineProps<{
	templateState: TemplateState & { type: "Success" };
	userState: UserState & { type: "Success" };
	roleState: RoleState & { type: "Success" };
}>();

const selection = ref();

const isDisabled = computed(() => {
  return !props.templateState.selection;
});

</script>

<template>
  <Card :pt="{ body: { class: 'p-3' } }">
    <template #content>
      <div class="flex gap-2 items-center w-full">
        <div class = "flex flex-col gap-1">
          <SelectButton v-model="selection" :options="[{ name: 'Original' }]" option-label="name" :disabled="isDisabled" />
        </div>

        <div v-if="userState.users.length !== 0" class="flex flex-col gap-1">
          <SelectButton
            v-model="selection"
            :options="userState.users"
            option-label="name"
            :disabled="isDisabled" />
        </div>
      </div>
    </template>
  </Card>
</template>
