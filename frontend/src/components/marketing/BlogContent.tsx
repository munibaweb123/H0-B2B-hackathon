"use client";

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import { BlogSidebar } from "./BlogSidebar";

const ARTICLES = [
  {
    id: "1",
    category: "AI Tips",
    categoryColor: "bg-maroon-light/20 text-maroon-dark",
    title: "5 Ways AI Converts More Leads",
    excerpt:
      "Explore how artificial intelligence is transforming agency workflows, from lead scoring to automated communications and beyond.",
    imageSrc: null,
  },
  {
    id: "2",
    category: "Market Trends",
    categoryColor: "bg-gold/20 text-maroon-dark",
    title: "Quarterly Real Estate Market Outlook",
    excerpt:
      "Quarterly Real Estate Market Outlook. Explore how artificial intelligence informs market trends in international and local property markets.",
    imageSrc: null,
  },
  {
    id: "3",
    category: "Case Study",
    categoryColor: "bg-pink-accent/20 text-pink-accent",
    title: "Success Story: Streamlined Operations",
    excerpt:
      "How one Lahore-based agency cut their follow-up time by 60% using PropFlow's autonomous deal closer and AI chat.",
    imageSrc: null,
  },
  {
    id: "4",
    category: "Tech Update",
    categoryColor: "bg-maroon-medium/20 text-maroon-dark",
    title: "New Feature: Automated Site Visit Scheduling",
    excerpt:
      "PropFlow now automatically pitches matched clients, offers visit slots, and confirms bookings — all without agent intervention.",
    imageSrc: null,
  },
];

export function BlogContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ARTICLES;

  return (
    <section className="py-12 px-4 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article grid */}
        <div className="lg:col-span-2">
          {filtered.length === 0 ? (
            <p className="text-text-muted text-sm py-12 text-center">
              No articles match &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <BlogSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </section>
  );
}
