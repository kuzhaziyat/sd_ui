<script lang="ts" setup>
  import { useStore } from "@/entities";
  import { PropType } from "vue";
  import { useRouter } from "vue-router";

  const store = useStore();
  const router = useRouter();

  const props = defineProps({
    index: {
      type: Number as PropType<number>,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      required: true,
    },
    count: {
      type: Number as PropType<number>,
      required: true,
    },
    icon: {
      type: String as PropType<string>,
      required: true,
    },
    link: {
      type: String as PropType<string>,
      required: true,
    },
  });

  function getFilter(link: string) {
    store.commit("tasks/SET_TASKS", []);
    store.commit("tasks/SET_SELECTED_TASKS_COUNT", props.count);
    const query = link.length > 0 ? { filter: link } : {};
    router.push({ name: "TaskList", query });
  }
</script>

<template>
  <div :class="`request-counter request-counter${index}`" @click="getFilter(link)">
    <div>
      <p>{{ title }}</p>
    </div>
    <div class="request-counter__image">
      <p>{{ count }}</p>
      <img :src="require(`@/share/assets/icons/${icon}`)" alt="" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .request-counter {
    background-color: var(--secondary-background-color);
    display: flex;
    flex-direction: column;
    color: var(--primary-color);

    justify-content: space-between;
    transition: transform 0.3s ease;
  }
  .request-counter:hover {
    transform: translateY(-0.2em);
    box-shadow: 0px 22px 55px -35px rgba(34, 60, 80, 0.74);
    cursor: pointer;
  }

  .request-counter > div > p {
    padding: 0;
    margin: 0;
  }

  .request-counter__image {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .request-counter__image > img {
    aspect-ratio: 1/1;
  }

  .request-counter__image > p {
    margin: 0;
    color: var(--secondary-text-color);
  }

  @media screen and (max-width: 480px) {
    .request-counter {
      padding: 1em;
      border-radius: 0.4em;
      gap: 1em;
      transition: transform 0.3s ease;
    }

    .request-counter > div > p {
      font-size: 1em;
    }

    .request-counter__image > img {
      width: 3em;
    }

    .request-counter__image > p {
      flex-basis: 30%;
      font-size: 1.5em !important;
    }
  }
  @media screen and (min-width: 480px) {
    .request-counter {
      padding: 1em;
      border-radius: 0.4em;
      gap: 1em;
      transition: transform 0.3s ease;
    }

    .request-counter > div > p {
      font-size: 1.8em;
    }

    .request-counter__image > img {
      width: 6em;
    }

    .request-counter__image > p {
      flex-basis: 30%;
      font-size: 4em !important;
    }

    .request-counter0 {
      grid-area: 1 / 3 / 2 / 5;
    }

    .request-counter1 {
      grid-area: 1/ 1 / 3 / 3;
      & .request-counter__image {
        margin-top: auto;
        margin-bottom: auto;
      }
    }
    .request-counter2 {
      grid-area: 2 / 6 / 3 / 9;
    }
    .request-counter3 {
      grid-area: 1 / 7 / 2 / 9;
    }
    .request-counter4 {
      grid-area: 1 / 5 / 2 / 7;
    }
    .request-counter5 {
      grid-area: 2 / 3 / 3 / 6;
    }
  }
</style>
