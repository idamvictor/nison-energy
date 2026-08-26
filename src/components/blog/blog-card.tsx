import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/lib/blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 py-5">
          {post.tags.length > 0 && (
            <Badge variant="secondary" className="w-fit">
              {post.tags[0]}
            </Badge>
          )}
          <h3 className="font-heading text-base leading-snug font-semibold text-foreground">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          <p className="mt-auto pt-2 text-xs text-muted-foreground">
            {formatDate(post.publishedAt)} · {post.author}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
