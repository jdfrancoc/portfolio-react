// src/components/GeoDetective.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapGL from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import { useTheme } from '../hooks/useTheme';
import type { Country } from './Game';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeoFeature {
  type: 'Feature';
  properties: {
    name?: string;
    NAME?: string;
    ADMIN?: string;
    'ISO3166-1-Alpha-3'?: string;
    'ISO3166-1-Alpha-2'?: string;
    ISO_A3?: string;
    ISO_A2?: string;
  };
  geometry: any;
  id?: string;
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

type ClueType = 'region' | 'letter' | 'neighbours' | 'language' | 'landlocked' | 'population' | 'continent' | 'currency' | 'capital_letter';

interface Clue {
  type: ClueType;
  label: string;
  value: string;
  icon: string;
}

type GuessState = 'correct' | 'wrong' | null;

interface GuessRecord {
  cca3: string;
  name: string;
  state: GuessState;
}

interface GeoDetectiveProps {
  countries: Country[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 10,
  latitude: 20,
  zoom: 1.4,
  pitch: 0,
  bearing: 0,
};

const GEOJSON_SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
    getCode: (f: GeoFeature) =>
      f.properties?.['ISO3166-1-Alpha-3'] || f.properties?.ISO_A3 || '',
    getName: (f: GeoFeature) =>
      f.properties?.name || f.properties?.ADMIN || f.properties?.NAME || '',
  },
  {
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
    getCode: (f: GeoFeature) => (f.id as string) || f.properties?.ISO_A3 || '',
    getName: (f: GeoFeature) =>
      f.properties?.name || f.properties?.ADMIN || f.properties?.NAME || '',
  },
];

// ─── Clue generation ──────────────────────────────────────────────────────────

