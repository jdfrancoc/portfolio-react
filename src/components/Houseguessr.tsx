// // src/components/HouseGuessr.tsx
// import React, { useState, useCallback, useMemo } from 'react';
// import MapGL, { Marker } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { ScatterplotLayer } from '@deck.gl/layers';
// import type { MapViewState } from '@deck.gl/core';
// import { useTheme } from '../hooks/useTheme';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface House {
//   id: number;
//   zpid?: string;
//   address: string;
//   city: string;
//   state: string;
//   zipcode: string;
//   price: number;
//   bedrooms: number | null;
//   bathrooms: number | null;
//   sqft: number | null;
//   homeType?: string;
//   latitude: number;
//   longitude: number;
//   photos: string[]; // filenames relative to /house_data/photos/
//   detailUrl?: string;
// }

// type GuessResult = 'way_low' | 'low' | 'close' | 'high' | 'way_high';

// interface GuessRecord {
//   value: number;
//   result: GuessResult;
// }

// type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

// // ─── Constants ────────────────────────────────────────────────────────────────

// // Path prefix for photos served from your local static server / public folder.
// // Adjust this to match wherever you serve house_data/photos/ from.
// const PHOTOS_BASE_URL = '/house_data/photos/';

// // Percentage thresholds
// const WIN_THRESHOLD = 0.05;    // within 5%  → win
// const LOW_THRESHOLD = 0.15;    // within 15% → "low" (1 arrow)
// const HIGH_THRESHOLD = 0.15;   // within 15% → "high" (1 arrow)

// const MAX_GUESSES = 5;

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// function classifyGuess(guess: number, actual: number): GuessResult {
//   const ratio = guess / actual;
//   const diff = Math.abs(ratio - 1);
//   if (diff <= WIN_THRESHOLD) return 'close';
//   if (ratio < 1) return diff <= LOW_THRESHOLD ? 'low' : 'way_low';
//   return diff <= HIGH_THRESHOLD ? 'high' : 'way_high';
// }

// function formatPrice(n: number) {
//   return '$' + n.toLocaleString('en-US');
// }

// function parseInput(raw: string): number | null {
//   // Strip $ and commas so users can type "$1,200,000" or "1200000"
//   const cleaned = raw.replace(/[$,\s]/g, '');
//   const n = Number(cleaned);
//   return isNaN(n) || n <= 0 ? null : n;
// }

