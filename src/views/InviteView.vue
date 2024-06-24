<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { doRequest } from "@/helpers";
  import { useRoute, useRouter } from "vue-router";
  import { loader } from "@/widgets";

  const store = useStore();

  const route = useRoute();
  if (!route.params.guid) throw new Error();
  const guid = route.params.guid;
  const router = useRouter();
  doRequest("/auth/register/" + guid, { method: "GET" })
    .then(({ response }) => {
      router.push({ name: "Home" });
    })
    .catch((error) => {
      store.commit("events/PUSH_MESSAGE", {
        id: undefined,
        message: error.message,
        type: "error",
      });
    });
</script>

<template>
  <loader />
</template>
