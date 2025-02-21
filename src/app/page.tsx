import Hero from "@/components/Hero";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Hub",
  description: "AI-Powered Cross-Platform Content Generation",
};

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <Hero />
    </main>
  );
}
