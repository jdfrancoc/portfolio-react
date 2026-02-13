// import { cn } from "@/lib/utils";
// import { Menu, X } from "lucide-react";
// import { useEffect, useState } from "react";

// const navItems = [
//     {name: "Home", href: "#hero"},
//     {name: "About", href: "#about"},
//     {name: "Skills", href: "#skills"},
//     {name: "Projects", href: "#projects"},
//     {name: "Contact", href: "#contact"},
// ]

// export const Navbar = () => {
//     const [isScrolled, setIsScrolled] = useState(false)
//     const [isMenuOpen, setIsMenuOpen] = useState(false)

//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolled(window.scrollY > 10)
//         };

//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//     return (
//         <nav className={cn(
//             "fixed w-full z-40 transition-all duration-300",
//             isScrolled ? "py-3 bg-background/80 background-blur-md shadow-xs" : "py-5"
//         )}>
//             <div className="container flex items-center justify-between" href="#hero">
//                 <a className="text-xl font-bold text-primary flex items-center">
//                     <span className="relative z-10">
//                         {" "}
//                         <span className="text-glow text-foreground">JD Franco</span> Portfolio
//                     </span>
//                 </a>

//                 {/* desktop nav */}
//                 <div className="hidden md:flex space-x-8">
//                     {navItems.map((item, key) => (
//                         <a key={key} href={item.href} className="text-foreground/80 hover:text-primary transition-colors duration-300">
//                             {item.name}
//                         </a>
//                     ))}
//                 </div>
//                 {/* mobile nav */}
//                 <button id="menubuton"
//                 onClick={() => setIsMenuOpen((prev) => !prev)} 
//                 className="md:hidden p-2 text-foreground z-50"
//                 aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}>
//                     {isMenuOpen ? <X size={24} /> : <Menu size={24}/>}{" "}
//                 </button>

//                 <div className={cn(
//                     "fixed inset-0 bg-background/95 background-blur-md z-40 flex flex-col items-center justify-center",
//                     "transition-all duration-300 md:hidden",
//                     isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//                 )}>
//                     <div className="flex flex-col space-y-8 text-xl">
//                         {navItems.map((item, key) => (
//                             <a 
//                                 key={key} href={item.href}
//                                 className="text-foreground/80 hover:text-primary transition-colors duration-300"
//                                 onClick={() => setIsMenuOpen(false)}
//                             >
//                                 {item.name}
//                             </a>
//                         ))}
//                     </div>
//                 </div>

//             </div>
//         </nav>
//     );
// }


// src/components/Navbar.jsx
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { HashLink } from 'react-router-hash-link';
import { ThemeToggle } from "./ThemeToggle"; // Make sure this import path is correct

const navItems = [
    { name: "Home", href: "/#hero" },
    { name: "About", href: "/#about" },
    { name: "Skills", href: "/#skills" },
    { name: "Projects", href: "/#projects" },
    { name: "Contact", href: "/#contact" },
    // { name: "Game", href: "/game" }, // Added Game to nav items
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when window is resized to desktop size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <nav className={cn(
            "fixed w-full z-40 transition-all duration-300",
            isScrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-xs" : "py-5"
        )}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <HashLink 
                    smooth 
                    to="/#hero" 
                    className="text-xl font-bold text-primary flex items-center"
                >
                    <span className="relative z-10">
                        <span className="text-glow text-foreground">JD Franco</span> Portfolio
                    </span>
                </HashLink>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item, key) => {
                        if (item.href === "/game") {
                            return (
                                <HashLink 
                                    key={key} 
                                    to="/game"
                                    className="text-foreground/80 hover:text-primary transition-colors duration-300"
                                >
                                    {item.name}
                                </HashLink>
                            );
                        }
                        return (
                            <HashLink 
                                key={key} 
                                smooth 
                                to={item.href}
                                className="text-foreground/80 hover:text-primary transition-colors duration-300"
                            >
                                {item.name}
                            </HashLink>
                        );
                    })}
                    {/* Theme Toggle for Desktop */}
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button and Theme Toggle */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="p-2 text-foreground z-50"
                        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={cn(
                    "fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center",
                    "transition-all duration-300 md:hidden",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    <div className="flex flex-col space-y-8 text-xl items-center">
                        {navItems.map((item, key) => {
                            if (item.href === "/game") {
                                return (
                                    <HashLink 
                                        key={key} 
                                        to="/game"
                                        className="text-foreground/80 hover:text-primary transition-colors duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </HashLink>
                                );
                            }
                            return (
                                <HashLink 
                                    key={key} 
                                    smooth 
                                    to={item.href}
                                    className="text-foreground/80 hover:text-primary transition-colors duration-300"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </HashLink>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};