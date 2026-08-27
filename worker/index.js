const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VIEW_WINDOW_SECONDS = 30 * 60;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function errorResponse(status, message, headers) {
  return json({ error: message }, status, headers);
}

function isValidSlug(slug) {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    slug.length <= 300 &&
    slug.trim() === slug &&
    !/[\u0000-\u001f\u007f]/.test(slug)
  );
}

function isValidVisitorId(visitorId) {
  return (
    typeof visitorId === "string" &&
    visitorId.length <= 36 &&
    UUID_PATTERN.test(visitorId)
  );
}

function validatePostBody(body, includeLiked = false) {
  if (!body || typeof body !== "object") return "请求正文必须是 JSON 对象";
  if (!isValidSlug(body.slug)) return "slug 无效";
  if (!isValidVisitorId(body.visitorId)) return "visitorId 无效";
  if (includeLiked && typeof body.liked !== "boolean") return "liked 必须是 boolean";
  return null;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function ensureStats(db, slug, now) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO post_stats
        (slug, views, likes, created_at, updated_at)
       VALUES (?, 0, 0, ?, ?)`
    )
    .bind(slug, now, now)
    .run();
}

async function getStats(db, slug, visitorId) {
  const stats = await db
    .prepare("SELECT views, likes FROM post_stats WHERE slug = ?")
    .bind(slug)
    .first();

  if (!stats) return { views: 0, likes: 0, liked: false };

  let liked = false;
  if (visitorId) {
    const like = await db
      .prepare(
        "SELECT 1 AS liked FROM post_likes WHERE slug = ? AND visitor_id = ?"
      )
      .bind(slug, visitorId)
      .first();
    liked = Boolean(like);
  }

  return {
    views: Number(stats.views ?? 0),
    likes: Number(stats.likes ?? 0),
    liked,
  };
}

async function handleGetStats(request, env) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const visitorId = url.searchParams.get("visitorId");

  if (!isValidSlug(slug)) return errorResponse(400, "slug 无效");
  if (visitorId !== null && !isValidVisitorId(visitorId)) {
    return errorResponse(400, "visitorId 无效");
  }

  return json(await getStats(env.DB, slug, visitorId));
}

async function handleView(request, env) {
  const body = await readJson(request);
  const validationError = validatePostBody(body);
  if (validationError) return errorResponse(400, validationError);

  const now = Math.floor(Date.now() / 1000);
  await ensureStats(env.DB, body.slug, now);

  const viewerResult = await env.DB
    .prepare(
      `INSERT INTO post_viewers (slug, visitor_id, last_view_at)
       VALUES (?, ?, ?)
       ON CONFLICT (slug, visitor_id) DO UPDATE
       SET last_view_at = excluded.last_view_at
       WHERE excluded.last_view_at - post_viewers.last_view_at >= ?`
    )
    .bind(body.slug, body.visitorId, now, VIEW_WINDOW_SECONDS)
    .run();

  if (Number(viewerResult.meta?.changes ?? 0) > 0) {
    await env.DB
      .prepare(
        `UPDATE post_stats
         SET views = views + 1, updated_at = ?
         WHERE slug = ?`
      )
      .bind(now, body.slug)
      .run();
  }

  return json(await getStats(env.DB, body.slug, body.visitorId));
}

async function handleLike(request, env) {
  const body = await readJson(request);
  const validationError = validatePostBody(body, true);
  if (validationError) return errorResponse(400, validationError);

  const now = Math.floor(Date.now() / 1000);
  await ensureStats(env.DB, body.slug, now);

  if (body.liked) {
    const insertResult = await env.DB
      .prepare(
        `INSERT OR IGNORE INTO post_likes (slug, visitor_id, created_at)
         VALUES (?, ?, ?)`
      )
      .bind(body.slug, body.visitorId, now)
      .run();

    if (Number(insertResult.meta?.changes ?? 0) > 0) {
      await env.DB
        .prepare(
          `UPDATE post_stats
           SET likes = likes + 1, updated_at = ?
           WHERE slug = ?`
        )
        .bind(now, body.slug)
        .run();
    }
  } else {
    const deleteResult = await env.DB
      .prepare(
        "DELETE FROM post_likes WHERE slug = ? AND visitor_id = ?"
      )
      .bind(body.slug, body.visitorId)
      .run();

    if (Number(deleteResult.meta?.changes ?? 0) > 0) {
      await env.DB
        .prepare(
          `UPDATE post_stats
           SET likes = MAX(likes - 1, 0), updated_at = ?
           WHERE slug = ?`
        )
        .bind(now, body.slug)
        .run();
    }
  }

  return json(await getStats(env.DB, body.slug, body.visitorId));
}

async function handleApiRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return errorResponse(403, "禁止跨站请求");
  }

  if (url.pathname === "/api/stats") {
    if (request.method !== "GET") {
      return errorResponse(405, "方法不允许", { Allow: "GET" });
    }
    return handleGetStats(request, env);
  }

  if (url.pathname === "/api/view") {
    if (request.method !== "POST") {
      return errorResponse(405, "方法不允许", { Allow: "POST" });
    }
    return handleView(request, env);
  }

  if (url.pathname === "/api/like") {
    if (request.method !== "POST") {
      return errorResponse(405, "方法不允许", { Allow: "POST" });
    }
    return handleLike(request, env);
  }

  return errorResponse(404, "API 不存在");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApiRequest(request, env);
      }
      return env.ASSETS.fetch(request);
    } catch {
      return errorResponse(500, "服务器暂时无法处理请求");
    }
  },
};
