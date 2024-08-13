<script setup lang="ts">
import { RoleList, UserList, UserShow } from "@/components/users-roles";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
</script>

<template>
  <div class="h-full">
    <Splitter class="h-full">
      <SplitterPanel size="50">
        <Splitter class="h-full" layout="vertical">
          <SplitterPanel size="50">
            <UserList />
          </SplitterPanel>
          <SplitterPanel size="50">
            <RoleList />
          </SplitterPanel>
        </Splitter>
      </SplitterPanel>

      <SplitterPanel size="50" min-size="34">
        <UserShow />
      </SplitterPanel>
    </Splitter>
  </div>
</template>
