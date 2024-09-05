<script setup lang="ts">
import type {RuleStatus} from 'shared';
import Chip from 'primevue/chip';

defineProps<{
  status: RuleStatus;
}>();
</script>

<template>
  <Chip
    v-if="status === 'Unexpected'"
    v-tooltip="'This access control rules on this resource are not as expected'"
    style="background: var(--p-yellow-500); padding: 0.25rem 0.5rem; font-size: 0.8rem; gap: 0.25rem">
    <i class="fas fa-exclamation-triangle" />
    <span>Unexpected</span>
  </Chip>
  <Chip
    v-else-if="status === 'Enforced'"
    v-tooltip="'This access control rules on this resource are properly enforced'"
    style="background: var(--p-green-500); padding: 0.25rem 0.5rem; font-size: 0.8rem; gap: 0.25rem">
    <i class="fas fa-check" />
    <span>Enforced</span>
  </Chip>
  <Chip
    v-else-if="status === 'Bypassed'"
    v-tooltip="'This access control rules on this resource have been bypassed'"
    style="background: var(--p-red-500); padding: 0.25rem 0.5rem; font-size: 0.8rem; gap: 0.25rem">
    <i class="fas fa-x" />
    <span>Bypassed</span>
  </Chip>
</template>
