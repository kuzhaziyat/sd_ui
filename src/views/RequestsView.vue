<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { ref } from "vue";

  const store = useStore();

  const links = ref([
    { to: "TaskList", name: "Поручения" },
    { to: "ProposalList", name: "Мои заявки" },
  ]);
</script>

<template>
  <div class="request" tabindex="1">
    <!-- <nav class="request__nav">
      <ul>
        <li v-for="link in links" :key="link.to">
          <router-link :to="{ name: link.to }" active-class="request-active-link">{{ link.name }}</router-link>
        </li>
      </ul>
    </nav> -->
    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
  .request {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    box-sizing: border-box;
    flex-wrap: wrap;
    gap: 1em;
  }
  .request__nav {
    display: flex;
    justify-content: center;
    & ul {
      margin: 0;
      display: flex;
      gap: 2em;
      & li {
        list-style-type: none;
        & a {
          display: block;
          padding: 0.4em 1em;
          text-decoration: none;
          font-size: 1.4em;
          border-radius: 0.4em;
          border: 0.1em solid var(--secondary-border-color);
          color: var(--secondary-text-color);
        }
      }
    }
  }
  .request-active-link {
    color: var(--text-color) !important;
    border: 0.1em solid var(--primary-color) !important;
    background-color: var(--primary-color);
  }
</style>