// const RESULT_CONFIG: Record<GuessResult, { label: string; arrows: string; color: string }> = {
//   way_low:  { label: 'Way too low',  arrows: '⬆️⬆️', color: 'text-blue-500' },
//   low:      { label: 'Too low',      arrows: '⬆️',   color: 'text-blue-400' },
//   close:    { label: 'Just right!',  arrows: '✅',   color: 'text-success'  },
//   high:     { label: 'Too high',     arrows: '⬇️',   color: 'text-orange-400' },
//   way_high: { label: 'Way too high', arrows: '⬇️⬇️', color: 'text-red-500'  },
// };

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function GuessResultBadge({ result }: { result: GuessResult }) {
//   const cfg = RESULT_CONFIG[result];
//   return (
//     <span className={`font-bold text-lg ${cfg.color}`} aria-label={cfg.label}>
//       {cfg.arrows} <span className="text-sm font-semibold">{cfg.label}</span>
//     </span>
//   );
// }

// function PhotoGallery({ photos, visibleCount }: { photos: string[]; visibleCount: number }) {
//   const shown = photos.slice(0, visibleCount);
//   const [selected, setSelected] = useState(0);

//   // Reset selected if shown list shrinks (new house)
//   const safeSelected = selected < shown.length ? selected : 0;

//   return (
//     <div className="flex flex-col gap-2">
//       {/* Main photo */}
//       <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
//         {shown.length > 0 ? (
//           <img
//             src={PHOTOS_BASE_URL + shown[safeSelected]}
//             alt="House"
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
//             No photo
//           </div>
//         )}
//         {/* Photo counter badge */}
//         {shown.length > 1 && (
//           <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
//             {safeSelected + 1} / {shown.length}
//           </span>
//         )}
//       </div>

//       {/* Thumbnail strip — only shows when >1 photo unlocked */}
//       {shown.length > 1 && (
//         <div className="flex gap-1 overflow-x-auto pb-1">
//           {shown.map((photo, i) => (
//             <button
//               key={photo}
//               onClick={() => setSelected(i)}
//               className={`flex-shrink-0 w-14 h-10 rounded border-2 overflow-hidden transition-all ${
//                 i === safeSelected ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
//               }`}
//             >
//               <img
//                 src={PHOTOS_BASE_URL + photo}
//                 alt=""
//                 className="w-full h-full object-cover"
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main Component ────────────────────────────────────────────────────────────

// const HouseGuessr: React.FC = () => {
//   const { isDarkMode } = useTheme();

//   const mapStyle = isDarkMode
//     ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
//     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

//   // ── Dataset state ─────────────────────────────────────────────────────────
//   const [houses, setHouses] = useState<House[]>([]);
//   const [dataLoading, setDataLoading] = useState(false);
//   const [dataError, setDataError] = useState<string | null>(null);
//   const [usedIds, setUsedIds] = useState<Set<number>>(new Set());

//   // ── Game state ────────────────────────────────────────────────────────────
//   const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
//   const [currentHouse, setCurrentHouse] = useState<House | null>(null);
//   const [guesses, setGuesses] = useState<GuessRecord[]>([]);
//   const [inputValue, setInputValue] = useState('');
//   const [inputError, setInputError] = useState<string | null>(null);
//   const [visiblePhotoCount, setVisiblePhotoCount] = useState(1);

//   // Map
//   const [viewState, setViewState] = useState<MapViewState>({
//     longitude: -98,
//     latitude: 38,
//     zoom: 3,
//     pitch: 0,
//     bearing: 0,
//   });

//   // ── Load dataset ──────────────────────────────────────────────────────────

//   const loadData = useCallback(async () => {
//     if (houses.length > 0) return; // already loaded
//     setDataLoading(true);
//     setDataError(null);
//     try {
//       const res = await fetch('/house_data/houses.json');
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data: House[] = await res.json();
//       // Filter out houses without a price or photos
//       const valid = data.filter((h) => h.price > 0 && h.photos?.length > 0);
//       if (valid.length === 0) throw new Error('No valid houses in dataset');
//       setHouses(valid);
//     } catch (e: any) {
//       setDataError(e.message);
//     } finally {
//       setDataLoading(false);
//     }
//   }, [houses.length]);

//   // ── Pick a random unused house ────────────────────────────────────────────

//   const pickHouse = useCallback(
//     (pool: House[], exclude: Set<number>): House | null => {
//       const available = pool.filter((h) => !exclude.has(h.id));
//       if (available.length === 0) return null;
//       return available[Math.floor(Math.random() * available.length)];
//     },
//     []
//   );

//   // ── Start / next round ────────────────────────────────────────────────────

//   const startGame = useCallback(async () => {
//     // Load data first time
//     let pool = houses;
//     if (pool.length === 0) {
//       setDataLoading(true);
//       setDataError(null);
//       try {
//         const res = await fetch('/house_data/houses.json');
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data: House[] = await res.json();
//         const valid = data.filter((h) => h.price > 0 && h.photos?.length > 0);
//         if (valid.length === 0) throw new Error('No valid houses in dataset');
//         setHouses(valid);
//         pool = valid;
//       } catch (e: any) {
//         setDataError(e.message);
//         setDataLoading(false);
//         return;
//       }
//       setDataLoading(false);
//     }

//     const house = pickHouse(pool, usedIds);
//     if (!house) {
//       // All houses used — reset the pool
//       const freshHouse = pool[Math.floor(Math.random() * pool.length)];
//       startRound(freshHouse, new Set());
//       return;
//     }
//     startRound(house, usedIds);
//   }, [houses, usedIds, pickHouse]);

//   const startRound = (house: House, currentUsed: Set<number>) => {
//     setCurrentHouse(house);
//     setUsedIds(new Set([...currentUsed, house.id]));
//     setGuesses([]);
//     setInputValue('');
//     setInputError(null);
//     setVisiblePhotoCount(1);
//     setGameStatus('playing');
//     setViewState({
//       longitude: house.longitude,
//       latitude: house.latitude,
//       zoom: 11,
//       pitch: 0,
//       bearing: 0,
//     });
//   };

//   // ── Submit guess ──────────────────────────────────────────────────────────

//   const submitGuess = useCallback(() => {
//     if (!currentHouse || gameStatus !== 'playing') return;

//     const value = parseInput(inputValue);
//     if (value === null) {
//       setInputError('Please enter a valid price (e.g. 450000 or $450,000)');
//       return;
//     }
//     setInputError(null);

//     const result = classifyGuess(value, currentHouse.price);
//     const newGuess: GuessRecord = { value, result };
//     const newGuesses = [...guesses, newGuess];
//     setGuesses(newGuesses);
//     setInputValue('');

//     if (result === 'close') {
//       setGameStatus('won');
//       return;
//     }

//     // Reveal one more photo on each wrong guess
//     setVisiblePhotoCount((n) => Math.min(n + 1, currentHouse.photos.length));

//     if (newGuesses.length >= MAX_GUESSES) {
//       setGameStatus('lost');
//     }
//   }, [currentHouse, gameStatus, guesses, inputValue]);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') submitGuess();
//   };

//   // ── Map layers ────────────────────────────────────────────────────────────

//   const layers = useMemo(() => {
//     if (!currentHouse) return [];
//     return [
//       new ScatterplotLayer({
//         id: 'house-pin',
//         data: [currentHouse],
//         getPosition: (d: House) => [d.longitude, d.latitude],
//         getRadius: 40,
//         radiusUnits: 'pixels',
//         getFillColor: gameStatus === 'won'
//           ? [50, 200, 100, 220]
//           : gameStatus === 'lost'
//           ? [220, 50, 50, 220]
//           : [99, 102, 241, 220],
//         getLineColor: [255, 255, 255, 200],
//         lineWidthMinPixels: 2,
//         stroked: true,
//         updateTriggers: {
//           getFillColor: [gameStatus],
//         },
//       }),
//     ];
//   }, [currentHouse, gameStatus]);

//   // ─── Derived ──────────────────────────────────────────────────────────────

//   const guessesLeft = MAX_GUESSES - guesses.length;
//   const lastGuess = guesses[guesses.length - 1] ?? null;

//   // ─── Render ───────────────────────────────────────────────────────────────

//   return (
//     <div className="flex flex-col lg:flex-row gap-0 min-h-screen lg:min-h-0 lg:h-[calc(100vh-300px)] relative">

//       {/* ── Left panel ──────────────────────────────────────────────────── */}
//       <div className="w-full lg:w-[380px] p-4 flex flex-col gap-3 lg:border-r-2 border-b-2 lg:border-b-0 border-border overflow-y-auto">

//         {/* ── Idle / start screen ─────────────────────────────────────── */}
//         {gameStatus === 'idle' && (
//           <div className="flex flex-col gap-3">
//             <div className="p-4 rounded-lg border-2 border-border text-center flex flex-col gap-2">
//               <p className="text-4xl">🏠</p>
//               <p className="font-bold text-foreground text-lg">House Guessr</p>
//               <p className="text-muted-foreground text-sm leading-relaxed">
//                 You'll be shown a real house listing. Guess the asking price — you have{' '}
//                 <strong className="text-foreground">{MAX_GUESSES} attempts</strong>. Each wrong
//                 guess reveals a new photo and a hint about direction.
//               </p>
//             </div>

//             {dataError && (
//               <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
//                 ⚠️ {dataError}
//                 <br />
//                 <span className="text-xs">Make sure <code>house_data/houses.json</code> is served from your public folder.</span>
//               </div>
//             )}

//             <button
//               className="cosmic-button w-full"
//               onClick={startGame}
//               disabled={dataLoading}
//             >
//               {dataLoading ? 'Loading houses…' : 'Start Game'}
//             </button>
//           </div>
//         )}

//         {/* ── Playing / won / lost ─────────────────────────────────────── */}
//         {(gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && currentHouse && (
//           <>
//             {/* Address & location */}
//             <div className="p-3 rounded-lg border border-border bg-muted/50">
//               <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Location</p>
//               <p className="text-foreground font-semibold text-sm">{currentHouse.address}</p>
//               <p className="text-muted-foreground text-xs">{currentHouse.city}, {currentHouse.state} {currentHouse.zipcode}</p>
//             </div>

//             {/* Photo gallery */}
//             <PhotoGallery
//               photos={currentHouse.photos}
//               visibleCount={visiblePhotoCount}
//             />

//             {/* House details — revealed progressively after guesses */}
//             {guesses.length >= 1 && (
//               <div className="grid grid-cols-3 gap-2">
//                 {currentHouse.bedrooms != null && (
//                   <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
//                     <div className="text-xl">🛏️</div>
//                     <div className="text-foreground font-bold text-sm">{currentHouse.bedrooms}</div>
//                     <div className="text-muted-foreground text-xs">Beds</div>
//                   </div>
//                 )}
//                 {currentHouse.bathrooms != null && (
//                   <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
//                     <div className="text-xl">🚿</div>
//                     <div className="text-foreground font-bold text-sm">{currentHouse.bathrooms}</div>
//                     <div className="text-muted-foreground text-xs">Baths</div>
//                   </div>
//                 )}
//                 {currentHouse.sqft != null && (
//                   <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
//                     <div className="text-xl">📐</div>
//                     <div className="text-foreground font-bold text-sm">{currentHouse.sqft.toLocaleString()}</div>
//                     <div className="text-muted-foreground text-xs">Sq ft</div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Guess history */}
//             {guesses.length > 0 && (
//               <div className="flex flex-col gap-1.5">
//                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your guesses</h3>
//                 {guesses.map((g, i) => {
//                   const cfg = RESULT_CONFIG[g.result];
//                   return (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30"
//                     >
//                       <span className="text-foreground font-mono font-semibold text-sm">
//                         {formatPrice(g.value)}
//                       </span>
//                       <span className={`font-bold text-base ${cfg.color}`} title={cfg.label}>
//                         {cfg.arrows}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Live feedback banner after last guess */}
//             {lastGuess && gameStatus === 'playing' && (
//               <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
//                 <GuessResultBadge result={lastGuess.result} />
//               </div>
//             )}

//             {/* Guess attempts left */}
//             {gameStatus === 'playing' && (
//               <div className="flex gap-1 justify-center">
//                 {Array.from({ length: MAX_GUESSES }).map((_, i) => (
//                   <div
//                     key={i}
//                     className={`flex-1 h-2 rounded-full transition-colors ${
//                       i < guesses.length ? 'bg-destructive' : 'bg-border'
//                     }`}
//                     title={i < guesses.length ? `Guess ${i + 1}: ${formatPrice(guesses[i].value)}` : 'Remaining'}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* ── Input ─────────────────────────────────────────────────── */}
//             {gameStatus === 'playing' && (
//               <div className="flex flex-col gap-1">
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
//                     <input
//                       type="text"
//                       inputMode="numeric"
//                       value={inputValue}
//                       onChange={(e) => setInputValue(e.target.value)}
//                       onKeyDown={handleKeyDown}
//                       placeholder="e.g. 450,000"
//                       className="w-full pl-7 pr-3 py-2 rounded-md border-2 border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
//                     />
//                   </div>
//                   <button
//                     className="cosmic-button px-4 py-2 text-sm"
//                     onClick={submitGuess}
//                   >
//                     Guess
//                   </button>
//                 </div>
//                 {inputError && (
//                   <p className="text-destructive text-xs">{inputError}</p>
//                 )}
//                 <p className="text-muted-foreground text-xs text-center">
//                   {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining
//                 </p>
//               </div>
//             )}

//             {/* ── Win / lose result banner ────────────────────────────── */}
//             {(gameStatus === 'won' || gameStatus === 'lost') && (
//               <div
//                 className={`p-4 rounded-lg border-2 text-center flex flex-col gap-2 ${
//                   gameStatus === 'won'
//                     ? 'bg-success/10 border-success'
//                     : 'bg-destructive/10 border-destructive'
//                 }`}
//               >
//                 {gameStatus === 'won' ? (
//                   <>
//                     <p className="text-success font-bold text-xl">🎉 Nice one!</p>
//                     <p className="text-foreground text-sm">
//                       You guessed within 5% on guess {guesses.length}!
//                     </p>
//                     <p className="text-muted-foreground text-sm">
//                       Actual price:{' '}
//                       <strong className="text-foreground">{formatPrice(currentHouse.price)}</strong>
//                     </p>
//                     {currentHouse.detailUrl && (
//                       <a
//                         href={currentHouse.detailUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-primary text-xs underline underline-offset-2"
//                       >
//                         View on Zillow →
//                       </a>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-destructive font-bold text-xl">😞 Out of guesses!</p>
//                     <p className="text-foreground text-sm">
//                       The actual price was{' '}
//                       <strong>{formatPrice(currentHouse.price)}</strong>
//                     </p>
//                     <p className="text-muted-foreground text-xs">
//                       Your closest guess was{' '}
//                       {formatPrice(
//                         guesses.reduce((best, g) =>
//                           Math.abs(g.value - currentHouse.price) <
//                           Math.abs(best.value - currentHouse.price)
//                             ? g
//                             : best
//                         ).value
//                       )}
//                     </p>
//                     {currentHouse.detailUrl && (
//                       <a
//                         href={currentHouse.detailUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-primary text-xs underline underline-offset-2"
//                       >
//                         View on Zillow →
//                       </a>
//                     )}
//                   </>
//                 )}

//                 <button className="cosmic-button w-full mt-1" onClick={startGame}>
//                   Next House →
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* ── Map ─────────────────────────────────────────────────────────── */}
//       <div className="flex-1 relative overflow-hidden min-h-[360px] lg:min-h-0 lg:h-full">
//         <DeckGL
//           viewState={viewState}
//           onViewStateChange={(e: any) => setViewState(e.viewState)}
//           controller={true}
//           layers={layers}
//         >
//           <MapGL mapLib={import('maplibre-gl')} mapStyle={mapStyle} />
//         </DeckGL>

