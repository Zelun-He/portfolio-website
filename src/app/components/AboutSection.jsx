"use client";
import React, {useTransition, useState, startTransition } from "react";
import Image from "next/image";
import TabButton from "./TabButton";

const TAB_DATA = [
    {
        title: "Skills",
        id: "skills",
        content: (
            <ul className="list-disc pl-2">
                <li>Python</li>
                <li>C++</li>
                <li>JavaScript/TypeScript</li>
                <li>Kotlin</li>
                <li>Next.js</li>
                <li>React.js</li>
                <li>TailwindCSS</li>
                <li>HTML/CSS</li>
                <li>PostgreSQL</li>
                <li>SQLite</li>
                <li>REST API design with FastAPI and Flask</li>
            </ul>
        )
    },
    {
        title: "Education",
        id: "education",
        content: (
            <ul className="list-disc pl-2"> 
                <li>Bachelors in Computer Science with a Minor in Mathematics - Missouri State University (In Progress)</li>
                <li>Associate Degree in General Studies - Saint Louis Community College - 2022</li>
            </ul>
        )
    },
    {
        title: "Experience",
        id: "experience",
        content: (
            <ul className="list-disc pl-2">  
                <li>Software Engineer Intern at N-of-1.ai </li>
                <li>Software Engineer Intern at Oasis.ai</li>
                <li>Deep Learning Researcher - Dr. Hui Liu | Missouri State University</li>
                <li>Deep Learning Researcher - Yifan Zhang | Missouri State University</li>
            </ul>
        )
    }
]
const AboutSection = () => {
    
    const [tab,setTab] = useState("skills");
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (id) => {
        startTransition(() => {
                setTab(id);
            });
        };
    return (
        <section className="text-white">
            <div className="md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 xl:gap-16 sm:py-16 xl:px-16">
                <Image src="/Images/about-image.jpg" width={500} height={500} alt="About Me Image" />
                <div className="mt-4 md:mt-0 text-left flex flex-col h-full">
                    <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
                    <p className="text-base md:text-lg">
                        Welcome to my personal website! I'm Zelun He, a Computer Science Student at Missouri
                        State University with a current fixation on artificial intelligence, but overall 
                        passion for software development and impactful technology as well.
                        This site is a showcase of my projects, research, and resume, reflecting my
                        journey from building real-time translation apps to exploring deep learning for time-series
                        forecasting and camouflaged object detection.

                        Whether you're here to browse my work, learn more about my background, or connect for 
                        collaboration or internship opportunities, I'm glad you stopped by. Let's build something 
                        meaningful together. 
                        
                        Fun fact: I'm a big fan of Adventure Time.
                    </p>
                    <div className="flex flex-row justify-start mt-8">
                        <TabButton 
                        selectTab={() => handleTabChange("skills")} 
                        active={tab === "skills"}
                        >
                            {" "}     
                             Skills{" "}
                             </TabButton>
                        <TabButton
                        selectTab={() => handleTabChange("education")}
                        active={tab ==="education"}
                        >
                            {" "}
                            Education{" "}
                        </TabButton> 
                        <TabButton
                        selectTab={() => handleTabChange("experience")}
                        active={tab === "experience"}
                        >
                            {" "}
                            Experience{" "}
                            </TabButton> 
                    </div>
                    <div className ="mt-8" >{TAB_DATA.find((t) => t.id === tab).content}</div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
