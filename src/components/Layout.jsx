// src/components/Layout.jsx
import { ThemeToggle } from "./ThemeToggle";
import { StarBackground } from "./StarBackground";
import { Navbar } from "./Navbar";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ThemeToggle />
      <StarBackground />
      <Navbar />
      <main>
        {children}
      </main>
      {/* Optional: Add footer here if you want it on all pages */}
    </div>
  );
};