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
                    <p className="text-muted-foreground">¡Hola! I'm JD Franco, a Spain-born, Northern Virginia-based Principal Consultant and Software Engineer specializing in geospatial analytics, Databricks, and modern web mapping applications.</p>
                    <p className="text-muted-foreground">I design and ship end-to-end solutions, from cloud data pipelines and Databricks Apps to React frontends that turn complex spatial data into intuitive, interactive experiences for clients.</p>
                    <p className="text-md font-semibold">Sports & Teamwork Values</p>
                    <p className="text-muted-foreground">From the age of seven, basketball has played a central role in my life, shaping my commitment to discipline and collaboration. Competing at various levels, sometimes as a leader, other times as the youngest player supporting my team, I’ve learned the true power of teamwork. Caring for teammates, adapting to different roles, and striving towards collective goals on and off the court have instilled in me resilience, adaptability, and a drive for shared success. These experiences directly shape how I lead delivery teams today: adapting to roles, communicating clearly, and always keeping the team goal ahead of individual ego.</p>
                    <p className="text-md font-semibold">Sociability & Community Focus</p>
                    <p className="text-muted-foreground">Growing up in Spain, social life was always at the heart of daily experience. I deeply value having trustworthy friends and reliable coworkers. I thrive on connecting with others, from building relationships in community activities to creating an inclusive environment in professional settings. Fostering meaningful connections remains a source of energy and inspiration in all that I do. In consulting, this translates into being approachable, empathetic, and intentional about building trust with both teammates and clients.</p>
                    <p className="text-md font-semibold">Leadership Philosophy</p>
                    <p className="text-muted-foreground">My leadership style is rooted in leading by example and treating everyone with kindness. I believe a happy and collaborative team is the foundation for great results. If challenges arise, facing them together not only makes the burden lighter but also brings everyone closer to a solution. It's all about contribution, mutual respect, and finding joy, even in adversity. Whether I’m guiding a migration to Databricks or architecting a new geospatial app, I focus on clarity, kindness, and shared ownership of outcomes.</p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <a href="#contact" className="cosmic-button">Get In Touch</a>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="gradient-border p-6 card-hover">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Code className="h-6 w-6 text-primary"/>
                            </div>
                            <div className="text-left">
                                <h4 className="font-semibold text-lg">Web & App Engineering</h4>
                                <p className="muted-foreground">Building interactive geospatial applications and dashboards using React, TypeScript, Mapbox, and modern UI libraries.</p>
                                <p className="muted-foreground mt-2">Connecting Python/Flask or FastAPI backends and Databricks Apps to deliver fast, production-ready experiences.</p>
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
                                <p className="muted-foreground">Designing and embedding Tableau dashboards and analytics tools for actionable business intelligence.</p>
                                <p className="muted-foreground mt-2">Creating custom extensions and geospatial visualizations that help stakeholders explore complex spatial patterns intuitively.</p>
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
                                <p className="muted-foreground">Leading multidisciplinary teams and managing end-to-end projects across GIS, data engineering, and application development.</p>
                                <p className="muted-foreground mt-2">Architecting cloud-native solutions for Databricks PVC-to-E2 migrations, automation workflows, and geospatial integration at scale.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>;
};