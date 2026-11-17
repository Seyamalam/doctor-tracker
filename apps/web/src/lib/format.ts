const dateFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortDayFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFmt.format(date);
};

export const formatDayLabel = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : shortDayFmt.format(date);
};
