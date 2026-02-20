"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const timelineEntries = [
  {
    id: "exp-neuralseek",
    type: "Experience",
    dateRange: "Recent",
    title: "Software Engineer Intern",
    org: "NeuralSeek",
    summary:
      "Worked as a software engineer intern, contributing to applied AI product development and practical engineering deliverables.",
  },
  {
    id: "exp-nof1",
    type: "Experience",
    dateRange: "Recent",
    title: "Software Engineer Intern",
    org: "N-of-1.ai",
    summary:
      "Supported software engineering efforts focused on AI-driven solutions in a startup environment.",
  },
  {
    id: "exp-oasis",
    type: "Experience",
    dateRange: "Recent",
    title: "Software Engineer Intern",
    org: "Oasis.ai",
    summary:
      "Contributed to engineering initiatives as an intern, helping build and refine AI-centric product features.",
  },
  {
    id: "exp-hui-liu",
    type: "Experience",
    dateRange: "Recent",
    title: "Deep Learning Researcher",
    org: "Dr. Hui Liu | Missouri State University",
    summary:
      "Conducted deep learning research, exploring model design and experimentation for impactful academic outcomes.",
  },
  {
    id: "exp-yifan-zhang",
    type: "Experience",
    dateRange: "Recent",
    title: "Deep Learning Researcher",
    org: "Yifan Zhang | Missouri State University",
    summary:
      "Worked on deep learning research projects at Missouri State University with a focus on rigorous experimentation.",
  },
  {
    id: "edu-msu",
    type: "Education",
    dateRange: "In Progress",
    title: "Bachelors in Computer Science (Minor in Mathematics)",
    org: "Missouri State University",
    summary:
      "Pursuing undergraduate studies with emphasis on computer science fundamentals, mathematics, and applied AI topics.",
  },
  {
    id: "edu-stlcc",
    type: "Education",
    dateRange: "2022",
    title: "Associate Degree in General Studies",
    org: "Saint Louis Community College",
    summary:
      "Completed associate-level studies and built the academic foundation for continued computer science education.",
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
