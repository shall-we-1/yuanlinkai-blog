import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/data/blog";
export const GALLERY_PATH = "src/data/galleries";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      coverImage: image().optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      music: z
        .object({
          src: z
            .string()
            .regex(
              /^\/audio\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:mp3|m4a|ogg|wav)$/i,
              "配乐请使用 /audio/ 下的本地音频路径，文件名使用字母、数字、短横线或下划线"
            ),
          title: z.string().trim().min(1),
          artist: z.string().trim().optional(),
          loop: z.boolean().default(true),
        })
        .optional(),
    }),
});

const galleries = defineCollection({
  loader: glob({ pattern: "**/index.{md,mdx}", base: `./${GALLERY_PATH}` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDatetime: z.date(),
      draft: z.boolean().optional(),
      coverImage: image().optional(),
      tags: z.array(z.string()).default([]),
    }),
});

const photos = defineCollection({
  loader: file("src/data/photos.json"),
  schema: ({ image }) =>
    z.object({
      image: image(),
      description: z.string().trim().min(1),
      alt: z.string().trim().min(1).optional(),
      post: reference("blog"),
      order: z.number().int().default(0),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, galleries, photos };
