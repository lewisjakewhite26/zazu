"use client";

import { useState } from "react";

type Props = {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
};

// A mailto: link gives zero visible feedback on click if the visitor has no
// default mail client configured (common on work machines/Chromebooks) --
// this swaps the label briefly so the click always reads as "it worked."
export default function WaitlistLink({ href, label, className, onClick }: Props) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    onClick?.();
    setConfirming(true);
    window.setTimeout(() => setConfirming(false), 2500);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {confirming ? "Opening email…" : label}
    </a>
  );
}
