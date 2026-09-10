"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ExternalLink,
  MoreHorizontal,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminPostRow } from "@/lib/blog/types";
import { removePost } from "@/lib/blog/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogPostsView({ posts }: { posts: AdminPostRow[] }) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminPostRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q),
    );
  }, [posts, query]);

  function confirmDelete() {
    if (!pendingDelete) return;
    setError(null);
    const id = pendingDelete.id;
    startTransition(async () => {
      const result = await removePost(id);
      setPendingDelete(null);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Newspaper className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Blog
            </h2>
            <p className="text-sm text-muted-foreground">
              {posts.length} article{posts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/blog" target="_blank" />}
          >
            <ArrowUpRight />
            View blog
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/blog/new" />}>
            <Plus />
            Add post
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No articles found</p>
          <p className="text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead>Article</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow key={post.id}>
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
                        href={`/admin/blog/${post.id}`}
                        className="line-clamp-2 max-w-sm font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {post.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post.author}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(post.publishedAt)}
                  </TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal />
                        <span className="sr-only">Article actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/admin/blog/${post.id}`} />}
                        >
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link href={`/blog/${post.id}`} target="_blank" />
                          }
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
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article</DialogTitle>
            <DialogDescription>
              Permanently delete &ldquo;{pendingDelete?.title}&rdquo;? This takes
              it off the live site and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
