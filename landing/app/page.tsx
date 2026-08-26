"use client";

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WordMarquee from "@/components/WordMarquee";
import EtymologyExploder from "@/components/EtymologyExploder";
import PackGrid from "@/components/PackGrid";
import GoldSection from "@/components/GoldSection";
import GymSection from "@/components/GymSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <Nav />
      <Hero />
      <HowItWorks />
      <WordMarquee />
      <EtymologyExploder />
      <PackGrid />
      <GoldSection />
      <GymSection />
      <Footer />
    </main>
  );
}
