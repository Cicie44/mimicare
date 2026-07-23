import { useState } from "react";
import type { PetPhoto } from "../types";
import PhotoCard from "../components/gallery/PhotoCard";
import PhotoUploadForm from "../components/gallery/PhotoUploadForm";
import { formatDate } from "../utils/formatDate";

type Props = {
  photos: PetPhoto[];
  petId: string;
  onAdd: (file: File, caption: string, tags: string[], date: string) => Promise<void>;
  onDelete: (photoId: string, storagePath: string) => Promise<void>;
};

export default function GalleryPage({ photos, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<PetPhoto | null>(null);

  async function handleAdd(file: File, caption: string, tags: string[], date: string) {
    await onAdd(file, caption, tags, date);
    setShowForm(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Photo Gallery</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {photos.length > 0 ? `${photos.length} photo${photos.length === 1 ? "" : "s"}` : "No photos yet"}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            ＋ Add Photo
          </button>
        )}
      </div>

      {showForm && (
        <PhotoUploadForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {photos.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="text-sm font-medium text-gray-500">No photos yet</p>
          <p className="text-xs mt-1 mb-6">Upload your first photo memory.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setLightbox(photo)}
              onDelete={() => onDelete(photo.id, photo.storagePath)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-light leading-none"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={lightbox.signedUrl}
              alt={lightbox.caption}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 px-1">
              <p className="text-white font-medium">{lightbox.caption}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {lightbox.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-1.5">{formatDate(lightbox.date)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
