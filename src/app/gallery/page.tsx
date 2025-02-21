"use client";

import { useEffect, useState, useMemo, useDeferredValue, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Twitter,
  Linkedin,
  Instagram,
  ArrowLeft,
  X,
  Filter,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SocialMediaPost {
  id: number;
  platform: "twitter" | "twitter_thread" | "instagram" | "linkedin";
  username: string;
  content: string;
  img_url?: string;
  created_at: string;
}

type FilterType = "all" | "twitter" | "twitter_thread" | "instagram" | "linkedin";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.25 },
  },
  exit: { opacity: 0, y: -5, transition: { type: "tween", ease: "easeIn", duration: 0.2 } },
};

const contentVariants = {
  collapsed: { opacity: 0, height: 0 },
  expanded: { opacity: 1, height: "auto" },
};

interface FilterButtonProps {
  type: FilterType;
  active: boolean;
  onClick: () => void;
}

const FilterButton = ({ type, active, onClick }: FilterButtonProps) => {
  const iconMap = {
    twitter: <Twitter className="w-4 h-4 text-blue-500" />,
    twitter_thread: <Twitter className="w-4 h-4 text-purple-500" />,
    instagram: <Instagram className="w-4 h-4 text-pink-500" />,
    linkedin: <Linkedin className="w-4 h-4 text-blue-700" />,
    all: <Filter className="w-4 h-4 text-gray-500" />,
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1 rounded-full border transition ${
        active
          ? "bg-cyan-600 text-white border-cyan-600"
          : "bg-gray-800 text-gray-400 border-gray-700"
      }`}
    >
      {iconMap[type]}
      <span className="text-xs font-medium">
        {type === "twitter_thread" ? "THREADS" : type.toUpperCase()}
      </span>
    </motion.button>
  );
};

interface PostProps {
  post: SocialMediaPost;
  isExpanded: boolean;
  onExpand: (id: number | null) => void;
  onCopy: (text: string) => void;
  onDownload: (url: string, username: string) => void;
}

const Post = memo(({ post, isExpanded, onExpand, onCopy, onDownload }: PostProps) => {
  const isThread = post.platform === "twitter_thread";
  const getThreadTweets = useCallback((content: string) => content.split("\n\n"), []);

  return (
    <motion.div
      layout="position"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={() => onExpand(isExpanded ? null : post.id)}
      className="mb-6 break-inside-avoid bg-gray-800 border border-gray-700 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-gray-700">
            {post.platform === "twitter" || post.platform === "twitter_thread" ? (
              <Twitter className={`w-5 h-5 ${post.platform === "twitter" ? "text-blue-500" : "text-purple-500"}`} />
            ) : post.platform === "instagram" ? (
              <Instagram className="w-5 h-5 text-pink-500" />
            ) : (
              <Linkedin className="w-5 h-5 text-blue-700" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {post.platform === "twitter" || post.platform === "twitter_thread"
                ? "@" + post.username
                : post.username}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-300">
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                key="expanded"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {isThread
                  ? getThreadTweets(post.content).map((tweet, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <div className="text-xs text-cyan-400">Tweet {idx + 1}</div>
                        <ReactMarkdown className="prose prose-sm prose-invert">
                          {tweet}
                        </ReactMarkdown>
                      </div>
                    ))
                  : (
                    <ReactMarkdown className="prose prose-sm prose-invert">
                      {post.content}
                    </ReactMarkdown>
                  )}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <ReactMarkdown className="prose prose-sm prose-invert">
                  {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                </ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {post.img_url && (
        <div className="relative overflow-hidden">
          <motion.img
            src={post.img_url}
            alt="Visual"
            className="w-full h-48 object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "tween", duration: 0.3 }}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end gap-2 p-3 bg-gray-900/80"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(post.content);
            }}
            className="text-xs text-cyan-400 border border-cyan-400 px-2 py-1 rounded hover:bg-cyan-400/10"
          >
            Copy
          </button>
          {post.img_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(post.img_url!, post.username);
              }}
              className="text-xs text-cyan-400 border border-cyan-400 px-2 py-1 rounded hover:bg-cyan-400/10"
            >
              Download
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(null);
            }}
            className="text-xs text-cyan-400 border border-cyan-400 px-2 py-1 rounded hover:bg-cyan-400/10"
          >
            Close
          </button>
        </motion.div>
      )}
    </motion.div>
  );
});

export default function FuturisticMasonryGallery() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [notification, setNotification] = useState("");

  // Memoized filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        post.username.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        post.content.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchFilter = filterType === "all" || post.platform === filterType;
      return matchSearch && matchFilter;
    });
  }, [posts, deferredSearch, filterType]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("social_media_posts")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification("Copied!");
      setTimeout(() => setNotification(""), 2000);
    } catch {
      setNotification("Copy failed!");
      setTimeout(() => setNotification(""), 2000);
    }
  }, []);

  const handleDownload = useCallback((url: string, username: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${username}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-4 right-4 bg-cyan-700 px-4 py-2 rounded-md text-sm"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 text-center">
          <Link href="/" legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block p-2 mb-4 rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <ArrowLeft className="w-6 h-6 text-cyan-400" />
            </motion.a>
          </Link>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Futuristic Archive</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            A dynamic archive of social media posts – glimpse into tomorrow’s digital narrative.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {(["all", "twitter", "twitter_thread", "instagram", "linkedin"] as FilterType[]).map(
              (type) => (
                <FilterButton
                  key={type}
                  type={type}
                  active={filterType === type}
                  onClick={() => setFilterType(type)}
                />
              )
            )}
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-48 transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-4 h-4 bg-cyan-500 rounded-full mx-auto"
            />
            <p className="mt-2 text-sm text-gray-400">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            <AnimatePresence initial={false}>
              {filteredPosts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  isExpanded={expandedPostId === post.id}
                  onExpand={setExpandedPostId}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}