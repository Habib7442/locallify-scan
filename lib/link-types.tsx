import type { ComponentType, CSSProperties } from "react";
import { Calendar, FileText, Globe, Link2, MapPin, Phone, Star } from "lucide-react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export type LinkTypeIcon = ComponentType<{ className?: string; style?: CSSProperties }>;

export type LinkTypeMeta = {
  value: string;
  label: string;
  icon: LinkTypeIcon;
  color: string;
  placeholder: string;
  destinationPlaceholder: string;
};

export const LINK_TYPES: LinkTypeMeta[] = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: FaWhatsapp,
    color: "#25d366",
    placeholder: "e.g. Order on WhatsApp",
    destinationPlaceholder: "Phone number, e.g. 919876543210",
  },
  {
    value: "google_review",
    label: "Google Review",
    icon: Star,
    color: "#fbbf24",
    placeholder: "e.g. Leave us a Google Review",
    destinationPlaceholder: "https://g.page/r/...",
  },
  {
    value: "website",
    label: "Website",
    icon: Globe,
    color: "#54e0ff",
    placeholder: "e.g. Visit Our Website",
    destinationPlaceholder: "https://...",
  },
  {
    value: "call",
    label: "Call",
    icon: Phone,
    color: "#34d399",
    placeholder: "e.g. Call Us",
    destinationPlaceholder: "Phone number, e.g. 919876543210",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "#e1306c",
    placeholder: "e.g. Follow us on Instagram",
    destinationPlaceholder: "https://instagram.com/...",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    color: "#1877f2",
    placeholder: "e.g. Follow us on Facebook",
    destinationPlaceholder: "https://facebook.com/...",
  },
  {
    value: "twitter",
    label: "X (Twitter)",
    icon: FaXTwitter,
    color: "#e7e9ea",
    placeholder: "e.g. Follow us on X",
    destinationPlaceholder: "https://x.com/...",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    color: "#ff0000",
    placeholder: "e.g. Subscribe on YouTube",
    destinationPlaceholder: "https://youtube.com/...",
  },
  {
    value: "snapchat",
    label: "Snapchat",
    icon: FaSnapchat,
    color: "#fffc00",
    placeholder: "e.g. Add us on Snapchat",
    destinationPlaceholder: "https://snapchat.com/add/...",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
    color: "#0a66c2",
    placeholder: "e.g. Connect on LinkedIn",
    destinationPlaceholder: "https://linkedin.com/...",
  },
  {
    value: "github",
    label: "GitHub",
    icon: FaGithub,
    color: "#e5e7eb",
    placeholder: "e.g. View on GitHub",
    destinationPlaceholder: "https://github.com/...",
  },
  {
    value: "directions",
    label: "Directions/Maps",
    icon: MapPin,
    color: "#f87171",
    placeholder: "e.g. Get Directions",
    destinationPlaceholder: "https://maps.google.com/...",
  },
  {
    value: "menu",
    label: "Menu",
    icon: FileText,
    color: "#a78bfa",
    placeholder: "e.g. View Menu",
    destinationPlaceholder: "https://... (PDF or page)",
  },
  {
    value: "book",
    label: "Book/Appointment",
    icon: Calendar,
    color: "#54e0ff",
    placeholder: "e.g. Book an Appointment",
    destinationPlaceholder: "https://... or WhatsApp link",
  },
  {
    value: "custom",
    label: "Custom",
    icon: Link2,
    color: "#7a7a83",
    placeholder: "e.g. Custom Link",
    destinationPlaceholder: "https://...",
  },
];

export function typeMeta(type: string): LinkTypeMeta {
  return LINK_TYPES.find((t) => t.value === type) ?? LINK_TYPES[LINK_TYPES.length - 1];
}
