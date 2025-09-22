<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import type { SubstitutionDTO } from "shared";
import { ref } from "vue";

import { useSubstitutionService } from "@/services/substitutions";
import { type SubstitutionState } from "@/types";
import { useSDK } from "@/plugins/sdk";

defineProps<{
  state: SubstitutionState & { type: "Success" };
}>();

const service = useSubstitutionService();
const sdk = useSDK();

const newPattern = ref("");
const newReplacement = ref("");

const addSubstitution = () => {
  if (newPattern.value.trim() === "" || newReplacement.value.trim() === "") {
    sdk.window.showToast("Please enter a pattern and replacement", {
      variant: "error",
    });
    return;
  }

  service.addSubstitution(newPattern.value.trim(), newReplacement.value.trim());
  newPattern.value = "";
  newReplacement.value = "";
};

const deleteSubstitution = (substitution: SubstitutionDTO) => {
  service.deleteSubstitution(substitution.id);
};

const onSubstitutionUpdate = (
  substitution: SubstitutionDTO,
  field: string,
  newValue: unknown
) => {
  service.updateSubstitution(substitution.id, {
    ...substitution,
    [field]: newValue,
  });
};
</script>

<template>
  <div class="h-full">
    <Card
      class="h-full"
      :pt="{ body: { class: 'flex-1 min-h-0' }, content: { class: 'h-full' } }"
    >
      <template #header>
        <div class="header-container p-4 flex justify-between gap-8">
          <div class="header-info flex flex-col w-[40%]">
            <h2 class="text-lg font-semibold">Substitutions</h2>
            <p class="text-sm text-gray-400">
              Define string replacements for Swagger path parameters.
            </p>
            <p class="text-sm text-gray-400">
              These substitutions will be applied to template paths before
              sending requests.
            </p>
          </div>
          <div class="flex items-end gap-4">
            <div class="flex gap-2">
              <InputText
                v-model="newPattern"
                placeholder="Pattern (e.g. {petId})"
                class="w-52"
              />
              <InputText
                v-model="newReplacement"
                placeholder="Replacement (e.g. 123)"
                class="w-52"
              />
              <Button
                size="small"
                icon="fas fa-plus"
                label="Add Substitution"
                @click="addSubstitution"
              />
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="state.substitutions"
          striped-rows
          scrollable
          scroll-height="flex"
          size="small"
          edit-mode="cell"
          @cell-edit-complete="
            ({ data, field, newValue }) =>
              onSubstitutionUpdate(data, field, newValue)
          "
        >
          <Column field="pattern" header="Pattern" class="w-[200px]">
            <template #editor="{ data }">
              <InputText v-model="data.pattern" />
            </template>
          </Column>

          <Column field="replacement" header="Replacement" class="w-[200px]">
            <template #editor="{ data }">
              <InputText v-model="data.replacement" />
            </template>
          </Column>

          <Column header="">
            <template #body="{ data }">
              <div class="flex justify-end">
                <Button
                  icon="fas fa-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="() => deleteSubstitution(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
