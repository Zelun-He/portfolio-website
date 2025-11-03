"use client";
import React from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="lg:py-16">
      {/* Top Section: Animated Title and Image */}
      <div className="grid grid-cols-1 sm:grid-cols-12 mb-8">
        {/* Left: Animated Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-8 place-self-center text-center sm:text-left"
        >
          <h1 className="text-white text-4xl sm:text-5xl lg:text-8xl font-extrabold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-300 to-white">
              Hello, I'm{" "}
            </span>
            <br />
            <TypeAnimation
              sequence={[
                "Zelun",
                1000,
                "a Deep Learning Developer",
                1000,
                "a Machine Learning Developer",
                1000,
                "a Web Developer",
                1000,
              ]}
              wrapper="span"
              speed={50}
              style={{ 
                fontSize: "1em", 
                display: "block",
                minHeight: "2.4em"
              }}
              repeat={Infinity}
            />
          </h1>
        </motion.div>

        {/* Right: Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-4 place-self-center mt-4 lg:mt-0"
        >
          <div className="rounded-full bg-[#181818] w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] relative overflow-hidden">
            <Image
              src="/Images/hero-image.jpg"
              alt="hero image"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Static Text and Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center sm:text-left"
      >
        <p className="text-[#ADB7BE] text-base sm:text-lg mb-6 lg:text-xl">
          I play too much League of Legends.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          {/* Hire Me scrolls to email section */}
          <a
            href="#contact"
            className="px-6 py-3 w-full sm:w-fit rounded-full bg-gradient-to-br from-red-600 via-orange-300 to-white hover:bg-slate-200 text-black text-center"
          >
            Hire Me
          </a>

          {/* Download CV button */}
          <a
            href="/resume.pdf"
            download
            className="px-1 py-1 w-full sm:w-fit rounded-full bg-gradient-to-br from-red-600 via-orange-300 to-white hover:bg-slate-800 text-white border border-white text-center"
          >
            <span className="block bg-[#121212] hover:bg-slate-800 rounded-full px-5 py-2">
              Download CV
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
