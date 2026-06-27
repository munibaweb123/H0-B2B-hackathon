"use client";

import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  imageSrc?: string | null;
}

export function ArticleCard({
  category,
  categoryColor,
  title,
  excerpt,
  imageSrc,
}: ArticleCardProps) {
  const { toast } = useToast();

  function handleReadClick(e: React.MouseEvent) {
    e.preventDefault();
    toast({ title: "Full article coming soon" });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Image / placeholder */}
      <div className="h-40 bg-maroon-dark/10 flex items-center justify-center relative flex-shrink-0">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Newspaper className="w-8 h-8 text-maroon-dark/30" />
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className={cn(
            "self-start text-xs font-medium px-2 py-0.5 rounded-full",
            categoryColor
          )}
        >
          {category}
        </span>
        <h3 className="font-serif text-maroon-dark font-semibold mt-2 text-lg leading-snug">
          {title}
        </h3>
        <p className="text-text-muted text-sm mt-1 line-clamp-3 flex-1">
          {excerpt}
        </p>
        <button
          onClick={handleReadClick}
          className="text-pink-accent text-sm font-medium mt-3 inline-block hover:underline text-left"
        >
          Read Article →
        </button>
      </div>
    </div>
  );
}
