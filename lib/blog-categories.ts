import type { BlogCategory } from "@/lib/api/types";

export const blogCategories: Array<{ label: string; value: BlogCategory }> = [
  { label: "Horses", value: "HORSES" },
  { label: "Dogs", value: "DOGS" },
  { label: "Cats", value: "CATS" },
  { label: "Exotic", value: "EXOTIC" },
  { label: "Poultry", value: "POULTRY" },
];

export function blogCategoryLabel(category?: BlogCategory | null) {
  return blogCategories.find((item) => item.value === category)?.label ?? "Dogs";
}
