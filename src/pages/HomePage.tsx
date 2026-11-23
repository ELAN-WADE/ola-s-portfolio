import React from 'react';
import { CustomCursor } from '../components/CustomCursor';
import { Navbar } from '../components/Navbar';
import { CinematicHero } from '../components/CinematicHero';
import { BrandDesignSection } from '../components/BrandDesignSection';
import { VideoEditingSection } from '../components/VideoEditingSection';
import { TechnicalAnalysisSection } from '../components/TechnicalAnalysisSection';
import { WorkflowSection } from '../components/WorkflowSection';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#070708] text-zinc-100 selection:bg-zinc-200 selection:text-zinc-950">
      {/* Film Grain Texture for High-End Cinematic Feel */}
      <div className="film-grain" />

      {/* Fluid Interactive Cursor */}
      <CustomCursor />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative">
        {/* 1. Restructured Cinematic Hero (Brand Design -> Video Editing -> Technical Analysis) */}
        <CinematicHero />

        {/* 2. Discipline 01: Brand Design & Visual Systems */}
        <BrandDesignSection />

        {/* 3. Discipline 02: Cinematic Video Editing & Color Science */}
        <VideoEditingSection />

        {/* 4. Discipline 03: Quantitative Technical Analysis & Order Flow */}
        <TechnicalAnalysisSection />

        {/* 5. Systematized Creative Workflow */}
        <WorkflowSection />

        {/* 6. Creative Director Statement & Bio */}
        <AboutSection />

        {/* 7. Direct Inquiry & Partnership Initiation */}
        <ContactSection />
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
};

