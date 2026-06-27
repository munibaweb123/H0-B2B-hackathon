import { MapPin, Mail, Globe, Share, MessageCircle } from "lucide-react";

const SOCIALS = [
  { icon: Globe, label: "LinkedIn" },
  { icon: Share, label: "Twitter" },
  { icon: MessageCircle, label: "Instagram" },
];

export function ContactInfoPanel() {
  return (
    <div className="flex-1 bg-maroon-dark px-8 py-16 lg:px-16 text-white">
      <h2 className="font-serif text-4xl font-bold mb-12">PropFlow AI</h2>

      {/* Office */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-blush flex-shrink-0" />
          <h3 className="font-serif text-xl font-semibold">Our Office</h3>
        </div>
        <p className="text-white/70 text-sm leading-relaxed pl-7">
          123 Innovation Way, Suite 400<br />
          Cityville, ST 12345
        </p>
      </div>

      {/* Email */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-blush flex-shrink-0" />
          <h3 className="font-serif text-xl font-semibold">Email Us</h3>
        </div>
        <a
          href="mailto:hello@propflow.ai"
          className="text-blush underline underline-offset-2 text-sm pl-7 hover:text-white transition-colors"
        >
          hello@propflow.ai
        </a>
      </div>

      {/* Social */}
      <div className="mb-10">
        <h3 className="font-serif text-xl font-semibold mb-4">Social Media</h3>
        <div className="flex gap-3">
          {SOCIALS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              aria-label={label}
              className="w-10 h-10 bg-maroon-medium rounded-full flex items-center justify-center hover:bg-maroon-light transition-colors"
            >
              <Icon className="w-4 h-4 text-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="bg-maroon-medium/40 rounded-xl h-44 mt-6 flex items-center justify-center text-white/50 text-sm">
        Map · 123 Innovation Way
      </div>
    </div>
  );
}
