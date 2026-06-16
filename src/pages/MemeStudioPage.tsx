import { useState, useRef, useEffect, useCallback } from "react";
import type { PetPhoto } from "../types";

type Props = {
  photos: PetPhoto[];
  onNavigateToGallery: () => void;
};

type CaptionPosition = "bottom" | "top";

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  position: CaptionPosition
) {
  const fontSize = Math.max(28, Math.min(64, Math.round(width / 14)));
  ctx.font = `bold ${fontSize}px Impact, "Arial Black", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineWidth = Math.max(4, fontSize / 6);

  const maxLineWidth = width * 0.88;
  const lineHeight = fontSize * 1.25;
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxLineWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const padding = Math.round(height * 0.04);

  if (position === "bottom") {
    ctx.textBaseline = "alphabetic";
    for (let i = lines.length - 1; i >= 0; i--) {
      const y = height - padding - (lines.length - 1 - i) * lineHeight;
      ctx.strokeStyle = "black";
      ctx.strokeText(lines[i], width / 2, y);
      ctx.fillStyle = "white";
      ctx.fillText(lines[i], width / 2, y);
    }
  } else {
    ctx.textBaseline = "top";
    for (let i = 0; i < lines.length; i++) {
      const y = padding + i * lineHeight;
      ctx.strokeStyle = "black";
      ctx.strokeText(lines[i], width / 2, y);
      ctx.fillStyle = "white";
      ctx.fillText(lines[i], width / 2, y);
    }
  }
}

export default function MemeStudioPage({ photos, onNavigateToGallery }: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<PetPhoto | null>(null);
  const [mood, setMood] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [captionPosition, setCaptionPosition] = useState<CaptionPosition>("bottom");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const redrawCanvas = useCallback(() => {
    if (!selectedPhoto?.signedUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setCanvasError(null);
    setCanvasReady(false);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      if (selectedCaption) {
        drawCaption(ctx, selectedCaption, canvas.width, canvas.height, captionPosition);
      }
      setCanvasReady(true);
    };

    img.onerror = () => {
      setCanvasError(
        "Could not load the image for canvas. This is usually a CORS issue — see the README for Supabase Storage CORS setup."
      );
      setCanvasReady(false);
    };

    img.src = selectedPhoto.signedUrl!;
  }, [selectedPhoto, selectedCaption, captionPosition]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  async function generateCaptions() {
    if (!mood.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    setCaptions([]);
    setSelectedCaption(null);

    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.trim() }),
      });

      if (!res.ok) {
        let errMsg = `Server error (${res.status})`;
        if (res.status === 404) {
          errMsg =
            "API not found. Please run `vercel dev` instead of `npm run dev` to enable the AI feature locally.";
        } else {
          try {
            const err = (await res.json()) as { error?: string };
            errMsg = err.error ?? errMsg;
          } catch {
            // non-JSON body — keep the status-based message
          }
        }
        throw new Error(errMsg);
      }

      const data = (await res.json()) as { captions: string[] };
      setCaptions(data.captions ?? []);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (!canvasRef.current || !canvasReady) return;
    const link = document.createElement("a");
    link.download = `mimi-meme-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  function handleSelectCaption(caption: string) {
    setSelectedCaption((prev) => (prev === caption ? null : caption));
  }

  const hasPhotos = photos.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🎨 Meme Studio
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Pick a photo, describe the vibe, and let AI write the perfect cat caption.
        </p>
      </div>

      {!hasPhotos ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🖼️</p>
          <p className="font-medium text-gray-500">No photos in your gallery yet</p>
          <p className="text-sm mt-1 mb-6">
            Upload some photos first — then come back to make memes!
          </p>
          <button onClick={onNavigateToGallery} className="btn-primary">
            📸 Go to Gallery
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Pick a photo */}
          <section className="card">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="w-6 h-6 bg-rose-100 text-rose-500 rounded-full text-xs flex items-center justify-center font-bold">
                1
              </span>
              Pick a photo
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setCaptions([]);
                    setSelectedCaption(null);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                    selectedPhoto?.id === photo.id
                      ? "border-rose-400 shadow-md scale-[1.03]"
                      : "border-transparent hover:border-rose-200"
                  }`}
                  title={photo.caption}
                >
                  {photo.signedUrl ? (
                    <img
                      src={photo.signedUrl}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                  )}
                  {selectedPhoto?.id === photo.id && (
                    <div className="absolute inset-0 bg-rose-400/10 flex items-end justify-end p-1">
                      <span className="w-5 h-5 bg-rose-400 rounded-full text-white text-xs flex items-center justify-center">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedPhoto && (
              <p className="text-xs text-gray-400 mt-2">
                Selected: <span className="text-gray-600">{selectedPhoto.caption}</span>
              </p>
            )}
          </section>

          {/* Step 2: Describe the mood */}
          <section className="card">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="w-6 h-6 bg-rose-100 text-rose-500 rounded-full text-xs flex items-center justify-center font-bold">
                2
              </span>
              Describe the vibe
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isGenerating && selectedPhoto && generateCaptions()}
                placeholder='e.g. "judging me for eating at 2am" or "Monday morning"'
                className="input flex-1"
                maxLength={120}
              />
              <button
                onClick={generateCaptions}
                disabled={isGenerating || !mood.trim() || !selectedPhoto}
                className="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </span>
                ) : (
                  "✨ Generate"
                )}
              </button>
            </div>
            {!selectedPhoto && mood.trim() && (
              <p className="text-xs text-amber-500 mt-2">← Pick a photo first</p>
            )}
            {generateError && (
              <p className="text-xs text-red-400 mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                😿 {generateError}
              </p>
            )}
          </section>

          {/* Step 3: Pick a caption */}
          {captions.length > 0 && (
            <section className="card">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <span className="w-6 h-6 bg-rose-100 text-rose-500 rounded-full text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Pick a caption
              </h2>
              <div className="space-y-2">
                {captions.map((caption, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectCaption(caption)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      selectedCaption === caption
                        ? "border-rose-300 bg-rose-50 text-rose-700 font-medium"
                        : "border-gray-100 bg-gray-50 text-gray-700 hover:border-rose-200 hover:bg-orange-50"
                    }`}
                  >
                    <span className="mr-2 text-gray-300">{i + 1}.</span>
                    {caption}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click a caption to preview it on the photo. Click again to deselect.
              </p>
            </section>
          )}

          {/* Canvas preview + download */}
          {selectedPhoto && (
            <section className="card">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="w-6 h-6 bg-rose-100 text-rose-500 rounded-full text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Preview &amp; Download
                </h2>

                {/* Caption position toggle */}
                {selectedCaption && (
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 text-xs">
                    <button
                      onClick={() => setCaptionPosition("top")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        captionPosition === "top"
                          ? "bg-white shadow-sm text-gray-700 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      Text top
                    </button>
                    <button
                      onClick={() => setCaptionPosition("bottom")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        captionPosition === "bottom"
                          ? "bg-white shadow-sm text-gray-700 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      Text bottom
                    </button>
                  </div>
                )}
              </div>

              {canvasError ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                  <p className="font-medium mb-1">⚠️ Canvas error</p>
                  <p className="text-xs">{canvasError}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full max-w-md rounded-2xl shadow-md bg-gray-100"
                    style={{ display: canvasReady ? "block" : "none" }}
                  />
                  {!canvasReady && (
                    <div className="w-full max-w-md aspect-square rounded-2xl bg-orange-50 flex items-center justify-center">
                      <span className="text-gray-300 text-4xl">🖼️</span>
                    </div>
                  )}
                  {!selectedCaption && (
                    <p className="text-sm text-gray-400">
                      {captions.length === 0
                        ? "Generate captions above, then pick one to add text to your photo."
                        : "Select a caption above to add it to your photo."}
                    </p>
                  )}
                  {canvasReady && selectedCaption && (
                    <button onClick={handleDownload} className="btn-primary">
                      ⬇️ Download Meme PNG
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
