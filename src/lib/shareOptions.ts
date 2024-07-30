import { ShareOption } from "@/types";
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaWhatsapp } from "react-icons/fa";

const url = window.location.href;
const getShareOptions = (url : string) : ShareOption[] => {
  return [
    {
      name: "Facebook",
      icon: FaFacebookF,
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      link: `http://www.twitter.com/share?url=${encodeURIComponent(url)}`,
    },
  ];
}

export { getShareOptions };