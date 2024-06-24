<script lang="ts" setup>
  import { onMounted, ref } from "vue";
  import { getDaysMonth, taskList } from "./helpers";
  import { useStore } from "@/entities";
  import { loader } from "@/widgets";

  const date = new Date();
  const currentMoth = ref(date.getMonth());
  const currentYear = ref(date.getFullYear());
  const currentDayOfWeek = ref(date.getDay() === 0 ? 6 : date.getDay());
  const month = ref(date.getMonth());
  const year = ref(date.getFullYear());
  const currentWeek = ref(true);
  const tasksMap = ref<Map<string, { task: iStore.Task[] }>>(new Map());
  const store = useStore();
  const selectedDay = ref(new Date().getDate());
  const dayOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const loaderState = ref(false);

  function checkExistTask(date: string) {
    return tasksMap.value.has(date);
  }

  const days = ref<{
    weeks: (number | boolean)[][];
    mount: string;
  }>({ weeks: [], mount: "" });

  function incementmonth(val: number) {
    month.value = month.value + val;
    if (val > 0 && month.value > 11) {
      month.value = 0;
      year.value++;
    } else if (val < 0 && month.value < 0) {
      month.value = 11;
      year.value--;
    }
    currentWeek.value = currentMoth.value === month.value;
    days.value = getDaysMonth(month.value, year.value);
    store.dispatch("tasks/GET_TASKS_OF_MONTH", month.value + 1).then((tasks) => {
      tasksMap.value = taskList(tasks);
      selectDay(`${year.value}-${String(month.value + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
      loaderState.value = true;
    });
  }

  function selectDay(date: string) {
    const payload = tasksMap.value.has(date);
    const day = new Date(date).getDate();
    selectedDay.value = day;
    if (payload) return store.commit("tasks/SET_TASKS_OF_SELECTED_DAY", { day: date, tasks: tasksMap.value.get(date)?.task });
    store.commit("tasks/SET_TASKS_OF_SELECTED_DAY", { day: date, tasks: [] });
  }

  days.value = getDaysMonth(month.value, year.value);

  onMounted(() => {
    store.dispatch("tasks/GET_TASKS_OF_MONTH", month.value + 1).then((tasks) => {
      tasksMap.value = taskList(tasks);
      selectDay(`${year.value}-${String(month.value + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
      loaderState.value = true;
    });
  });
</script>

<template>
  <loader v-if="!loaderState" style="height: 10em" />
  <div class="calendar" v-else>
    <div class="calendar__control">
      <input type="button" @click="incementmonth(-1)" />
      <h2>{{ days.mount }}</h2>
      <input type="button" @click="incementmonth(1)" />
    </div>
    <div class="calendar-weeks-days">
      <p
        v-for="(day, index) in dayOfWeek"
        :key="index"
        :class="{
          'current-weekday': index === currentDayOfWeek - 1 && currentWeek && currentYear === year,
          'week-end': day === 'СБ' || day === 'ВС',
        }"
      >
        {{ day }}
      </p>
    </div>
    <div class="calendar-weeks__wrp">
      <div v-for="(week, index) in days.weeks" class="calendar-weeks" :key="index">
        <div v-for="(day, i) in week" :key="i" :class="{ withTask: day && checkExistTask(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) }">
          <p
            :class="{
              'current-day': day === new Date().getDate() && currentMoth === month && currentYear === year,
              'calendar-weeks__day': day,
              SelectedDay: day === selectedDay && currentMoth === month && currentYear === year,
            }"
            @click="day && selectDay(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)"
          >
            {{ day ? day : "" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .calendar {
    padding: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--secondary-background-color);
    gap: 0.4em;
    border-radius: 0.4em;
  }

  .calendar__control {
    display: flex;
    justify-content: space-between;
    width: 100%;
    & h2 {
      margin: 0;
      text-align: center;
      text-transform: capitalize;
      color: var(--secondary-text-color);
      user-select: none;
    }
    & input {
      width: 2em;
      background: none;
      outline: none;
      border: none;
      background-position: center;
      background-repeat: no-repeat;
      padding-block: 0;
      padding-inline: 0;
      cursor: pointer;
    }
    & input:nth-child(1) {
      background-image: url("@/share/assets/icons/arrowLeftIcon.svg");
    }
    & input:nth-child(3) {
      background-image: url("@/share/assets/icons/arrowRightIcon.svg");
    }
  }

  .calendar-weeks {
    display: flex;
    gap: 0.5em;
    color: var(--secondary-text-color);
    & p {
      width: 1.2em;
      aspect-ratio: 1/1;
      margin: 0;
      padding: 0.6em;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      user-select: none;
      line-height: 0.8;
    }
  }

  .calendar-weeks-days {
    @extend .calendar-weeks;
  }

  .calendar-weeks__wrp {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .calendar-weeks__day {
    background-color: var(--background-item-color);
    cursor: pointer;
    transition: transform 0.2s ease;
    user-select: none;

    &:active {
      transform: scale(0.8);
    }
  }
  .calendar-weeks__day:hover {
    background-color: var(--background-item-hover-color);
  }

  .current-day {
    background-color: var(--secondary-background-color);
    color: var(--primary-color);
    border: 0.1em solid var(--primary-color);
  }

  .week-end {
    color: var(--weekend-color);
  }
  .current-weekday.week-end {
    color: var(--text-color);
  }
  .withTask {
    position: relative;
  }
  .withTask::before {
    content: "";
    width: 0.3em;
    aspect-ratio: 1/1;
    border-radius: 100%;
    position: absolute;
    background: var(--primary-color);
    bottom: 0.3em;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .SelectedDay {
    background-color: var(--primary-color) !important;
    color: var(--text-color) !important;
  }

  @media screen and (max-width: 480px) {
    .calendar {
      padding: 1em;
    }
    .calendar__control {
      & h2 {
        font-size: 1em;
      }
      & input {
        width: 1.5em;
      }
    }

    .calendar-weeks {
      & p {
        width: 1em;
        font-size: 0.9em;
      }
    }
  }
</style>
