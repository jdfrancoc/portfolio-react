import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const skills = [
    {name: "HTML/CSS", level: 95, category: "frontend"},
    {name: "Javascript", level: 95, category: "frontend"},
    {name: "React", level: 75, category: "frontend"},
    {name: "TypeScript", level: 75, category: "frontend"},
    {name: "Tailwind CSS", level: 70, category: "frontend"},
    {name: "Mapbox", level: 85, category: "frontend"},
    {name: "jQuery", level: 90, category: "frontend"},
    {name: "Python", level: 80, category: "backend"},
    {name: "Flask", level: 75, category: "backend"},
    {name: "FastAPI", level: 65, category: "backend"},
    {name: "PostgreSQL", level: 70, category: "backend"},
    {name: "Git/GitHub", level: 65, category: "tools"},
    {name: "Docker", level: 55, category: "tools"},
    {name: "Figma", level: 85, category: "tools"},
    {name: "VS Code", level: 95, category: "tools"},
    {name: "ArcGIS / QGIS", level: 90, category: "tools"},
    {name: "Tableau", level: 85, category: "tools"},
]

const categories = ["all", "frontend", "backend", "tools"]

export const SkillsSection = () => {
    const [activeCategory, setActiveCategory] = useState("all")
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        setAnimate(false)
        const timeout = setTimeout(() => setAnimate(true), 100) // delay to trigger CSS transition
        return () => clearTimeout(timeout)
    }, [activeCategory])

    const filteredSkills = skills.filter(
        (skill) => activeCategory === "all" || skill.category === activeCategory
    );

    return (
        <section 
            id="skills" 
            className="py-24 px-4 relative bg-secondary/30"
        >
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                    My <span className="text-primary">Skills</span>
                </h2>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((category) => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                                activeCategory === category
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary/70 text-foreground hover:bg-secondary"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map((skill, key) => (
                        <div key={key} className="bg-card p-6 rounded-lg shadow-xs card-hover">
                            <div className="text-left mb-4">
                                <h3 className="font-semibold text-lg"> {skill.name} </h3>
                            </div>
                            <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: animate ? `${skill.level}%` : "0%" }}
                                />
                            </div>

                            <div className="text-right mt-1">
                                <span className="text-sm text-muted-foreground">{skill.level}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
