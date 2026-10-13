import { statSync } from "node:fs";
import { resolve } from "node:path";
import type { CollectionEntry } from "astro:content";

// Build-time validation: a broken or oversized upload must not reach production.
export function getPostMusic(post: CollectionEntry<"blog">) {
  const music = post.data.music;
  if (!music) return undefined;

  const path = resolve("public", music.src.slice(1));
  let file;
  try {
    file = statSync(path);
  } catch {
    throw new Error(`文章 ${post.id} 的配乐不存在：public${music.src}`);
  }
  if (!file.isFile() || file.size === 0 || file.size > 25 * 1024 * 1024) {
    throw new Error(
      `文章 ${post.id} 的配乐必须是非空音频文件，且不超过 25 MiB：${music.src}`
    );
  }
  return music;
}
