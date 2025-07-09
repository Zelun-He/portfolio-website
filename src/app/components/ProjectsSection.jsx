"use client";
import React, { useState, useRef } from "react";
import ProjectCard from "./ProjectCard";
import ProjectTag from "./ProjectTag";
import { motion, useInView } from "framer-motion";

const projectsData = [
    {
        id:1,
        title:"React Portfolio Website",
        description: "My portfolio website showcases my projects, skills, and experience as a software engineer through a clean, responsive design. It highlights my work with interactive project cards, a professional overview, and intuitive navigation to demonstrate my technical and creative abilities.",
        image:"/Images/1.png",
        tag: ["All", "Web"],
        gitUrl: "https://github.com/Zelun-He/portfolio-website",
        previewUrl: "https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:2,
        title:"A Comparison of Transformer Encoder and Decoder Architecture",
        description: "My Dozerformer studies explored the architectural differences between encoder-only and decoder-only transformer models for time-series forecasting. By conducting targeted ablation experiments, I analyzed each component’s impact on performance to better understand and streamline transformer-based approaches for temporal data.",
        image:"/Images/2.png",
        tag: ["All", "Research"],
        gitUrl: "https://github.com/Zelun-He/Dozerformer-Decoder-Only",
        previewUrl: "https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:3,
        title:"Real Time Translation App",
        description:"Experience seamless multilingual communication with my real-time translation app, which uses Kotlin and Python with FastAPI to combine Whisper and Google Cloud APIs for instant speech-to-text and translation. The app features a push-to-talk interface that streams audio for immediate transcription, translation, and natural-sounding text-to-speech playback.",
        image:"/Images/3.png",
        tag: ["All", "Mobile"],
        gitUrl: "https://github.com/Zelun-He/RealTimeTranslationApp",
        previewUrl:"https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:4,
        title: "Space Invaders Game",
        description:"Recreation of the classic game Space Invaders! I wanted to try game programming and this was a great introduction using C++ and Raylib.",
        image:"/Images/4.png",
        tag:["All", "Web"],
        gitUrl: "https://github.com/Zelun-He/Space_Invaders"
      }
];

const ProjectsSection = () => {
  const [tag, setTag] = useState("All");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const handleTagChange = (newTag) => {
    setTag(newTag);
  };

  const filteredProjects = projectsData.filter((project) =>
    project.tag.includes(tag)
  );

  const cardVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  return (
    <section id="projects">
      <h2 className="text-center text-4xl font-bold text-white mt-4 mb-8 md:mb-12">
        My Projects
      </h2>
      <div className="text-white flex flex-row justify-center items-center gap-2 py-6">
        <ProjectTag
          onClick={handleTagChange}
          name="All"
          isSelected={tag === "All"}
        />
        <ProjectTag
          onClick={handleTagChange}
          name="Web"
          isSelected={tag === "Web"}
        />
        <ProjectTag
          onClick={handleTagChange}
          name="Mobile"
          isSelected={tag === "Mobile"}
        />
        <ProjectTag
          onClick={handleTagChange}
          name="Research"
          isSelected={tag === "Research"}
          />
      </div>
      <ul ref={ref} className="grid md:grid-cols-3 gap-8 md:gap-12">
        {filteredProjects.map((project, index) => (
          <motion.li
            key={index}
            variants={cardVariants}
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            transition={{ duration: 0.3, delay: index * 0.4 }}
          >
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              imgUrl={project.image}
              gitUrl={project.gitUrl}
              previewUrl={project.previewUrl}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectsSection;