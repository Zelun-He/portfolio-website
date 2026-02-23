"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const timelineEntries = [
  {
    id: "edu-msu",
    type: "Education",
    dateRange: "Expected Dec 2025",
    title: "Bachelors in Computer Science (Minor in Mathematics)",
    org: "Missouri State University",
    summary:
      "Pursuing undergraduate studies with emphasis on computer science fundamentals, mathematics, and applied AI topics.",
  },
  {
    id: "exp-msu-research",
    type: "Experience",
    dateRange: "Jan 2025 – Present",
    title: "Research Assistant (Deep Learning)",
    org: "Missouri State University | Supervisors: Yifan Zhang, Hui Liu",
    summary:
      "Conducting deep-learning ablation studies on transformer architectures and developing a transformer-based classifier for oncogene vs tumor-suppressor gene sequences.",
  },
  {
    id: "exp-nof1",
    type: "Experience",
    dateRange: "Jun 2025 – Aug 2025",
    title: "Software Engineer Intern",
    org: "N-of-1.ai",
    summary:
      "Developed a clinical documentation app with FastAPI, Next.js, and OpenAI APIs, including scalable backend APIs and a React/TypeScript frontend.",
  },
  {
    id: "exp-oasis",
    type: "Experience",
    dateRange: "Jun 2025 – Present",
    title: "Software Engineer Intern",
    org: "Oasis.ai",
    summary:
      "Building and scaling backend systems for an AI journaling platform and maintaining relational database schemas to support efficient data access and storage.",
  },
  {
    id: "exp-neuralseek",
    type: "Experience",
    dateRange: "Aug 2025 – Present",
    title: "Software Engineer Intern",
    org: "NeuralSeek",
    summary:
      "Engineered multi-agent RAG pipelines and agent-routing logic aligned with AWS partner-network practices to improve response quality and reliability.",
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
      <h2 className="text-center text-4xl font-bold mb-4">Journey</h2>
      <p className="text-center text-[#ADB7BE] text-lg mb-10">
        Experience and education milestones that shaped my path.
      </p>

      <div ref={ref} className="relative mx-auto max-w-4xl">
        <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#4B5563] via-[#9CA3AF] to-[#4B5563] md:left-1/2 md:-translate-x-1/2" />

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
              <span className="absolute left-4 top-6 h-3 w-3 -translate-x-1/2 rounded-full border border-white/70 bg-[#121212] shadow-[0_0_0_4px_rgba(59,130,246,0.15)] md:left-1/2" />

              <div
                className={`md:w-[calc(50%-2rem)] ${
                  index % 2 === 0
                    ? "md:mr-auto md:pr-8"
                    : "md:ml-auto md:pl-8"
                }`}
              >
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-cyan-200">
                      {entry.type}
                    </span>
                    <span className="text-[#ADB7BE]">{entry.dateRange}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{entry.title}</h3>
                  <p className="text-cyan-100">{entry.org}</p>
                  <p className="mt-3 text-[#D1D5DB]">{entry.summary}</p>
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
