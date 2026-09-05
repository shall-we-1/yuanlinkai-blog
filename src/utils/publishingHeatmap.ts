type Publication = {
  pubDatetime: Date;
  timezone?: string;
  path: string;
};

type PublicationDay = {
  date: string;
  count: number;
  level: number;
  title: string;
  href?: string;
};

/** Use the same per-post timezone override as the article date display. */
function publicationDateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function buildPublishingHeatmap(
  publications: Publication[],
  defaultTimezone: string
) {
  const dates = new Map<string, string[]>();
  for (const post of publications) {
    const key = publicationDateKey(
      post.pubDatetime,
      post.timezone || defaultTimezone
    );
    const paths = dates.get(key) ?? [];
    paths.push(post.path);
    dates.set(key, paths);
  }

  const years = [
    ...new Set([...dates.keys()].map(key => Number(key.slice(0, 4)))),
  ];
  return years
    .sort((a, b) => b - a)
    .map(year => {
      // UTC here is only calendar arithmetic, after publication timezone conversion.
      const firstDay = Date.UTC(year, 0, 1);
      const nextYear = Date.UTC(year + 1, 0, 1);
      const offset = (new Date(firstDay).getUTCDay() + 6) % 7;
      const cells: (PublicationDay | null)[] = Array(offset).fill(null);
      const months: { label: string; column: number }[] = [];
      let postCount = 0;

      for (let time = firstDay; time < nextYear; time += 86400000) {
        const date = new Date(time);
        const key = date.toISOString().slice(0, 10);
        const paths = dates.get(key) ?? [];
        const count = paths.length;
        postCount += count;
        if (date.getUTCDate() === 1) {
          months.push({
            label: `${date.getUTCMonth() + 1}月`,
            column: Math.floor(cells.length / 7) + 1,
          });
        }
        cells.push({
          date: key,
          count,
          level: Math.min(count, 3),
          title: `${year}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日\n${count ? `发布 ${count} 篇` : "没有发布"}`,
          href: count === 1 ? paths[0] : undefined,
        });
      }
      while (cells.length % 7) cells.push(null);
      return { year, months, cells, postCount, weeks: cells.length / 7 };
    });
}