//         {/* Idle overlay */}
//         {gameStatus === 'idle' && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-6 py-4 text-center shadow-lg">
//               <p className="text-3xl mb-1">🏠</p>
//               <p className="text-foreground font-bold">House Guessr</p>
//               <p className="text-muted-foreground text-xs">Start to reveal a house</p>
//             </div>
//           </div>
//         )}

//         {/* Pin label overlay while playing */}
//         {currentHouse && gameStatus === 'playing' && (
//           <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none">
//             <div className="bg-background/85 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-xs text-foreground shadow-md">
//               📍 {currentHouse.city}, {currentHouse.state}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HouseGuessr;

// src/components/HouseGuessr.tsx
import React, { useState, useCallback, useMemo } from 'react';
import MapGL, { Marker } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import { useTheme } from '../hooks/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface House {
  id: number;
  zpid?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  homeType?: string;
  latitude: number;
  longitude: number;
  photos: string[]; // filenames relative to /house_data/photos/
  detailUrl?: string;
}

type GuessResult = 'way_low' | 'low' | 'close' | 'high' | 'way_high';

interface GuessRecord {
  value: number;
  result: GuessResult;
}

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTOS_BASE_URL = '/house_data/photos/';

const WIN_THRESHOLD = 0.05;
const LOW_THRESHOLD = 0.15;
const HIGH_THRESHOLD = 0.15;

