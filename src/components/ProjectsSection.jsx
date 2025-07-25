import { Description } from "@radix-ui/react-toast"
import { ExternalLinkIcon } from "lucide-react"

const projects = [
    {
        id: 1,
        title: "The GC Wealth Project",
        description: "Website that embeds multiple Tableau dashboads and allow website elements to interact with the dashboards.",
        image: "/projects/cuny.png",
        tags: ["Tableau", "Front-End"],
        demoUrl: "https://wealthproject.gc.cuny.edu/",
    },
    {
        id: 2,
        title: "PG&E Fire Detection App",
        description: "A web application that uses live data to track wildfirs in California.",
        image: "/projects/pge.png",
        tags: ["Geospatial", "Front-End"],
        demoUrl: "",
    },
    {
        id: 3,
        title: "NYC Real Estate Neighborhood Guide.",
        description: "Mapbox map integrated in Wordpress displaying properties and neighborhood info",
        image: "/projects/repolus.png",
        tags: ["Geospatial", "Front-End"],
        demoUrl: "http://repolus.com/neighborhoods/",
    },
    {
        id: 4,
        title: "Showme Caribbean",
        description: "Web application that displays touristic locations around Caribben Islands with 3D views.",
        image: "/projects/showmecaribbean.png",
        tags: ["Geospatial", "Front-End"],
        demoUrl: "https://maps.showmecaribbean.com/Curacaomap",
    },
    {
        id: 5,
        title: "HOLC 'Redlining' Maps",
        description: "This publication was based on spatial analysis performed on ArcGIS' ArcMap. Comparing the old HOLC maps with current demographic data.",
        image: "/projects/holc.png",
        tags: ["Geospatial", "Publications"],
        demoUrl: "https://ncrc.org/holc/",
    },
]


export const ProjectSection = () => {
    return  <section id="projects" className="py-24 px-4 relative">
        {/* <div className="container mx-auto max-w-5xl"> */}
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                Featured <span className="text-primary">Projects</span>
                </h2>

                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Here are some of my recent projects. Each project was carefully crafted with attention to detail, performance, and user experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">

                    {projects.map((project, key) => (
                        // <div key={key} className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover">
                        <div key={key} className="inline-block w-full group bg-card rounded-lg overflow-hidden shadow-xs card-hover break-inside-avoid">
                            <div className="h-48 overflow-hidden">
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.tags.map((tag) => (
                                        <span className="px-2 py-1 text-xs font-medium border rounded-full bg-primary/20 text-secondary-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            
                                <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-3">
                                        <a href={project.demoUrl} target="_blank" className="text-foreground/80 hover:text-primary transition-colors duration-300">
                                            <ExternalLinkIcon size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    </section>
}