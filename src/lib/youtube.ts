/** Ask a YouTube iframe (enablejsapi=1) to stream infoDelivery messages tagged with `id`. */
export function ytListen(iframe: HTMLIFrameElement | null, id: string) {
  const win = iframe?.contentWindow;
  if (!win) return;
  const send = () => win.postMessage(JSON.stringify({ event: "listening", id, channel: "widget" }), "*");
  send();
  // the player may not be ready on first load
  setTimeout(send, 1500);
  setTimeout(send, 4000);
}

export function ytSrc(id: string) {
  const origin = typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0${origin}`;
}

export type YtProgress = { id: string; currentTime: number; duration: number; percent: number };
export const YT_EVENT = "ingri:yt";
