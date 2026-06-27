import Image from "next/image";

interface TeamCardProps {
  name: string;
  title: string;
  imageSrc?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamCard({ name, title, imageSrc }: TeamCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-maroon-light/20 flex items-center justify-center">
            <span className="font-serif text-xl font-bold text-maroon-dark">
              {getInitials(name)}
            </span>
          </div>
        )}
      </div>

      <p className="font-serif text-maroon-dark font-semibold text-base leading-tight">
        {name}
      </p>
      <p className="text-text-muted text-sm mt-1">{title}</p>
    </div>
  );
}
