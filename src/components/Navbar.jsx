// src/components/Navbar.jsx
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { HashLink } from 'react-router-hash-link';
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
    { name: "Home", href: "/#hero" },
    { name: "About", href: "/#about" },
    { name: "Skills", href: "/#skills" },
    { name: "Projects", href: "/#projects" },
    { name: "Contact", href: "/#contact" },
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

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

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
                        className="p-2 text-foreground z-50 relative"
                        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={cn(
                    "fixed top-0 left-0 right-0 bottom-0",
                    "h-screen w-screen",
                    "bg-background/95 backdrop-blur-md z-40",
                    "flex flex-col items-center justify-center",
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