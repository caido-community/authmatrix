<script setup lang="ts">
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import type { UserAttributeDTO, UserDTO } from "shared";
import { ref } from "vue";

import { useUserService } from "@/services/users";
import { generateID } from "@/utils";

const props = defineProps<{
  user: UserDTO;
}>();

const editingRows = ref<Set<string>>(new Set());
const service = useUserService();

const onAddAttribute = () => {
  const newAttribute = {
    id: generateID(),
    name: "My attribute",
    value: "My value",
    kind: "Cookie" as const,
  };

  service.updateUser(props.user.id, {
    ...props.user,
    attributes: [...props.user.attributes, newAttribute],
  });

  editingRows.value.add(newAttribute.id);
};

const onRemoveAttribute = (attribute: UserAttributeDTO) => {
  service.updateUser(props.user.id, {
    ...props.user,
    attributes: props.user.attributes.filter(
      (attr) => attr.id !== attribute.id,
    ),
  });
};

const onAttributeUpdate = (
  attribute: UserAttributeDTO,
  field: keyof UserAttributeDTO,
  value: string,
) => {
  const newAttribute = {
    ...attribute,
    [field]: value,
  };

  service.updateUser(props.user.id, {
    ...props.user,
    attributes: props.user.attributes.map((attr) => {
      if (attr.id === attribute.id) {
        return newAttribute;
      }
      return attr;
    }),
  });
};

const toggleEdit = (attributeId: string) => {
  const newEditingRows = new Set(editingRows.value);
  if (newEditingRows.has(attributeId)) {
    newEditingRows.delete(attributeId);
  } else {
    newEditingRows.add(attributeId);
  }
  editingRows.value = newEditingRows;
};

const isEditing = (attributeId: string) => {
  return editingRows.value.has(attributeId);
};
</script>

<template>
  <div class="flex-1 flex flex-col gap-2 min-h-0">
    <div class="flex-1 flex justify-between items-center p-4">
      <h1 class="font-bold text-xl m-0">Attributes</h1>
      <div>
        <Button
          icon="fas fa-plus"
          label="Add attribute"
          size="small"
          @click="onAddAttribute"
        />
      </div>
    </div>

    <div class="min-h-0 flex-1">
      <DataTable
        :value="user.attributes"
        scrollable
        scroll-height="flex"
        striped-rows
      >
        <Column field="kind" header="Kind" style="width: 120px">
          <template #body="{ data }">
            <Select
              v-if="isEditing(data.id)"
              v-model="data.kind"
              :options="['Cookie', 'Header']"
              class="w-full"
              @change="onAttributeUpdate(data, 'kind', data.kind)"
            />
            <span
              v-else
              class="block px-3 py-2 min-h-[42px] flex items-center"
              >{{ data.kind }}</span
            >
          </template>
        </Column>

        <Column field="name" header="Name" style="width: 200px">
          <template #body="{ data }">
            <InputText
              v-if="isEditing(data.id)"
              v-model="data.name"
              class="w-full"
              @blur="onAttributeUpdate(data, 'name', data.name)"
              @keyup.enter="onAttributeUpdate(data, 'name', data.name)"
            />
            <span
              v-else
              class="block px-3 py-2 min-h-[42px] flex items-center"
              >{{ data.name }}</span
            >
          </template>
        </Column>

        <Column field="value" header="Value">
          <template #body="{ data }">
            <InputText
              v-if="isEditing(data.id)"
              v-model="data.value"
              class="w-full"
              @blur="onAttributeUpdate(data, 'value', data.value)"
              @keyup.enter="onAttributeUpdate(data, 'value', data.value)"
            />
            <span
              v-else
              class="block px-3 py-2 min-h-[42px] flex items-center truncate"
              :title="data.value"
              style="max-width: 300px"
              >{{ data.value }}</span
            >
          </template>
        </Column>

        <Column header="">
          <template #body="{ data }">
            <div class="flex justify-end gap-1">
              <Button
                v-tooltip="
                  isEditing(data.id) ? 'Save changes' : 'Edit attribute'
                "
                :icon="isEditing(data.id) ? 'fas fa-check' : 'fas fa-pencil'"
                size="small"
                text
                :severity="isEditing(data.id) ? 'success' : 'info'"
                @click="toggleEdit(data.id)"
              />
              <Button
                v-tooltip="'Delete attribute'"
                severity="danger"
                text
                size="small"
                icon="fas fa-trash"
                @click="() => onRemoveAttribute(data)"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <div
            class="flex flex-col items-center justify-center my-8 text-center"
          >
            <p class="text-gray-400">No attributes configured.</p>
            <p class="text-gray-400">
              Add attributes to include in requests for this user.
            </p>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
