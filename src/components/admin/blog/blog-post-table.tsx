"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import type { BlogPost } from "@/lib/blog-posts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogPostTable({ items }: { items: BlogPost[] }) {
  const removePost = useBlogPosts((s) => s.removePost);
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No articles found</p>
        <p className="text-sm text-muted-foreground">Try a different search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead>Article</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((post) => (
              <TableRow key={post.slug}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-border">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <Link
                      href={`/admin/blog/${post.slug}`}
                      className="line-clamp-2 max-w-sm font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {post.title}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{post.author}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </TableCell>
                <TableCell>
                  {post.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="secondary">+{post.tags.length - 2}</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Article actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/admin/blog/${post.slug}`} />}>
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={<Link href={`/blog/${post.slug}`} target="_blank" />}
                      >
                        <ExternalLink />
                        View on site
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setPendingDelete(post)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article</DialogTitle>
            <DialogDescription>
              Remove &ldquo;{pendingDelete?.title}&rdquo; from the blog? This
              takes it off the live site immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) removePost(pendingDelete.slug);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
