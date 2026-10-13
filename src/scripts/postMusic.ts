// One detached audio element survives Astro's client-side navigation. It is only
// created for a configured track; text-only articles never fetch audio.
type Track = { src: string; path: string; loop: boolean };
type State =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "blocked"
  | "error"
  | "ended";

const storageKey = "reading-music-preferences";
const defaultVolume = 0.12;
const maxVolume = 0.3;
let stopped = false;
let muted = false;
let volume = defaultVolume;
try {
  const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
  if (saved && typeof saved === "object") {
    stopped = saved.stopped === true;
    muted = saved.muted === true;
    if (typeof saved.volume === "number" && Number.isFinite(saved.volume)) {
      volume = Math.min(maxVolume, Math.max(0, saved.volume));
    }
  }
} catch {
  /* Reading still works when browser storage is unavailable. */
}

let audio: HTMLAudioElement | undefined;
let track: Track | undefined;
let state: State = "idle";
let requestId = 0;
let panel: HTMLElement | null = null;
let controls: AbortController | undefined;

const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";
const sameTrack = (a?: Track, b?: Track) =>
  Boolean(a && b && a.path === b.path && a.src === b.src);
const formatTime = (value: number) => {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
function savePreferences() {
  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ stopped, muted, volume })
    );
  } catch {
    /* optional */
  }
}
function readTrack(
  element: HTMLElement | null,
  path?: string
): Track | undefined {
  if (!element?.dataset.musicSrc) return undefined;
  return {
    src: element.dataset.musicSrc,
    path: normalizePath(path ?? element.dataset.musicPath ?? location.pathname),
    loop: element.dataset.musicLoop === "true",
  };
}
function setText(selector: string, value: string) {
  const element = panel?.querySelector(selector);
  if (element && element.textContent !== value) element.textContent = value;
}
function render() {
  if (!panel || !sameTrack(track, readTrack(panel))) return;
  panel.dataset.state = state;
  const playing =
    state === "playing" || (state === "loading" && audio && !audio.paused);
  const play = panel.querySelector<HTMLButtonElement>("[data-music-play]")!;
  play.disabled = false;
  play.setAttribute(
    "aria-label",
    playing ? "暂停配乐" : state === "error" ? "重试播放配乐" : "播放配乐"
  );
  setText(
    "[data-music-play-label]",
    playing ? "暂停" : state === "error" ? "重试" : "播放"
  );
  setText("[data-music-play-icon]", playing ? "Ⅱ" : "▶");
  const messages: Record<State, string> = {
    idle: "轻声陪你读一会儿",
    loading: "正在加载配乐…",
    playing: muted || volume === 0 ? "已静音" : "正在播放",
    paused: "已暂停，本次访问不再自动播放",
    blocked: "点击播放，让音乐陪你读一会儿",
    error: "配乐暂时无法播放，点击重试",
    ended: "配乐已播放完毕",
  };
  setText("[data-music-status]", messages[state]);
  const total = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
  const now = audio?.currentTime ?? 0;
  setText("[data-music-current]", formatTime(now));
  setText("[data-music-duration]", formatTime(total));
  const seek = panel.querySelector<HTMLInputElement>("[data-music-seek]")!;
  seek.disabled = total <= 0;
  seek.max = String(total);
  seek.value = String(now);
  seek.setAttribute(
    "aria-valuetext",
    `${formatTime(now)} / ${formatTime(total)}`
  );
  const volumeInput = panel.querySelector<HTMLInputElement>(
    "[data-music-volume]"
  )!;
  volumeInput.disabled = false;
  volumeInput.value = String(Math.round(volume * 100));
  setText("[data-music-volume-value]", `${Math.round(volume * 100)}%`);
  const mute = panel.querySelector<HTMLButtonElement>("[data-music-mute]")!;
  const silent = muted || volume === 0;
  mute.disabled = false;
  mute.textContent = silent ? "取消静音" : "静音";
  mute.setAttribute("aria-label", silent ? "取消配乐静音" : "静音配乐");
  mute.setAttribute("aria-pressed", String(silent));
}
function applyVolume() {
  if (!audio) return;
  audio.volume = volume;
  audio.muted = muted;
}
function getAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  applyVolume();
  audio.addEventListener("playing", () => {
    // The existing optional site-intro player must not overlap article music.
    window.__introAudioStore?.audio.pause();
    state = "playing";
    render();
  });
  audio.addEventListener("waiting", () => {
    if (state === "playing") state = "loading";
    render();
  });
  audio.addEventListener("pause", () => {
    if (state !== "error" && state !== "blocked") state = "paused";
    render();
  });
  audio.addEventListener("ended", () => {
    state = "ended";
    render();
  });
  audio.addEventListener("error", () => {
    if (track && audio?.error) {
      state = "error";
      render();
    }
  });
  for (const event of ["timeupdate", "loadedmetadata", "durationchange"])
    audio.addEventListener(event, render);
  return audio;
}
function stopTrack() {
  requestId++;
  audio?.pause();
  if (audio) {
    audio.removeAttribute("src");
    audio.load();
  }
  track = undefined;
  state = "idle";
}
function selectTrack(next: Track) {
  if (sameTrack(track, next)) return;
  stopTrack();
  track = next;
  state = stopped || muted || volume === 0 ? "paused" : "idle";
}
function play(userInitiated: boolean) {
  if (!track || (!userInitiated && (stopped || muted || volume === 0))) {
    render();
    return;
  }
  if (userInitiated) {
    stopped = false;
    savePreferences();
  }
  const media = getAudio();
  if (media.getAttribute("src") !== track.src) media.src = track.src;
  if (state === "error") media.load();
  media.loop = track.loop;
  applyVolume();
  const id = ++requestId;
  state = "loading";
  render();
  // Called synchronously inside the gallery click, before Astro navigates.
  void media.play().catch((error: unknown) => {
    if (id !== requestId) return;
    const name = error instanceof DOMException ? error.name : "";
    state =
      name === "NotAllowedError"
        ? "blocked"
        : name === "AbortError"
          ? "paused"
          : "error";
    render();
  });
}
function bindPanel() {
  controls?.abort();
  controls = new AbortController();
  panel = document.querySelector<HTMLElement>("[data-post-music]");
  const next = readTrack(panel);
  if (!next || !panel) {
    stopTrack();
    return;
  }
  const alreadySelected = sameTrack(track, next);
  selectTrack(next);
  const options = { signal: controls.signal };
  panel.querySelector("[data-music-play]")!.addEventListener(
    "click",
    () => {
      if (state === "loading" || state === "playing") {
        requestId++;
        stopped = true;
        audio?.pause();
        state = "paused";
        savePreferences();
        render();
      } else play(true);
    },
    options
  );
  panel.querySelector("[data-music-mute]")!.addEventListener(
    "click",
    () => {
      const silent = muted || volume === 0;
      muted = !silent;
      if (silent && volume === 0) volume = defaultVolume;
      stopped = muted;
      applyVolume();
      savePreferences();
      render();
    },
    options
  );
  panel
    .querySelector<HTMLInputElement>("[data-music-volume]")!
    .addEventListener(
      "input",
      event => {
        volume = Math.min(
          maxVolume,
          Math.max(0, Number((event.target as HTMLInputElement).value) / 100)
        );
        if (volume === 0) stopped = true;
        else muted = false;
        applyVolume();
        savePreferences();
        render();
      },
      options
    );
  panel.querySelector<HTMLInputElement>("[data-music-seek]")!.addEventListener(
    "input",
    event => {
      if (!audio || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.min(
        audio.duration,
        Math.max(0, Number((event.target as HTMLInputElement).value))
      );
      render();
    },
    options
  );
  render();
  if (!alreadySelected) play(false);
}

document.addEventListener("click", event => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
    "a[data-music-link]"
  );
  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  )
    return;
  const url = new URL(link.href);
  if (url.origin !== location.origin) return;
  const next = readTrack(link, url.pathname);
  if (next) {
    selectTrack(next);
    play(false);
  }
});
document.addEventListener("astro:before-swap", event => {
  controls?.abort();
  panel = null;
  const nextDocument = (event as Event & { newDocument: Document }).newDocument;
  const next = readTrack(
    nextDocument.querySelector<HTMLElement>("[data-post-music]")
  );
  if (!sameTrack(track, next)) stopTrack();
});
document.addEventListener("astro:page-load", bindPanel);
window.addEventListener("pagehide", () => {
  panel = null;
  stopTrack();
});
window.addEventListener("pageshow", event => {
  if (event.persisted) bindPanel();
});
bindPanel();
