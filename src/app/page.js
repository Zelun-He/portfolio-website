"use client";
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import AboutSection from "./components/AboutSection";
import ProjectsSection from "./components/ProjectsSection";
import JourneyTimeline from "./components/JourneyTimeline";
import EmailSection from "./components/EmailSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#121212]">
      <Navbar />
      {/* This div now contains only the content that needs to be width-limited/centered */}
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />
        <AboutSection/>
        <JourneyTimeline/>
        <ProjectsSection/>
        <EmailSection/>
      </div>
      {/* The Footer is now outside the container div, allowing its w-full to span the viewport */}
      <Footer/>
    </main>
  );
}