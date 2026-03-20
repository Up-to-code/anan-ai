function canCaptureScreenshot(): boolean {
  return Boolean(
    typeof navigator !== "undefined" && navigator.mediaDevices?.getDisplayMedia
  );
}

function createVideoElement(): HTMLVideoElement {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  return video;
}

async function loadVideoMetadata(video: HTMLVideoElement): Promise<void> {
  // Video element uses callback-based API, wrapping in Promise is necessary
  // oxlint-disable-next-line eslint-plugin-promise(avoid-new)
  await new Promise<void>((resolve, reject) => {
    // oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
    video.onloadedmetadata = () => resolve();
    // oxlint-disable-next-line eslint-plugin-unicorn(prefer-add-event-listener)
    video.onerror = () => reject(new Error("Failed to load screen stream"));
  });
}

async function capturePngBlob(video: HTMLVideoElement): Promise<Blob | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.drawImage(video, 0, 0, width, height);
  // canvas.toBlob uses callback-based API, wrapping in Promise is necessary
  // oxlint-disable-next-line eslint-plugin-promise(avoid-new)
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

function formatTimestamp(date: Date): string {
  return date
    .toISOString()
    .replaceAll(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
}

function stopStream(stream: MediaStream | null) {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function cleanupVideo(video: HTMLVideoElement) {
  video.pause();
  video.srcObject = null;
}

export async function captureScreenshot(): Promise<File | null> {
  if (!canCaptureScreenshot()) {
    return null;
  }

  let stream: MediaStream | null = null;
  const video = createVideoElement();

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true,
    });
    video.srcObject = stream;

    await loadVideoMetadata(video);
    await video.play();

    const blob = await capturePngBlob(video);
    if (!blob) {
      return null;
    }

    const timestamp = formatTimestamp(new Date());

    return new File([blob], `screenshot-${timestamp}.png`, {
      lastModified: Date.now(),
      type: "image/png",
    });
  } finally {
    stopStream(stream);
    cleanupVideo(video);
  }
}

