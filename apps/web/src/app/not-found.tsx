import Link from "next/link";
import { NotFoundView } from "@/components/NotFoundView";

// Unmatched URLs (outside the (site) group) get the same designed page, with a minimal header so it is never a bare error.
export default function RootNotFound() {
  return (
    <>
      <header className="border-b border-line bg-ivory"><div className="mx-auto flex h-20 max-w-7xl items-center px-5 sm:px-8"><Link href="/" className="font-serif text-[1.7rem] font-semibold text-plum-800">HerrGlow<span className="text-gold-400">.</span></Link></div></header>
      <NotFoundView />
    </>
  );
}
