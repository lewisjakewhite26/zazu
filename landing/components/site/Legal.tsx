import Link from "next/link";
import type { ReactNode } from "react";

import { Footer, Nav } from "@/components/site/Brand";

/** Shared layout for the legal pages: one readable column, real headings, lists and spacing. */
export default function Legal({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main" className="legal">
        <div className="wrap">
          <article className="legal-inner">
            <Link href="/" className="legal-back">
              ← Zazu home
            </Link>
            <h1>{title}</h1>
            <p className="updated">Last updated: {updated}</p>
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
