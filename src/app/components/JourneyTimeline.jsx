"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const timelineEntries = [
  {
    id: "exp-oasis",
    type: "Experience",
    dateRange: "June 2025 – Present",
    title: "Software Engineering Intern",
    org: "MyOasis.ai",
    summary:
      "Led front-end implementation of the MyOasis landing page using React, TypeScript, and Tailwind CSS while improving cross-device performance and collaborating on compliance-sensitive modules.",
  },
  {
    id: "exp-msu-research",
    type: "Experience",
    dateRange: "January 2025 – December 2025",
    title: "Research Assistant (Deep Learning)",
    org: "Missouri State University | Supervisor: Yifan Zhang | Hui Liu",
    summary:
      "Conducted Dozerformer ablation studies for time-series forecasting and developed a DNABERT-based classifier for oncogene vs tumor suppressor gene sequences using curated COSMIC/OncoKB datasets.",
  },
  {
    id: "exp-neuralseek",
    type: "Experience",
    dateRange: "August 2025 – September 2025",
    title: "Software Engineering Intern",
    org: "NeuralSeek",
    summary:
      "Engineered multi-agent RAG pipelines and agent routing logic aligned with AWS Partner Network practices to boost response speed, accuracy, and reliability.",
  },
  {
    id: "exp-nof1",
    type: "Experience",
    dateRange: "June 2025 – August 2025",
    title: "Software Engineering Intern",
    org: "N-of-1 AI",
    summary:
      "Developed a clinical documentation app with FastAPI, Next.js, and OpenAI APIs, and architected scalable authentication and clinical note workflows for production-ready deployment.",
  },
  {
    id: "edu-msu",
    type: "Education",
    dateRange: "Expected December 2025",
    title: "B.S. Computer Science (Minor in Mathematics)",
    org: "Missouri State University",
    summary:
      "Undergraduate studies focused on computer science fundamentals, mathematics, and applied AI coursework.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const JourneyTimeline = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="journey" className="py-12 md:py-16 text-white">
      <h2 className="text-center text-4xl font-bold text-[#E5E7EB] mb-4">Journey</h2>
      <p className="text-center text-[#ADB7BE] text-lg mb-10">
        Experience and education milestones that shaped my path.
      </p>

      <div ref={ref} className="relative mx-auto max-w-4xl">
        <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#7C2D12] via-[#C2410C] to-[#EA580C] md:left-1/2 md:-translate-x-1/2" />

        <ul className="space-y-8" role="list" aria-label="Journey timeline">
          {timelineEntries.map((entry, index) => (
            <motion.li
              key={entry.id}
              variants={itemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ duration: 0.45, delay: index * 0.12 }}
              className="relative pl-12 md:pl-0"
            >
              <span className="absolute left-4 top-4 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#F97316]/80 bg-[#181818] text-[11px] font-semibold text-[#FDBA74] shadow-[0_0_0_4px_rgba(249,115,22,0.2)] md:left-1/2">
                {index + 1}
              </span>

              <div
                className={`md:w-[calc(50%-2rem)] ${
                  index % 2 === 0
                    ? "md:mr-auto md:pr-8"
                    : "md:ml-auto md:pl-8"
                }`}
              >
                <div className="rounded-xl border border-[#C2410C]/70 bg-[#181818] p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full border border-[#EA580C]/70 bg-[#121212] px-2 py-1 text-[#FDBA74]">
                      {entry.type}
                    </span>
                    <span className="text-[#ADB7BE]">{entry.dateRange}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#E5E7EB]">{entry.title}</h3>
                  <p className="text-[#ADB7BE]">{entry.org}</p>
                  <p className="mt-3 text-[#9CA2A8]">{entry.summary}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default JourneyTimeline;