const MAX_GUESSES = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function classifyGuess(guess: number, actual: number): GuessResult {
  const ratio = guess / actual;
  const diff = Math.abs(ratio - 1);
  if (diff <= WIN_THRESHOLD) return 'close';
  if (ratio < 1) return diff <= LOW_THRESHOLD ? 'low' : 'way_low';
  return diff <= HIGH_THRESHOLD ? 'high' : 'way_high';
}

function formatPrice(n: number) {
  return '$' + n.toLocaleString('en-US');
}

function parseInput(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '');
  const n = Number(cleaned);
  return isNaN(n) || n <= 0 ? null : n;
}

const RESULT_CONFIG: Record<GuessResult, { label: string; arrows: string; color: string }> = {
  way_low:  { label: 'Way too low',  arrows: '⬆️⬆️', color: 'text-blue-500' },
  low:      { label: 'Too low',      arrows: '⬆️',   color: 'text-blue-400' },
  close:    { label: 'Just right!',  arrows: '✅',   color: 'text-success'  },
  high:     { label: 'Too high',     arrows: '⬇️',   color: 'text-orange-400' },
  way_high: { label: 'Way too high', arrows: '⬇️⬇️', color: 'text-red-500'  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GuessResultBadge({ result }: { result: GuessResult }) {
  const cfg = RESULT_CONFIG[result];
  return (
    <span className={`font-bold text-lg ${cfg.color}`} aria-label={cfg.label}>
      {cfg.arrows} <span className="text-sm font-semibold">{cfg.label}</span>
    </span>
  );
}

function PhotoGallery({ photos, visibleCount }: { photos: string[]; visibleCount: number }) {
  const shown = photos.slice(0, visibleCount);
  const [selected, setSelected] = useState(0);

  const safeSelected = selected < shown.length ? selected : 0;

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Main photo — fills available height */}
      <div className="relative w-full flex-1 bg-muted rounded-lg overflow-hidden border border-border min-h-0">
        {shown.length > 0 ? (
          <img
            src={PHOTOS_BASE_URL + shown[safeSelected]}
            alt="House"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No photo
          </div>
        )}
        {shown.length > 1 && (
          <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
            {safeSelected + 1} / {shown.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {shown.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1 flex-shrink-0">
          {shown.map((photo, i) => (
            <button
              key={photo}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-14 h-10 rounded border-2 overflow-hidden transition-all ${
                i === safeSelected ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={PHOTOS_BASE_URL + photo}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const HouseGuessr: React.FC = () => {
  const { isDarkMode } = useTheme();

  const mapStyle = isDarkMode
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  const [houses, setHouses] = useState<House[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set());

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(1);

  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -98,
    latitude: 38,
    zoom: 3,
    pitch: 0,
    bearing: 0,
  });

  const loadData = useCallback(async () => {
    if (houses.length > 0) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const res = await fetch('/house_data/houses.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: House[] = await res.json();
      const valid = data.filter((h) => h.price > 0 && h.photos?.length > 0);
      if (valid.length === 0) throw new Error('No valid houses in dataset');
      setHouses(valid);
    } catch (e: any) {
      setDataError(e.message);
    } finally {
      setDataLoading(false);
    }
  }, [houses.length]);

  const pickHouse = useCallback(
    (pool: House[], exclude: Set<number>): House | null => {
      const available = pool.filter((h) => !exclude.has(h.id));
      if (available.length === 0) return null;
      return available[Math.floor(Math.random() * available.length)];
    },
    []
  );

  const startGame = useCallback(async () => {
    let pool = houses;
    if (pool.length === 0) {
      setDataLoading(true);
      setDataError(null);
      try {
        const res = await fetch('/house_data/houses.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: House[] = await res.json();
        const valid = data.filter((h) => h.price > 0 && h.photos?.length > 0);
        if (valid.length === 0) throw new Error('No valid houses in dataset');
        setHouses(valid);
        pool = valid;
      } catch (e: any) {
        setDataError(e.message);
        setDataLoading(false);
        return;
      }
      setDataLoading(false);
    }

    const house = pickHouse(pool, usedIds);
    if (!house) {
      const freshHouse = pool[Math.floor(Math.random() * pool.length)];
      startRound(freshHouse, new Set());
      return;
    }
    startRound(house, usedIds);
  }, [houses, usedIds, pickHouse]);

  const startRound = (house: House, currentUsed: Set<number>) => {
    setCurrentHouse(house);
    setUsedIds(new Set([...currentUsed, house.id]));
    setGuesses([]);
    setInputValue('');
    setInputError(null);
    setVisiblePhotoCount(1);
    setGameStatus('playing');
    setViewState({
      longitude: house.longitude,
      latitude: house.latitude,
      zoom: 11,
      pitch: 0,
      bearing: 0,
    });
  };

  const submitGuess = useCallback(() => {
    if (!currentHouse || gameStatus !== 'playing') return;

    const value = parseInput(inputValue);
    if (value === null) {
      setInputError('Please enter a valid price (e.g. 450000 or $450,000)');
      return;
    }
    setInputError(null);

    const result = classifyGuess(value, currentHouse.price);
    const newGuess: GuessRecord = { value, result };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);
    setInputValue('');

    if (result === 'close') {
      setGameStatus('won');
      return;
    }

    setVisiblePhotoCount((n) => Math.min(n + 1, currentHouse.photos.length));

    if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
    }
  }, [currentHouse, gameStatus, guesses, inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitGuess();
  };

  const layers = useMemo(() => {
    if (!currentHouse) return [];
    return [
      new ScatterplotLayer({
        id: 'house-pin',
        data: [currentHouse],
        getPosition: (d: House) => [d.longitude, d.latitude],
        getRadius: 10,
        radiusUnits: 'pixels',
        getFillColor: gameStatus === 'won'
          ? [50, 200, 100, 220]
          : gameStatus === 'lost'
          ? [220, 50, 50, 220]
          : [99, 102, 241, 220],
        getLineColor: [255, 255, 255, 200],
        lineWidthMinPixels: 2,
        stroked: true,
        updateTriggers: { getFillColor: [gameStatus] },
      }),
    ];
  }, [currentHouse, gameStatus]);

  const guessesLeft = MAX_GUESSES - guesses.length;
  const lastGuess = guesses[guesses.length - 1] ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-screen lg:min-h-0 lg:h-[calc(100vh-300px)] relative">

      {/* ── Left panel (controls + small map) ───────────────────────────── */}
      <div className="w-full lg:w-[380px] p-4 flex flex-col gap-3 lg:border-r-2 border-b-2 lg:border-b-0 border-border overflow-y-auto">

        {gameStatus === 'idle' && (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-lg border-2 border-border text-center flex flex-col gap-2">
              <p className="text-4xl">🏠</p>
              <p className="font-bold text-foreground text-lg">House Guessr</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You'll be shown a real house listing. Guess the asking price — you have{' '}
                <strong className="text-foreground">{MAX_GUESSES} attempts</strong>. Each wrong
                guess reveals a new photo and a hint about direction.
              </p>
            </div>

            {dataError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
                ⚠️ {dataError}
                <br />
                <span className="text-xs">Make sure <code>house_data/houses.json</code> is served from your public folder.</span>
              </div>
            )}

            <button className="cosmic-button w-full" onClick={startGame} disabled={dataLoading}>
              {dataLoading ? 'Loading houses…' : 'Start Game'}
            </button>
          </div>
        )}

        {(gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && currentHouse && (
          <>
            {/* Address */}
            <div className="p-3 rounded-lg border border-border bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Location</p>
              <p className="text-foreground font-semibold text-sm">{currentHouse.address}</p>
              <p className="text-muted-foreground text-xs">{currentHouse.city}, {currentHouse.state} {currentHouse.zipcode}</p>
            </div>

            {/* ── Small map (was the big right panel, now compact here) ── */}
            <div className="relative rounded-lg overflow-hidden border border-border" style={{ height: '180px' }}>
              <DeckGL
                viewState={viewState}
                onViewStateChange={(e: any) => setViewState(e.viewState)}
                controller={true}
                layers={layers}
              >
                <MapGL mapLib={import('maplibre-gl')} mapStyle={mapStyle} />
              </DeckGL>
              {currentHouse && gameStatus === 'playing' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none">
                  <div className="bg-background/85 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 text-xs text-foreground shadow-md whitespace-nowrap">
                    📍 {currentHouse.city}, {currentHouse.state}
                  </div>
                </div>
              )}
            </div>

            {/* House details — revealed after first guess */}
            {guesses.length >= 1 && (
              <div className="grid grid-cols-3 gap-2">
                {currentHouse.bedrooms != null && (
                  <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
                    <div className="text-xl">🛏️</div>
                    <div className="text-foreground font-bold text-sm">{currentHouse.bedrooms}</div>
                    <div className="text-muted-foreground text-xs">Beds</div>
                  </div>
                )}
                {currentHouse.bathrooms != null && (
                  <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
                    <div className="text-xl">🚿</div>
                    <div className="text-foreground font-bold text-sm">{currentHouse.bathrooms}</div>
                    <div className="text-muted-foreground text-xs">Baths</div>
                  </div>
                )}
                {currentHouse.sqft != null && (
                  <div className="p-2 rounded-md border border-border bg-muted/30 text-center">
                    <div className="text-xl">📐</div>
                    <div className="text-foreground font-bold text-sm">{currentHouse.sqft.toLocaleString()}</div>
                    <div className="text-muted-foreground text-xs">Sq ft</div>
                  </div>
                )}
              </div>
            )}

            {/* Guess history */}
            {guesses.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your guesses</h3>
                {guesses.map((g, i) => {
                  const cfg = RESULT_CONFIG[g.result];
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30">
                      <span className="text-foreground font-mono font-semibold text-sm">{formatPrice(g.value)}</span>
                      <span className={`font-bold text-base ${cfg.color}`} title={cfg.label}>{cfg.arrows}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live hint */}
            {lastGuess && gameStatus === 'playing' && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <GuessResultBadge result={lastGuess.result} />
              </div>
            )}

            {/* Attempt pips */}
            {gameStatus === 'playing' && (
              <div className="flex gap-1 justify-center">
                {Array.from({ length: MAX_GUESSES }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-colors ${i < guesses.length ? 'bg-destructive' : 'bg-border'}`}
                    title={i < guesses.length ? `Guess ${i + 1}: ${formatPrice(guesses[i].value)}` : 'Remaining'}
                  />
                ))}
              </div>
            )}

            {/* Input */}
            {gameStatus === 'playing' && (
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g. 450,000"
                      className="w-full pl-7 pr-3 py-2 rounded-md border-2 border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button className="cosmic-button px-4 py-2 text-sm" onClick={submitGuess}>
                    Guess
                  </button>
                </div>
                {inputError && <p className="text-destructive text-xs">{inputError}</p>}
                <p className="text-muted-foreground text-xs text-center">
                  {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining
                </p>
              </div>
            )}

            {/* Win / lose banner */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <div className={`p-4 rounded-lg border-2 text-center flex flex-col gap-2 ${gameStatus === 'won' ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
                {gameStatus === 'won' ? (
                  <>
                    <p className="text-success font-bold text-xl">🎉 Nice one!</p>
                    <p className="text-foreground text-sm">You guessed within 5% on guess {guesses.length}!</p>
                    <p className="text-muted-foreground text-sm">Actual price: <strong className="text-foreground">{formatPrice(currentHouse.price)}</strong></p>
                    {currentHouse.detailUrl && (
                      <a href={currentHouse.detailUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline underline-offset-2">
                        View on Zillow →
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-destructive font-bold text-xl">😞 Out of guesses!</p>
                    <p className="text-foreground text-sm">The actual price was <strong>{formatPrice(currentHouse.price)}</strong></p>
                    <p className="text-muted-foreground text-xs">
                      Your closest guess was{' '}
                      {formatPrice(guesses.reduce((best, g) => Math.abs(g.value - currentHouse.price) < Math.abs(best.value - currentHouse.price) ? g : best).value)}
                    </p>
                    {currentHouse.detailUrl && (
                      <a href={currentHouse.detailUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline underline-offset-2">
                        View on Zillow →
                      </a>
                    )}
                  </>
                )}
                <button className="cosmic-button w-full mt-1" onClick={startGame}>Next House →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right panel (big photo gallery) ─────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-[420px] lg:min-h-0 lg:h-full p-4">
        {gameStatus === 'idle' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-6 py-4 text-center shadow-lg">
              <p className="text-3xl mb-1">🏠</p>
              <p className="text-foreground font-bold">House Guessr</p>
              <p className="text-muted-foreground text-xs">Start to reveal a house</p>
            </div>
          </div>
        )}

        {(gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') && currentHouse && (
          <div className="w-full h-full">
            <PhotoGallery photos={currentHouse.photos} visibleCount={visiblePhotoCount} />
          </div>
        )}
      </div>

    </div>
  );
};

export default HouseGuessr;