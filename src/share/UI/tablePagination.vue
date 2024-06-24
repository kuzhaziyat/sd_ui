<script setup lang="ts">
  import { PropType, ref, computed } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { loader } from "@/widgets";

  const route = useRoute();
  const router = useRouter();
  const activeButton = ref(1);
  const currentField = ref("");
  const desc = ref(false);
  const count = ref(20);

  const props = defineProps({
    is_empty: {
      type: String as PropType<string>,
      required: true,
    },
    route_name: {
      type: String as PropType<string>,
      required: false,
      default: false,
    },

    listColumnTitles: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    loaded: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    listRowsEntry: {
      type: Array as PropType<Array<Object>>,
      required: true,
    },
  });

  const pagCount = computed(() => {
    return Math.ceil(props.listRowsEntry.length / count.value);
  });

  function navigateToRoute(routeName: string | boolean, params?: any) {
    if (typeof routeName === "string") {
      router.push({ name: routeName, params: params });
    }
  }

  function pagination(page: number) {
    activeButton.value = page;
    const options: Record<string, any> = { offset: page, count: count.value, filter: route.query.filter };
    if (currentField.value) options.sort = currentField.value;
    if (desc.value) options.desc = desc.value;
    // store.dispatch("", options);
  }

  function sortBy(field: string) {
    activeButton.value = 1;
    const options: Record<string, any> = { offset: activeButton.value, count: count.value, filter: route.query.filter, sort: field };
    if (currentField.value === field && !desc.value) {
      options.desc = true;
      desc.value = true;
    } else if (currentField.value === field && desc.value) {
      options.desc = false;
      desc.value = false;
    } else if (currentField.value !== field) desc.value = false;
    currentField.value = field;
  }
</script>
<template>
  <loader v-if="$props.loaded" />
  <div class="table">
    <!-- <div class="table__search">
      <input type="text" placeholder="Поиск" />
    </div> -->
    <div class="table__wrp" v-if="listRowsEntry.length > 0">
      <div class="table__titles" :class="{ clicker: typeof route_name === 'string' }">
        <p v-for="title in listColumnTitles" @click="sortBy('title')">{{ title }}</p>
        <p></p>
      </div>
      <div
        @click="navigateToRoute($props.route_name!, { id: index })"
        v-for="(entry, index) in listRowsEntry"
        :class="{ clicker: typeof route_name === 'string' }"
        :key="index"
        class="table__entry"
      >
        <p v-for="(row, key) in entry" :title="(row ?? '').toString()">{{ row }}</p>
        <p></p>
      </div>
    </div>
    <div v-else>
      <h1>{{ is_empty }}</h1>
    </div>
  </div>
  <div v-if="pagCount > 1" class="table__pagination">
    <button v-for="page in pagCount" :key="page" @click="pagination(page)" :class="{ 'active-button': page === activeButton }">{{ page }}</button>
  </div>
</template>
<style scoped lang="scss">
  .table {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.5em;
    & h1 {
      text-align: center;
    }
  }
  .table__search {
    display: flex;
    justify-content: space-between;
    & input {
      outline: none;
      display: block;
      border: none;
      background-color: transparent;
      border: 0.1em solid var(--fourth-border-color);
      border-radius: 0.7em;
      padding: 1em 1.5em;
    }
    & input:nth-child(1) {
      flex-basis: 25%;
      background-image: url("@/share/assets/icons/search.svg");
      background-repeat: no-repeat;
      background-position: 95% center;
      background-size: 5%;
    }
  }
  .table__wrp {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-width: 100%;
  }
  .table__entry {
    display: flex;
    align-items: center;
    cursor: default !important;
    & p {
      background-color: var(--secondary-background-color);
      position: relative;
      height: 1.5em;
      padding-left: 1em;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin: 0;
      align-self: center;
      gap: 0.3em;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      flex: 1 0 20%;
      border-right: 0.1em solid var(--fourth-color);
      border-bottom: 0.1em solid var(--fourth-color);
      color: var(--secondary-text-color);
      width: 0em;
      & ::-webkit-scrollbar {
        display: none;
      }
      & ::-webkit-scrollbar-track {
        display: none;
      }
    }

    & > p:last-child {
      padding: 0;
      display: flex;
      justify-content: center;
      cursor: pointer;
      flex: 0 0 3%;
      &::after {
        display: block;
        content: "";
        width: 1em;
        aspect-ratio: 1/1;
        background-image: url("@/share/assets/icons/scale.svg");
        background-repeat: no-repeat;
        background-size: contain;
      }
    }
  }

  .table__titles {
    @extend .table__entry;
    & p {
      position: relative;
      display: flex;
      gap: 0.5em;
      color: var(--third-text-color);
      border-right: 0.1em solid var(--third-text-color);
    }
    // & p::after {
    //   display: block;
    //   content: "";
    //   width: 1em;
    //   aspect-ratio: 1/1;
    //   background-image: url("@/share/assets/icons/filterIcon.svg");
    //   background-repeat: no-repeat;
    //   background-size: contain;
    // }
    & p:last-child {
      padding: 0;
      display: flex;
      justify-content: center;
      display: flex;
      &::after {
        background-image: url("@/share/assets/icons/settingIcon.svg") !important;
      }
    }
  }
  .table__pagination {
    display: flex;
    gap: 1em;
    justify-content: center;
    & button {
      display: block;
      outline: none;
      border: none;
      width: 2em;
      height: 2em;
      background-color: transparent;
      color: var(--secondary-text-color);
      border-radius: 100%;
      cursor: pointer;
    }
  }
  .active-button {
    background-color: var(--primary-color) !important;
    color: var(--text-color) !important;
    border: 0.1em solid var(--primary-color) !important;
  }
  .clicker {
    cursor: pointer !important;
  }
</style>
