<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {ref} from 'vue';

const users = [
  {
    name: 'Admin',
    description: 'Admin role',
  },
  {
    name: 'User',
    description: 'User role',
  },
];

const columns = [
  { field: 'name', header: 'Name' },
  { field: 'description', header: 'Description' },
];

const selection = ref();
</script>

<template lang="pug">
.autorize-user-show
  Card(:style="{ height: '100%' }")
    template(#title)
      .autorize-user-show__title
        h1 Update User
        .autorize-user-show__actions
          Button(label="Save")

    template(#content)
      label(for="name") Name
      InputText(id="name" label="Name")
</template>

<style>
.autorize-user-show {
  height: 100%;
}

.autorize-user-show__title {
  width: 100%;

  font-size: 1.5rem;
  font-weight: bold;

  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
  }
}
</style>
