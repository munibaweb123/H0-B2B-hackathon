import { BlogHero } from "@/components/marketing/BlogHero";
import { BlogContent } from "@/components/marketing/BlogContent";

export const metadata = {
  title: "Insights — PropFlow AI",
  description:
    "Thought leadership on AI-driven real estate: market trends, case studies, and product updates from PropFlow.",
};

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <BlogContent />
    </>
  );
}
