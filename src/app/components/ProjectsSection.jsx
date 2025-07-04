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
        image:"images/1.png",
        tag: ["ALL", "web"],
        gitUrl: "https://github.com/Zelun-He/portfolio-website",
        previewUrl: "https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:2,
        title:"A Comparison of Transformer Encoder and Decoder Architecture",
        description: "PMy Dozerformer studies explored the architectural differences between encoder-only and decoder-only transformer models for time-series forecasting. By conducting targeted ablation experiments, I analyzed each component’s impact on performance to better understand and streamline transformer-based approaches for temporal data.",
        image:"images/2.png",
        tag: ["ALL", "web"],
        gitUrl: "https://github.com/Zelun-He/Dozerformer-Decoder-Only",
        previewUrl: "https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:3,
        title:"Real Time Translation App",
        description:"Experience seamless multilingual communication with my real-time translation app, which uses Kotlin and Python with FastAPI to combine Whisper and Google Cloud APIs for instant speech-to-text and translation. The app features a push-to-talk interface that streams audio for immediate transcription, translation, and natural-sounding text-to-speech playback.",
        image:"images/3.png",
        tag: ["ALL", "web"],
        gitUrl: "https://github.com/Zelun-He/RealTimeTranslationApp",
        previewUrl:"https://www.linkedin.com/in/zelun-he-2b22351bb/",
    },
    {
        id:4,
        title: "Space Invaders",
        description:"",
    }
];

const ProjectsSection = () => {
  return (
    <>
    <h2 className ="text-center text-4xl font-bold test-white mt-4 mb-8 md:mb-12">
    My Projects
    </h2>
    <div className="text-white flex-row justify-center items-center gap-2 py-6">
      <button>All</button>
      <button>Web</button>
    </div>
    <div className ="grid md:grid-cols-3 gap-8 md:gap-12">
    {projectsData.map((project) =>(
       <ProjectCard 
       key= {project.id} 
       title={project.title} 
       description={project.description} 
       imgUrl={project.image} 
       tags={project.tag}
       gitUrl={project.gitUrl}
       previewUrl={project.previewUrl}
       />
    ))}
    </div>
    </>
  );
};
export default ProjectsSection;