// src/components/StarBackground.jsx
import { useEffect, useState } from "react";

export const StarBackground = () => {
    const [stars, setStars] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check theme on mount and when theme changes
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };

        // Initial check
        checkTheme();

        // Create a mutation observer to watch for class changes on html element
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Only generate stars if in dark mode
        if (isDarkMode) {
            generateStars();
        }

        const handleResize = () => {
            if (isDarkMode) {
                generateStars();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isDarkMode]);

    const generateStars = () => {
        const numberOfStars = Math.floor(
            (window.innerWidth * window.innerHeight) / 10000
        );
        
        const newStars = [];

        for (let i = 0; i < numberOfStars; i++) {
            newStars.push({
                id: i,
                size: Math.random() * 3 + 1,
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: Math.random() * 0.5 + 0.5,
                animationDuration: Math.random() * 4 + 2,
            });
        }
        setStars(newStars);
    };

    // Don't render anything if not in dark mode
    if (!isDarkMode) return null;

    return (
        <div id="stars" className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map((star) => (
                <div 
                    key={star.id} 
                    className="star animate-pulse-subtle" 
                    style={{
                        width: star.size + "px",
                        height: star.size + "px",
                        left: star.x + "%",
                        top: star.y + "%",
                        opacity: star.opacity,
                        animationDuration: star.animationDuration + "s",
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                    }} 
                />
            ))}
        </div>
    );
};