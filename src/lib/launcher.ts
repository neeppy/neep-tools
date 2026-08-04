export interface LauncherItem {
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  run: () => void;
}

function score(item: LauncherItem, query: string): number {
  const title = item.title.toLowerCase();
  if (title === query) return 4;
  if (title.startsWith(query)) return 3;
  if (title.includes(query)) return 2;
  if (item.keywords.toLowerCase().includes(query)) return 1;
  return 0;
}

export function filterItems(items: LauncherItem[], query: string): LauncherItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items
    .map((item) => ({ item, score: score(item, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
