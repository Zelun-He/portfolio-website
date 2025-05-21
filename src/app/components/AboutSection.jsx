import React from "react";
import Image from "next/image";

const AboutSection = () => { 
    return (
        <section className="text-white">
            <div className="md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 xl:gap-16 sm:py-16 xl:px-16">
                <Image src="/images/about-image.jpg" width={500} height={500} alt="About Me Image" />
                <div>
                    <h2 className="text-4xl font-bold mb-4">About Me</h2>
                    <p className="text-lg">
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
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
