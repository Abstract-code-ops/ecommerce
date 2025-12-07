"use client"
import { Search } from "lucide-react";

type Props = {
  mobile?: boolean;
  isScrolled?: boolean;
  onOpen?: () => void; // added callback
}

export default function SearchBar({ mobile = false, onOpen }: Props) {
  // wrapper classes differ for mobile vs desktop
  const wrapperClass = mobile
    ? "flex items-center"
    : "relative hidden items-center md:flex";

  // mobile: full width labeled button; desktop: compact icon button
  const mobileBtn = "flex items-center gap-2 px-4 py-2 rounded-md";
  const desktopBtn = `w-10 h-10 flex items-center justify-center bg-transparent rounded-full`;

  return (
    <div className={wrapperClass}>
      <button
        onClick={() => onOpen?.()}
        aria-label="Open search"
        className={mobile ? mobileBtn : desktopBtn}
      >
        <Search size={20} className="cursor-pointer" />
        {mobile && <span className="font-medium">Search</span>}
      </button>

      {/* Modal is controlled by parent (Header) */}
    </div>
  );
}
