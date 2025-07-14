import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Github } from "lucide-react"
import React from "react"

interface ProjectCardProps {
  title: string
  description: string
  images: string[]
  link: string
  tags: string[]
}

export default function ProjectCard({ title, description, images, link, tags }: ProjectCardProps) {
  const [current, setCurrent] = React.useState(0);
  const hasMultiple = images && images.length > 1;
  const showImage = images && images.length > 0 ? images[current] : "/placeholder.svg";

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={showImage}
          alt={title}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          className="transition-transform hover:scale-105"
        />
        {hasMultiple && (
          <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1">&#8592;</button>
            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1">&#8594;</button>
          </>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-xl mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm hover:underline">
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
      </CardFooter>
    </Card>
  )
}
