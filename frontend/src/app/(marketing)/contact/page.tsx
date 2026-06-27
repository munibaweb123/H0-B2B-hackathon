import { ContactForm } from "@/components/marketing/ContactForm";
import { ContactInfoPanel } from "@/components/marketing/ContactInfoPanel";

export const metadata = {
  title: "Contact Us — PropFlow AI",
  description:
    "Get in touch with the PropFlow team to bring AI-powered tools to your real estate agency.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <ContactForm />
      <ContactInfoPanel />
    </div>
  );
}
