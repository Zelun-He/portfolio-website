"use client";
import React, { useState, useRef } from "react";
import ProjectCard from "./ProjectCard";
import ProjectTag from "./ProjectTag";
import { motion, useInView } from "framer-motion";

const projectsData = [
    {
        id:1,
        title:"React Portfolio Website",
        description: "Portfolio website to display my work",
        image:"images/projects/1.png",
        tag: ["ALL", "web"],
        gitUrl: "/",
        previewUrl: "/",
    },
    {
        id:2,
        title:"A Comparison of Transformer Encoder and Decoder Architecture",
        description: "Paper on our Ablation studies on Dozerformer",
        image:"images/projects/2.png",
        tag: ["ALL", "web"],
        gitUrl: "/",
        previewUrl: "/",
    },
    {
        id:3,
        title:"Real Time Translation App",
        description:"Experience seamless multilingual communication with my real-time translation app, which uses Kotlin and Python with FastAPI to combine Whisper and Google Cloud APIs for instant speech-to-text and translation. The app features a push-to-talk interface that streams audio for immediate transcription, translation, and natural-sounding text-to-speech playback.",
        image:"images/projects/3.png",
        tag: ["ALL", "web"],
        gitUrl: "/",
        previewUrl:"/",
    },
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