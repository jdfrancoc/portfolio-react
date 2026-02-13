\# 🚀 Personal Portfolio & Interactive Games

Welcome to my personal portfolio website! This project is built with React and serves as both a professional portfolio and a platform for interactive web applications.

\## 🌟 Overview

This repository contains the source code for my personal portfolio website, hosted on GitHub Pages. The site features a modern, responsive design with both light and dark theme support, and serves as a central hub for various interactive applications I've developed.

\## 🎯 Features

\### Portfolio Section

\- \*\*Professional Showcase\*\*: Highlights my skills, projects, and professional experience

\- \*\*Responsive Design\*\*: Optimized for all devices from mobile to desktop

\- \*\*Theme Support\*\*: Seamless light/dark mode switching with persistent user preference

\- \*\*Smooth Animations\*\*: Engaging but professional animations and transitions

\- \*\*Interactive Elements\*\*: Dynamic star background effect in dark mode

\### Interactive Applications

The portfolio is designed to host multiple interactive applications as separate pages:

\#### 🎮 Country Elimination Game

A geography-based word game where players test their knowledge of world countries:

\- Random prompts based on first letters, continents, or languages

\- Interactive map display using DeckGL and MapLibre

\- Dynamic country fact display

\- Responsive design with theme support

\- Smart autocomplete input (requires 4+ characters for suggestions)

\- Real-time map style switching based on theme

\#### 🚧 Future Applications (Planned)

The modular architecture makes it easy to add new interactive apps:

\- Additional games and tools as separate routes

\- Consistent layout and styling across all pages

\- Shared components and utilities

\## 🛠️ Technology Stack

\- \*\*Frontend Framework\*\*: React 18 with TypeScript

\- \*\*Routing\*\*: React Router DOM v6

\- \*\*Styling\*\*: Tailwind CSS with custom theming

\- \*\*Maps\*\*: DeckGL + MapLibre GL

\- \*\*Animations\*\*: Custom CSS animations

\- \*\*Build Tool\*\*: Vite

\- \*\*Deployment\*\*: GitHub Pages

\## 📁 Project Structure

\`\`\`

src/

├── components/ # Reusable UI components

│ ├── Game.tsx # Main game component

│ ├── Layout.tsx # Shared page layout

│ ├── Navbar.tsx # Navigation with mobile support

│ ├── ThemeToggle.tsx # Theme switcher

│ └── StarBackground.tsx # Animated stars (dark mode)

├── pages/ # Page components

│ ├── Home.tsx # Portfolio homepage

│ ├── Game.tsx # Game page wrapper

│ └── NotFound.tsx # 404 page

├── hooks/ # Custom React hooks

│ └── useTheme.ts # Theme detection hook

└── lib/ # Utilities and helpers

\`\`\`

\## 🎨 Theme System

The website features a sophisticated theme system:

\- \*\*Light Mode\*\*: Clean, professional appearance for daytime viewing

\- \*\*Dark Mode\*\*: Eye-friendly dark theme with animated star field

\- \*\*Persistent\*\*: User preference saved in localStorage

\- \*\*Smooth Transitions\*\*: Seamless switching between themes

\- \*\*Map Integration\*\*: Map styles automatically match the selected theme

\## 🚀 Getting Started

\### Prerequisites

\- Node.js (v14 or higher)

\- npm or yarn

\### Installation

\`\`\`bash

\# Clone the repository

git clone https://github.com/yourusername/portfolio.git

\# Navigate to project directory

cd portfolio

\# Install dependencies

npm install

\# Start development server

npm run dev

\`\`\`

\### Building for Production

\`\`\`bash

\# Build the project

npm run build

\# Preview production build

npm run preview

\# Deploy to GitHub Pages

npm run deploy

\`\`\`

\## 🎮 Playing the Country Game

1\. Navigate to the Game page using the navigation menu

2\. Read the prompt (e.g., "Think of a country in Europe")

3\. Type your answer in the input field

4\. After typing 4+ characters, suggestions will appear

5\. Select a country from the suggestions or continue typing

6\. Click "Lock In" to submit your answer

7\. See if you survived the round or got eliminated!

The game features:

\- Dynamic map zoom to the selected country

\- Detailed country information panel

\- Score tracking across rounds

\- Immediate feedback on your guess

\## 🤝 Contributing

While this is a personal portfolio, I'm open to suggestions and improvements! Feel free to:

\- Open issues for bugs or feature requests

\- Submit pull requests for improvements

\- Fork the project for your own use

\## 📝 License

This project is open source and available under the MIT License.

\## 📬 Contact

Feel free to reach out through the contact form on my portfolio or connect with me on:

\- \[GitHub\](https://github.com/yourusername)

\- \[LinkedIn\](https://linkedin.com/in/yourprofile)

\- \[Twitter\](https://twitter.com/yourhandle)

\---

\*Built with ❤️ using React and Tailwind CSS\*