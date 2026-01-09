
export const getIntervalsSince = (startDate: Date, intervalHours: number = 6): Date[] => {
  const intervals: Date[] = [];
  let current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    intervals.push(new Date(current));
    current.setHours(current.getHours() + intervalHours);
  }
  return intervals.reverse(); // Newest first
};

export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};
