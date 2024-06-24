export function taskList(tasks: iStore.Task[]) {
  const map = new Map<string, { task: iStore.Task[] }>();
  for (let i = 0; i < tasks.length; i++) {
    const date = tasks[i].info.deadLine.split("T")[0];
    if (map.has(date)) {
      map.get(date)!.task.push(tasks[i]);
    } else {
      map.set(date, { task: [tasks[i]] });
    }
  }
  return map;
}