// Clues are ordered from LEAST to MOST eliminating.
// Vague clues (population, landlocked, borders) come first so early guesses
// are genuine stabs in the dark and reward geography knowledge over process
// of elimination. The giveaway clues (language, region, continent, first
// letter) are saved for last.
//
// Order:  population → landlocked → neighbours → capital letter →
//         currency → language → continent → region → first letter
function buildClues(country: Country, allCountries: Country[]): Clue[] {
  const clues: Clue[] = [];

  // 1. Population band — very vague, many countries share each band
  if (country.population) {
    const pop = country.population;
    let band = '';
    if (pop < 500_000) band = 'Under 500 thousand';
    else if (pop < 5_000_000) band = '500 thousand – 5 million';
    else if (pop < 20_000_000) band = '5 – 20 million';
    else if (pop < 100_000_000) band = '20 – 100 million';
    else band = 'Over 100 million';
    clues.push({
      type: 'population',
      label: 'Population',
      value: band,
      icon: '👥',
    });
  }

  // 2. Landlocked — binary but still leaves ~half the world
  clues.push({
    type: 'landlocked',
    label: 'Has sea access',
    value: country.landlocked ? 'No — landlocked' : 'Yes — has coastline',
    icon: '🌊',
  });

  // 3. Number of land borders — narrows geography but vaguely
  const borderCount = country.borders?.length ?? 0;
  clues.push({
    type: 'neighbours',
    label: 'Land borders',
    value:
      borderCount === 0
        ? 'None (island or enclave)'
        : `${borderCount} neighbouring ${borderCount === 1 ? 'country' : 'countries'}`,
    icon: '🤝',
  });

  // 4. Capital first letter — helpful but still many possibilities
  if (country.capital?.length) {
    clues.push({
      type: 'capital_letter',
      label: 'Capital city starts with',
      value: country.capital[0][0].toUpperCase(),
      icon: '🏛️',
    });
  }

  // 5. Currency — more specific; shared by eurozone but otherwise strong signal
  if (country.currencies) {
    const currencyNames = Object.values(country.currencies)
      .map((c) => c.name)
      .join(', ');
    clues.push({
      type: 'currency',
      label: 'Currency',
      value: currencyNames,
      icon: '💰',
    });
  }

  // 6. Language(s) — strong signal but shared across many countries
  if (country.languages) {
    const langs = Object.values(country.languages);
    clues.push({
      type: 'language',
      label: langs.length === 1 ? 'Official language' : 'Official languages',
      value: langs.join(', '),
      icon: '🗣️',
    });
  }

  // 7. Continent — eliminates ~80% of the world in one go
  if (country.continents?.length) {
    clues.push({
      type: 'continent',
      label: 'Continent',
      value: country.continents.join(' / '),
      icon: '🌍',
    });
  }

  // 8. Region / subregion — very strong; narrows to ~5–20 countries
  if (country.region) {
    clues.push({
      type: 'region',
      label: 'Region',
      value: country.subregion || country.region,
      icon: '🗺️',
    });
  }

  // 9. First letter of name — often near-definitive combined with region
  clues.push({
    type: 'letter',
    label: 'First letter of name',
    value: country.name.common[0].toUpperCase(),
    icon: '🔤',
  });

  return clues;
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const WRONG_FILL: [number, number, number, number] = [220, 50, 50, 160];
const WRONG_LINE: [number, number, number, number] = [180, 20, 20, 255];
const HOVER_FILL: [number, number, number, number] = [100, 180, 255, 130];
const HOVER_LINE: [number, number, number, number] = [60, 130, 220, 255];
const DEFAULT_FILL: [number, number, number, number] = [80, 140, 200, 60];
const DEFAULT_LINE: [number, number, number, number] = [80, 140, 200, 180];
const WIN_FILL: [number, number, number, number] = [50, 200, 100, 180];
const WIN_LINE: [number, number, number, number] = [30, 160, 70, 255];

// ─── Constants ───────────────────────────────────────────────────────────────────
// Points awarded = max(POINTS_PER_ROUND - cluesUsed + 1, 1)
// So with POINTS_PER_ROUND = 10: 1 clue → 10pts, 2 clues → 9pts … 9+ clues → 1pt
// Wrong guesses don't cost points directly, but each one auto-reveals the next
// clue, which reduces the points available for that round.
// Giving up scores 0 for the round.
const TOTAL_ROUNDS = 5;
const POINTS_PER_ROUND = 10;

// ─── Component ────────────────────────────────────────────────────────────────────

const GeoDetective: React.FC<GeoDetectiveProps> = ({ countries }) => {
  const { isDarkMode } = useTheme();

  const mapStyle = isDarkMode
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  // World GeoJSON (loaded once)
  const [worldGeo, setWorldGeo] = useState<GeoFeatureCollection | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Game state
  const [secretCountry, setSecretCountry] = useState<Country | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);       // 0 = not started
  const [roundScores, setRoundScores] = useState<number[]>([]); // score per round
  const [gameOver, setGameOver] = useState(false);            // all 5 rounds done

  // cca3 → geoCode
  const [codeMap, setCodeMap] = useState<Map<string, string>>(new Map());
  // featureIndex → cca3  (primary lookup for click/tooltip — avoids bad ISO codes)
  const [indexMap, setIndexMap] = useState<Map<number, string>>(new Map());

  // ── Load world GeoJSON once ───────────────────────────────────────────────

  useEffect(() => {
    const src = GEOJSON_SOURCES[0];
    fetch(src.url)
      .then((r) => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then((data: GeoFeatureCollection) => {
        setWorldGeo(data);
        setGeoLoading(false);
      })
      .catch(() => {
        fetch(GEOJSON_SOURCES[1].url)
          .then((r) => r.json())
          .then((data: GeoFeatureCollection) => {
            setWorldGeo(data);
            setGeoLoading(false);
          })
          .catch((e) => {
            setGeoError(e.message);
            setGeoLoading(false);
          });
      });
  }, []);

  // ── Build index→cca3 and cca3→geoCode maps when both datasets are ready ────

  useEffect(() => {
    if (!worldGeo || !countries.length) return;
    const imap = new Map<number, string>(); // featureIndex → cca3
    const cmap = new Map<string, string>(); // cca3 → geoCode
    const src = GEOJSON_SOURCES[0];

    worldGeo.features.forEach((f, index) => {
      const geoCode = src.getCode(f);
      const geoName = src.getName(f).toLowerCase().trim();

      // Try to match this GeoJSON feature to a restcountries entry.
      // We try multiple strategies because the ISO codes in geo-countries are
      // unreliable (-99 is used for Norway, France, Kosovo, etc.)
      let matched: typeof countries[0] | undefined;

      // 1. Exact ISO code (works for most countries)
      if (geoCode && geoCode !== '-99' && geoCode !== '-1') {
        matched = countries.find((c) => c.cca3 === geoCode);
      }
      // 2. Exact common name ("Norway", "France", "New Caledonia" …)
      if (!matched && geoName) {
        matched = countries.find((c) => c.name.common.toLowerCase().trim() === geoName);
      }
      // 3. Exact official name ("United States of America", "Kingdom of Norway" …)
      if (!matched && geoName) {
        matched = countries.find((c) => c.name.official.toLowerCase().trim() === geoName);
      }

      if (matched) {
        // Only map this index if we haven't already claimed this cca3
        // (avoids duplicate features overwriting each other)
        if (!cmap.has(matched.cca3)) {
          cmap.set(matched.cca3, geoCode || matched.cca3);
        }
        imap.set(index, matched.cca3);
      }
      // Unmatched features (true disputed territories) get no entry —
      // hovering highlights them individually (by index) but click/tooltip
      // return nothing since imap has no entry for their index.
    });

    setIndexMap(imap);
    setCodeMap(cmap);
  }, [worldGeo, countries]);

  // ── Reverse map: geoCode → cca3 ──────────────────────────────────────────────
  const reverseCodeMap = useMemo(() => {
    const m = new Map<string, string>();
    codeMap.forEach((geoCode, cca3) => m.set(geoCode, cca3));
    return m;
  }, [codeMap]);

  // ── Reset everything for a brand-new game ────────────────────────────────

  const resetGame = useCallback(() => {
    setScore(0);
    setCurrentRound(0);
    setRoundScores([]);
    setGameOver(false);
    setSecretCountry(null);
    setClues([]);
    setRevealedCount(0);
    setGuesses([]);
    setGameStatus('idle');
    setShowAnswer(false);
    setViewState(INITIAL_VIEW_STATE);
  }, []);

  // ── Start the next round ──────────────────────────────────────────────────

  const startGame = useCallback(() => {
    if (!countries.length) return;
    const eligible = countries.filter((c) => c.latlng && c.latlng.length === 2);
    const picked = eligible[Math.floor(Math.random() * eligible.length)];
    const generatedClues = buildClues(picked, countries);

    setCurrentRound((r) => r + 1);
    setSecretCountry(picked);
    setClues(generatedClues);
    setRevealedCount(1);
    setGuesses([]);
    setGameStatus('playing');
    setShowAnswer(false);
    setViewState(INITIAL_VIEW_STATE);
  }, [countries]);

  // ── Reveal next clue ─────────────────────────────────────────────────────

  const revealNextClue = () => {
    if (revealedCount < clues.length) {
      setRevealedCount((n) => n + 1);
    }
  };

  // ── Handle map click ──────────────────────────────────────────────────────

  const handleMapClick = useCallback(
    (info: any) => {
      if (gameStatus !== 'playing' || !secretCountry || !info.object) return;

      // Use feature index as the primary key — avoids broken ISO codes in geo-countries
      const clickedCca3 = typeof info.index === 'number' ? (indexMap.get(info.index) ?? null) : null;

      if (!clickedCca3) return; // unrecognised territory — not in our country list

      const alreadyGuessed = guesses.some((g) => g.cca3 === clickedCca3);
      if (alreadyGuessed) return;

      const correct = clickedCca3 === secretCountry.cca3;
      const clickedCountry = countries.find((c) => c.cca3 === clickedCca3);

      const newGuess: GuessRecord = {
        cca3: clickedCca3,
        name: clickedCountry?.name.common || clickedCca3,
        state: correct ? 'correct' : 'wrong',
      };

      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);

      if (correct) {
        const cluesUsed = revealedCount;
        const points = Math.max(POINTS_PER_ROUND - cluesUsed + 1, 1);
        setScore((s) => s + points);
        setRoundScores((rs) => [...rs, points]);
        setGameStatus('won');
        setShowAnswer(true);
        if (currentRound >= TOTAL_ROUNDS) setGameOver(true);
        if (secretCountry.latlng) {
          setViewState({
            longitude: secretCountry.latlng[1],
            latitude: secretCountry.latlng[0],
            zoom: 4,
            pitch: 0,
            bearing: 0,
          });
        }
      } else {
        // Wrong — auto-reveal next clue if available
        if (revealedCount < clues.length) {
          setRevealedCount((n) => n + 1);
        } else {
          // No more clues — 0 points for this round
          setRoundScores((rs) => [...rs, 0]);
          setGameStatus('lost');
          setShowAnswer(true);
          if (currentRound >= TOTAL_ROUNDS) setGameOver(true);
          if (secretCountry.latlng) {
            setViewState({
              longitude: secretCountry.latlng[1],
              latitude: secretCountry.latlng[0],
              zoom: 4,
              pitch: 0,
              bearing: 0,
            });
          }
        }
      }
    },
    [gameStatus, secretCountry, guesses, clues.length, revealedCount, reverseCodeMap, indexMap, countries, currentRound]
  );

  // ── Give up ───────────────────────────────────────────────────────────────

  const giveUp = () => {
    setRoundScores((rs) => [...rs, 0]);
    setGameStatus('lost');
    setShowAnswer(true);
    if (currentRound >= TOTAL_ROUNDS) setGameOver(true);
    if (secretCountry?.latlng) {
      setViewState({
        longitude: secretCountry.latlng[1],
        latitude: secretCountry.latlng[0],
        zoom: 4,
        pitch: 0,
        bearing: 0,
      });
    }
  };

  // ── Build DeckGL layers ───────────────────────────────────────────────────

  const layers = useMemo(() => {
    if (!worldGeo) return [];

    const wrongCca3s = new Set(
      guesses.filter((g) => g.state === 'wrong').map((g) => g.cca3)
    );
    const correctCca3 = (gameStatus === 'won' || gameStatus === 'lost')
      ? (secretCountry?.cca3 || '')
      : '';

    return [
      new GeoJsonLayer({
        id: 'world-geo',
        data: worldGeo,
        pickable: gameStatus === 'playing',
        stroked: true,
        filled: true,
        // Color by ISO code for wrong/correct, by feature index for hover.
        // This prevents -99 placeholder features from all lighting up together.
        getFillColor: (_f: any, { index }: { index: number }) => {
          const cca3 = indexMap.get(index);
          if (cca3 && cca3 === correctCca3) return WIN_FILL;
          if (cca3 && wrongCca3s.has(cca3)) return WRONG_FILL;
          if (index === hoveredIndex) return HOVER_FILL;
          return DEFAULT_FILL;
        },
        getLineColor: (_f: any, { index }: { index: number }) => {
          const cca3 = indexMap.get(index);
          if (cca3 && cca3 === correctCca3) return WIN_LINE;
          if (cca3 && wrongCca3s.has(cca3)) return WRONG_LINE;
          if (index === hoveredIndex) return HOVER_LINE;
          return DEFAULT_LINE;
        },
        getLineWidth: (_f: any, { index }: { index: number }) => {
          const cca3 = indexMap.get(index);
          if (cca3 && (cca3 === correctCca3 || wrongCca3s.has(cca3))) return 8;
          if (index === hoveredIndex) return 5;
          return 2;
        },
        lineWidthMinPixels: 1,
        updateTriggers: {
          getFillColor: [hoveredIndex, wrongCca3s, correctCca3, gameStatus, indexMap],
          getLineColor: [hoveredIndex, wrongCca3s, correctCca3, gameStatus, indexMap],
          getLineWidth: [hoveredIndex, wrongCca3s, correctCca3, gameStatus, indexMap],
        },
        onClick: handleMapClick,
        onHover: (info: any) => {
          setHoveredIndex(info.index ?? null);
        },
      }),
    ];
  }, [worldGeo, guesses, hoveredIndex, gameStatus, secretCountry, handleMapClick, indexMap]);

  // ── Tooltip ───────────────────────────────────────────────────────────────

  const getTooltip = useCallback(
    ({ object, index }: any) => {
      if (!object || typeof index !== 'number') return null;
      // Look up by feature index — same source of truth as click handler
      const cca3 = indexMap.get(index);
      if (!cca3) return null; // unrecognised territory — show nothing
      const country = countries.find((c) => c.cca3 === cca3);
      if (!country) return null;
      const name = country.name.common;
      const isWrong = guesses.some((g) => g.cca3 === cca3 && g.state === 'wrong');
      const isWon = gameStatus === 'won' || gameStatus === 'lost';
      const isSecret = secretCountry?.cca3 === cca3;
      if (isWon && isSecret) return `✅ ${name}`;
      if (isWrong) return `❌ ${name}`;
      return name;
    },
    [guesses, gameStatus, secretCountry, indexMap, countries]
  );

  // ── Revealed clues ────────────────────────────────────────────────────────

  const visibleClues = clues.slice(0, revealedCount);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-screen lg:min-h-0 lg:h-[calc(100vh-300px)] relative">

      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[340px] p-4 flex flex-col gap-3 lg:border-r-2 border-b-2 lg:border-b-0 border-border overflow-y-auto">

        {/* Score + round tracker */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg text-center border-2 border-primary">
            <div className="text-primary text-xs font-bold tracking-widest uppercase">Score</div>
            <div className="text-primary text-3xl font-bold">{score}</div>
          </div>
          <div className="p-3 rounded-lg text-center border-2 border-border">
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Round</div>
            <div className="text-foreground text-3xl font-bold">
              {currentRound === 0 ? '—' : `${currentRound}/${TOTAL_ROUNDS}`}
            </div>
          </div>
        </div>

        {/* Round score pips */}
        {currentRound > 0 && (
          <div className="flex gap-1 justify-center">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
              const rs = roundScores[i];
              return (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    rs === undefined
                      ? i === currentRound - 1 && gameStatus === 'playing'
                        ? 'bg-primary animate-pulse'
                        : 'bg-border'
                      : rs > 0
                      ? 'bg-success'
                      : 'bg-destructive'
                  }`}
                  title={rs !== undefined ? `Round ${i + 1}: ${rs} pts` : `Round ${i + 1}`}
                />
              );
            })}
          </div>
        )}

        {/* ── Game-over / final score screen ───────────────────────────── */}
        {gameOver && (gameStatus === 'won' || gameStatus === 'lost') && (
          <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 text-center flex flex-col gap-3">
            <p className="text-foreground font-bold text-lg">🏁 Game Complete!</p>
            <p className="text-primary text-4xl font-bold">{score} <span className="text-base font-normal text-muted-foreground">/ {TOTAL_ROUNDS * POINTS_PER_ROUND}</span></p>
            <div className="flex flex-col gap-1 text-xs">
              {roundScores.map((rs, i) => (
                <div key={i} className="flex justify-between px-2">
                  <span className="text-muted-foreground">Round {i + 1}</span>
                  <span className={rs > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                    {rs > 0 ? `+${rs} pts` : '0 pts'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {score >= 40 ? '🌟 Outstanding!' : score >= 25 ? '👍 Well done!' : score >= 10 ? '📚 Keep practising!' : '🗺️ Time to study the map!'}
            </p>
            <button className="cosmic-button w-full" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}

        {/* Idle state */}
        {gameStatus === 'idle' && (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              A secret country will be chosen each round. Clues are revealed one by one —{' '}
              <strong className="text-foreground">click the country on the map</strong> to guess.
              Fewer clues used = more points. You have <strong className="text-foreground">{TOTAL_ROUNDS} rounds</strong>.
            </p>
            {geoLoading && (
              <p className="text-muted-foreground text-sm">Loading world map data…</p>
            )}
            {geoError && (
              <p className="text-red-500 text-sm">Map error: {geoError}</p>
            )}
            <button
              className="cosmic-button w-full"
              onClick={startGame}
              disabled={geoLoading || !!geoError || !countries.length}
            >
              Start Game
            </button>
          </div>
        )}

        {/* Playing / won / lost (mid-game) */}
        {!gameOver && (gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && (
          <>
            {/* Clues */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Clues
                </h3>
                <span className="text-xs text-muted-foreground">
                  {revealedCount} / {clues.length}
                </span>
              </div>

              {visibleClues.map((clue, i) => (
                <div
                  key={clue.type + i}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted border border-border"
                >
                  <span className="text-lg leading-none mt-0.5">{clue.icon}</span>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      {clue.label}
                    </div>
                    <div className="text-foreground text-sm font-medium">{clue.value}</div>
                  </div>
                </div>
              ))}

              {/* Locked clue preview */}
              {gameStatus === 'playing' && revealedCount < clues.length && (
                <button
                  className="flex items-center gap-2 p-2 rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full text-left"
                  onClick={revealNextClue}
                >
                  <span className="text-lg">🔒</span>
                  <span className="text-xs">Reveal next clue</span>
                </button>
              )}
            </div>

            {/* Wrong guesses */}
            {guesses.filter((g) => g.state === 'wrong').length > 0 && (
              <div>
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                  Wrong guesses
                </h3>
                <div className="flex flex-wrap gap-1">
                  {guesses
                    .filter((g) => g.state === 'wrong')
                    .map((g) => (
                      <span
                        key={g.cca3}
                        className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30"
                      >
                        ❌ {g.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Round result banner */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <div
                className={`p-4 rounded-lg border-2 text-center ${
                  gameStatus === 'won'
                    ? 'bg-success/10 border-success'
                    : 'bg-destructive/10 border-destructive'
                }`}
              >
                {gameStatus === 'won' ? (
                  <>
                    <p className="text-success font-bold text-xl">🎉 Correct!</p>
                    <p className="text-foreground text-sm mt-1">
                      The country was <strong>{secretCountry?.name.common}</strong>
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      +{Math.max(POINTS_PER_ROUND - revealedCount + 1, 1)} pts
                      ({revealedCount} {revealedCount === 1 ? 'clue' : 'clues'} used)
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-destructive font-bold text-xl">😞 Not quite!</p>
                    <p className="text-foreground text-sm mt-1">
                      It was <strong>{secretCountry?.name.common}</strong>
                    </p>
                    {secretCountry?.flags?.png && (
                      <img
                        src={secretCountry.flags.png}
                        alt=""
                        className="mt-2 mx-auto h-8 rounded border border-border"
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-auto">
              {gameStatus === 'playing' && (
                <button
                  className="flex-1 p-2 text-sm font-bold rounded-md border-2 border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={giveUp}
                >
                  Give up
                </button>
              )}
              {(gameStatus === 'won' || gameStatus === 'lost') && (
                <button className="cosmic-button flex-1" onClick={startGame}>
                  {currentRound < TOTAL_ROUNDS ? `Round ${currentRound + 1} →` : 'See Results'}
                </button>
              )}
            </div>
          </>
        )}

        {/* Hint */}
        {gameStatus === 'playing' && (
          <p className="text-xs text-muted-foreground text-center mt-1">
            👆 Click a country on the map to guess
          </p>
        )}
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-[420px] lg:min-h-0 lg:h-full">
        {geoLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/70">
            <p className="text-foreground text-sm">Loading world map…</p>
          </div>
        )}
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers}
          getTooltip={getTooltip}
          getCursor={({ isDragging, isHovering }) =>
            isDragging ? 'grabbing' : isHovering && gameStatus === 'playing' ? 'pointer' : 'grab'
          }
        >
          <MapGL mapLib={import('maplibre-gl')} mapStyle={mapStyle} />
        </DeckGL>

        {/* Overlay instruction when idle */}
        {gameStatus === 'idle' && !geoLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-6 py-4 text-center shadow-lg">
              <p className="text-2xl mb-1">🕵️</p>
              <p className="text-foreground font-bold">GeoDetective</p>
              <p className="text-muted-foreground text-xs">Start a game to begin sleuthing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeoDetective;