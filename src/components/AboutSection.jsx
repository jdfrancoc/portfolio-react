import { BarChart3, ClipboardList, Code } from "lucide-react";

export const AboutSection = () => {
    return <section id="about" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                About <span className="text-primary">Me</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h3 className="text-2xl font-semibold">Passionate problem solver</h3>
                    <p className="text-muted-foreground">¡Hola! I'm JD Franco, a Spain-born, Northern Virginia-based GIS & Technology Consultant blending global perspective and dedication. My background as a lifelong athlete and connector fuels my drive for teamwork, innovation, and community-building.</p>
                    <p className="text-md font-semibold">Sports & Teamwork Values</p>
                    <p className="text-muted-foreground">From the age of seven, basketball has played a central role in my life, shaping my commitment to discipline and collaboration. Competing at various levels—sometimes as a leader, other times as the youngest player supporting my team—I’ve learned the true power of teamwork. Caring for teammates, adapting to different roles, and striving towards collective goals on and off the court have instilled in me resilience, adaptability, and a drive for shared success.</p>
                    <p className="text-md font-semibold">Sociability & Community Focus</p>
                    <p className="text-muted-foreground">Growing up in Spain, social life was always at the heart of daily experience. I deeply value having trustworthy friends and reliable coworkers. I thrive on connecting with others, from building relationships in community activities to creating an inclusive environment in professional settings. Fostering meaningful connections remains a source of energy and inspiration in all that I do.</p>
                    <p className="text-md font-semibold">Leadership Philosophy</p>
                    <p className="text-muted-foreground">My leadership style is rooted in leading by example and treating everyone with kindness. I believe a happy and collaborative team is the foundation for great results. If challenges arise, facing them together not only makes the burden lighter but also brings everyone closer to a solution. It's all about contribution, mutual respect, and finding joy—even in adversity.</p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <a href="#contact" className="cosmic-button">Get In Touch</a>
                        <a href="./JD Franco Resume.pdf" className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition colors duration-300">Download CV</a>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="gradient-border p-6 card-hover">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Code className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-lg">Web Development</h4>
                                <p className="muted-foreground">Building interactive mapping applications and dashboards using React, Mapbox, and Tableau.</p>
                                <p className="muted-foreground mt-2">Delivering spatial data insights through modern, responsive web solutions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="gradient-border p-6 card-hover">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <BarChart3 className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-lg">Data Visualization & Analytics</h4>
                                <p className="muted-foreground">Designing and embedding Tableau dashboards for actionable business intelligence.</p>
                                <p className="muted-foreground mt-2">Creating custom analytics tools and dashboard extensions to visualize and interpret complex geospatial data.</p>
                            </div>
                        </div>
                    </div>
                    <div className="gradient-border p-6 card-hover">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <ClipboardList className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-lg">Technical Leadership & Solution Architecture</h4>
                                <p className="muted-foreground">Leading multidisciplinary teams and managing end-to-end projects in GIS and data engineering.</p>
                                <p className="muted-foreground mt-2">Architecting innovative solutions for cloud migration, automation, and geospatial integration.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>;
};