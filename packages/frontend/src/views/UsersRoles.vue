<script setup lang="ts">
import { RoleList, UserList, UserShow } from "@/components/users-roles";
import {useRoleStore} from "@/stores/roles";
import {useUserStore} from "@/stores/users";
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import {computed} from "vue";

const roleStore = useRoleStore();
const userStore = useUserStore();

const roleState = computed(() => roleStore.getState());
const userState = computed(() => userStore.getState());
</script>

<template>
  <div class="h-full">
    <Splitter class="h-full">
      <SplitterPanel size="50">
        <Splitter class="h-full" layout="vertical">
          <SplitterPanel size="50">
            <UserList
            v-if="roleState.type === 'Success' && userState.type === 'Success'"
            :state="userState"
            :role-state="roleState" />

          </SplitterPanel>
          <SplitterPanel size="50">
            <RoleList v-if="roleState.type === 'Success'" :state="roleState" />
          </SplitterPanel>
        </Splitter>
      </SplitterPanel>

      <SplitterPanel size="50" min-size="34">
        <UserShow />
      </SplitterPanel>
    </Splitter>
  </div>
</template>
