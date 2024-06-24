<script lang="ts" setup>
import { useStore } from "@/entities";
const store = useStore();

store.commit("titles/SET_TITLE", "Уведомления");
</script>

<template></template>
