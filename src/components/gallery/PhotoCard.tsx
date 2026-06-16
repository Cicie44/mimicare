import type { PetPhoto } from "../../types";

type Props = {
  photo: PetPhoto;
  onDelete?: () => void;
  onClick?: () => void;
};

export default function PhotoCard({ photo, onDelete, onClick }: Props) {
  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Delete "${photo.caption}"? This cannot be undone.`)) {
      onDelete?.();
    }
  }

  return (
    <div
      className="card p-0 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {photo.signedUrl ? (
          <img
            src={photo.signedUrl}
            alt={photo.caption}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-orange-50 flex items-center justify-center text-gray-300">
            <span className="text-4xl">📸</span>
          </div>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-gray-400 hover:text-red-400 hover:border-red-200 text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete photo"
          >
            ✕
          </button>
        )}
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
