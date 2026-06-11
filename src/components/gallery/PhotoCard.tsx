import type { PetPhoto } from "../../types";

type Props = { photo: PetPhoto };

export default function PhotoCard({ photo }: Props) {
  return (
    <div className="card p-0 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.caption}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="font-medium text-gray-800 text-sm mb-2">{photo.caption}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{photo.date}</span>
        </div>
      </div>
    </div>
  );
}
