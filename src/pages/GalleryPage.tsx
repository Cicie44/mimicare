import type { PetPhoto } from "../types";
import PhotoCard from "../components/gallery/PhotoCard";

type Props = { photos: PetPhoto[] };

export default function GalleryPage({ photos }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📸 Photo Gallery
        </h1>
        <p className="text-gray-400 text-sm mt-1">Mimi's most adorable moments</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </div>
  );
}
