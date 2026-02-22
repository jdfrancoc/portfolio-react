// // src/pages/Game.jsx
// import React, { useState, useEffect } from "react";
// import Game from "@/components/Game";
// import { Layout } from "@/components/Layout";

// export function GamePage() {
//   const [countries, setCountries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('https://restcountries.com/v3.1/independent?status=true')
//       .then(response => {
//         if (!response.ok) throw new Error('Failed to fetch countries');
//         return response.json();
//       })
//       .then(data => {
//         setCountries(data);
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <Layout>
//       <div className="container mx-auto my-12 px-4 py-8 bg-background text-foreground overflow-x-hidden">
//         <h1 className="text-3xl font-bold mb-4 text-primary">Elimination Game</h1>
//         <p className="mb-6 text-muted-foreground">
//           Think of a <span className="text-primary font-bold">country</span> based on the prompt.<br></br> If your answer matches the randomly selected country, you're eliminated!
//         </p>
        
//         {loading && <p>Loading countries...</p>}
//         {error && <p className="text-red-500">Error: {error}</p>}
//         {!loading && !error && <Game countries={countries} />}
//       </div>
//     </Layout>
//   );
// }

// src/pages/Game.jsx
// src/pages/Game.jsx
import React, { useState, useEffect } from "react";
import Game from "@/components/Game";
import GeoDetective from "@/components/GeoDetective";
import { Layout } from "@/components/Layout";

const TABS = [
  {
    id: "elimination",
    label: "🗺️ Elimination",
    description: "Pick a country matching the prompt — avoid the secret one!",
  },
  {
    id: "detective",
    label: "🕵️ GeoDetective",
    description: "Decode clues and click the mystery country on the map.",
  },
];

export function GamePage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("elimination");

  useEffect(() => {
    const fetchIndependent = fetch("https://restcountries.com/v3.1/independent?status=true")
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch independent countries"); return r.json(); });
    const fetchNonIndependent = fetch("https://restcountries.com/v3.1/independent?status=false")
      .then((r) => { if (!r.ok) throw new Error("Failed to fetch non-independent countries"); return r.json(); });

    Promise.all([fetchIndependent, fetchNonIndependent])
      .then(([independent, nonIndependent]) => {
        // Union by cca3 — independent takes priority if duplicate
        const seen = new Set();
        const merged = [...independent, ...nonIndependent].filter((c) => {
          if (seen.has(c.cca3)) return false;
          seen.add(c.cca3);
          return true;
        });
        setCountries(merged);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <Layout>
      <div className="container mx-auto my-12 px-4 py-8 bg-background text-foreground overflow-x-hidden">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-1 text-primary">Country Games</h1>
        <p className="mb-5 text-muted-foreground text-sm">
          {activeTabData?.description}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-bold rounded-t-md border-2 border-b-0 transition-all
                ${
                  activeTab === tab.id
                    ? "border-primary bg-primary/10 text-primary -mb-[2px]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && <p className="text-muted-foreground">Loading countries…</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "elimination" && <Game countries={countries} />}
            {activeTab === "detective" && <GeoDetective countries={countries} />}
          </>
        )}
      </div>
    </Layout>
  );
}