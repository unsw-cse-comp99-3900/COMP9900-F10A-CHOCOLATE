import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slug 格式化：用于显示人类友好的名称（如 Sugar Cane）
export function formatSlugName(slug: string): string {
  return slug
    .replace(/[_-]+/g, " ") // 替换 _ 或 - 为 空格
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
