<script setup lang="ts">
import { RoleList, UserList } from "@/components/users-roles";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template lang="pug">
.autorize-users-roles
  Splitter(:style="{ height: '100%' }")
    SplitterPanel(:size="66")
      UserList

    SplitterPanel(:size="34" :min-size="34")
      RoleList
</template>

<style>
.autorize-users-roles {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
