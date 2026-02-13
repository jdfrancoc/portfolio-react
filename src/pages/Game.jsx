// src/pages/Game.jsx
import React, { useState, useEffect } from "react";
import Game from "@/components/Game";
import { Layout } from "@/components/Layout";

export function GamePage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/independent?status=true')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch countries');
        return response.json();
      })
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto my-12 px-4 py-8 bg-background text-foreground overflow-x-hidden">
        <h1 className="text-3xl font-bold mb-4 text-primary">Elimination Game</h1>
        <p className="mb-6 text-muted-foreground">
          Think of a <span className="text-primary font-bold">country</span> based on the prompt.<br></br> If your answer matches the randomly selected country, you're eliminated!
        </p>
        
        {loading && <p>Loading countries...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && <Game countries={countries} />}
      </div>
    </Layout>
  );
}