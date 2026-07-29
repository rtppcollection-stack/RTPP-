import React, { useState } from "react";
import { FileEdit, Plus, Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ContentPost {
  id: string;
  title: string;
  category: "Market Update" | "Token Highlight" | "System Announcement";
  content: string;
  authorRole: "editor";
  createdAt: string;
  status: "Published" | "Draft";
}

const INITIAL_POSTS: ContentPost[] = [
  {
    id: "post-1",
    title: "RTPP Token Gas Optimization & Staking Upgrade",
    category: "System Announcement",
    content:
      "We have finalized the smart contract optimization for multi-chain routing, cutting gas fees by 24% across Base and Arbitrum.",
    authorRole: "editor",
    createdAt: new Date().toISOString(),
    status: "Published",
  },
  {
    id: "post-2",
    title: "Weekly Crypto Sentiment & Whale Accumulation Trends",
    category: "Market Update",
    content:
      "Bitcoin whales have accumulated over 14,000 BTC in the last 72 hours while DEX volume spiked across top meme pairs.",
    authorRole: "editor",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: "Published",
  },
];

export function EditorPanel() {
  const [posts, setPosts] = useState<ContentPost[]>(() => {
    try {
      const saved = localStorage.getItem("rtpp_editor_posts_v1");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ContentPost["category"]>("Market Update");
  const [content, setContent] = useState("");

  const handleCreatePost = (status: "Published" | "Draft") => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter a title and content for your article.");
      return;
    }

    const newPost: ContentPost = {
      id: `editor-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      authorRole: "editor",
      createdAt: new Date().toISOString(),
      status,
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    try {
      localStorage.setItem("rtpp_editor_posts_v1", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setTitle("");
    setContent("");
    toast.success(
      `Content ${status === "Published" ? "published successfully!" : "saved as draft."}`,
    );
  };

  const handleDelete = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    try {
      localStorage.setItem("rtpp_editor_posts_v1", JSON.stringify(updated));
    } catch {
      // ignore
    }
    toast.info("Article deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/30 bg-surface/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                Editor Portal & Content Studio
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Editor Privilege
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Draft, publish, and manage live market updates, announcements, and token spotlights.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Headline Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sol Surge & Ecosystem Breakout Analysis..."
                className="bg-background/80"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContentPost["category"])}
                className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Market Update">Market Update</option>
                <option value="Token Highlight">Token Highlight</option>
                <option value="System Announcement">System Announcement</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Article Body Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write market commentary or announcement details..."
              rows={4}
              className="bg-background/80"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCreatePost("Draft")}
              className="gap-1.5 text-xs"
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleCreatePost("Published")}
              className="gap-1.5 text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Publish Now
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/70 p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" /> Managed Content Feed ({posts.length})
        </h3>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-border/50 bg-background/60 p-4 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{post.title}</span>
                  <Badge variant="outline" className="text-[10px] border-border/60">
                    {post.category}
                  </Badge>
                  <Badge
                    className={
                      post.status === "Published"
                        ? "bg-success/20 text-success border-success/30 text-[10px]"
                        : "bg-muted text-muted-foreground text-[10px]"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                <div className="text-[10px] text-muted-foreground/70 flex items-center gap-2">
                  <span>Author: Editor</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
