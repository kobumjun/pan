import Image from "next/image";
import { PostImage } from "@/lib/types";

interface Props {
  images: PostImage[];
}

export function ImageGrid({ images }: Props) {
  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    const img = images[0];
    return (
      <div className="mt-2">
        <Image
          src={img.image_url}
          alt="이미지"
          width={600}
          height={400}
          className="border border-gray-200 max-h-96 w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {images.map((img) => (
        <div key={img.id} className="border border-gray-200 bg-black/5 flex items-center justify-center">
          <Image
            src={img.image_url}
            alt="이미지"
            width={300}
            height={200}
            className="max-h-40 w-auto object-contain"
          />
        </div>
      ))}
    </div>
  );
}

