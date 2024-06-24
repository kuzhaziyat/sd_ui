export function getDaysMonth(month: number, year: number) {
  const weeks = [];
  const dayCounts = new Date(year, month + 1, 0).getDate() + 1;
  const mount = `${new Date(year, month).toLocaleDateString("ru", { month: "long" })} ${year}`;
  const firstDay = new Date(year, month).getDay();
  let temp = [];
  const count = firstDay === 0 ? 7 : firstDay;
  for (let i = 1; i < count; i++) {
    temp.push(false);
  }
  for (let i = 1; i < dayCounts; i++) {
    temp.push(i);
    if (temp.length > 6) {
      weeks.push(temp);
      temp = [];
    }
  }
  for (let i = temp.length; i < 7; i++) {
    temp.push(false);
  }
  weeks.push(temp);
  if (weeks.length < 6) {
    temp = [];
    for (let i = 1; i < 7; i++) {
      temp.push(false);
    }
    weeks.push(temp);
  }
  return { weeks, mount };
}
