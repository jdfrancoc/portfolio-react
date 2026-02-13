// Game.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import { useTheme } from '../hooks/useTheme';

export interface Country {
  cca3: string;
  name: {
    common: string;
    official: string;
  };
  region: string;
  subregion?: string;
  languages?: { [key: string]: string };
  latlng?: [number, number];
  area?: number;
  capital?: string[];
  population?: number;
  continents?: string[];
  currencies?: { [key: string]: { name: string; symbol: string } };
  timezones?: string[];
  flags?: {
    png: string;
    svg: string;
    alt?: string;
  };
  coatOfArms?: {
    png: string;
    svg: string;
  };
  maps?: {
    googleMaps: string;
    openStreetMaps: string;
  };
  car?: {
    signs: string[];
    side: string;
  };
  independent?: boolean;
  landlocked?: boolean;
  borders?: string[];
}

type PromptType = 'LETTER' | 'CONTINENT' | 'LANGUAGE';

interface PromptConfig {
  type: PromptType;
  letter?: string;
  continent?: string;
  language?: string;
  description: string;
}

interface RoundState {
  prompt: PromptConfig;
  options: Country[];
  secretCountry: Country | null;
  userChoiceCca3: string; // Changed from string | null to just string
  result: 'idle' | 'survived' | 'eliminated';
}

interface GameProps {
  countries: Country[];
}

// Searchable input:
const CountrySearchInput = React.memo(({ 
    options, 
    value, 
    onChange, 
    disabled, 
    placeholder = "Type a country name..." 
    }: {
    options: Country[];
    value: string;
    onChange: (cca3: string) => void;
    disabled: boolean;
    placeholder?: string;
    }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Country[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debug: Log options when they change
    useEffect(() => {
        console.log('CountrySearchInput received options:', options.map(c => c.name.common));
    }, [options]);

    // Find the selected country by cca3
    const selectedCountry = useMemo(() => {
        return options.find(c => c.cca3 === value);
    }, [options, value]);

    // Update search term when value changes externally
    useEffect(() => {
        if (selectedCountry) {
        setSearchTerm(selectedCountry.name.common);
        } else if (value === '') {
        setSearchTerm('');
        }
    }, [selectedCountry, value]);

    // Filter suggestions based on search term
    useEffect(() => {
        if (searchTerm.length < 4) {
        setSuggestions([]);
        return;
        }

        const searchLower = searchTerm.toLowerCase();
        console.log('Searching for:', searchTerm);
        
        const filtered = options
        .filter(country => {
            const countryName = country.name.common.toLowerCase();
            const matches = countryName.includes(searchLower);
            if (matches) {
            console.log('✓ Match:', country.name.common);
            }
            return matches;
        })
        .slice(0, 10);

        console.log('Suggestions:', filtered.map(c => c.name.common));
        setSuggestions(filtered);
        setSelectedIndex(-1);
    }, [searchTerm, options]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (
            suggestionsRef.current && 
            !suggestionsRef.current.contains(event.target as Node) &&
            inputRef.current && 
            !inputRef.current.contains(event.target as Node)
        ) {
            setShowSuggestions(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setShowSuggestions(true);
        
        // Only clear selection if the text doesn't match the selected country
        if (!selectedCountry || newValue !== selectedCountry.name.common) {
        onChange('');
        }
    };

    const handleSuggestionClick = (country: Country) => {
        setSearchTerm(country.name.common);
        onChange(country.cca3);
        setShowSuggestions(false);
        // Remove focus to prevent suggestions from reopening
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
        );
        } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        }
    };

    return (
        <div className="relative w-full">
        <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => searchTerm.length >= 4 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={`
            w-full p-3 text-foreground bg-background 
            border-2 border-input rounded-md 
            focus:outline-none focus:ring-2 focus:ring-primary 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${disabled ? 'bg-muted' : ''}
            `}
            autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
            <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto bg-background"
            >
            {suggestions.map((country, index) => (
                <button
                key={country.cca3}
                className={`
                    w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground
                    transition-colors duration-150
                    ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''}
                    ${country.cca3 === value ? 'bg-primary/10' : ''}
                `}
                onClick={() => handleSuggestionClick(country)}
                onMouseEnter={() => setSelectedIndex(index)}
                type="button"
                >
                <div className="flex items-center gap-2">
                    {country.flags?.png && (
                    <img 
                        src={country.flags.png} 
                        alt={`${country.name.common} flag`}
                        className="w-6 h-4 object-cover rounded-sm"
                    />
                    )}
                    <span>{country.name.common}</span>
                </div>
                </button>
            ))}
            </div>
        )}
        
        {searchTerm.length > 0 && searchTerm.length < 4 && (
            <p className="text-xs text-muted-foreground mt-1">
            Type at least 4 characters to see suggestions
            </p>
        )}
        </div>
    );
    });


const getRandomItem = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const calculateZoom = (area?: number): number => {
  if (!area) return 4;
  
  if (area < 1000) return 8;
  if (area < 10000) return 7;
  if (area < 50000) return 6;
  if (area < 200000) return 5;
  if (area < 500000) return 4;
  if (area < 1000000) return 3.5;
  if (area < 5000000) return 3;
  return 2.5;
};

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
};

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const CountryFacts: React.FC<{ country: Country }> = ({ country }) => {
  const languages = country.languages 
    ? Object.values(country.languages).join(', ')
    : 'N/A';
  
  const currencies = country.currencies
    ? Object.entries(country.currencies)
        .map(([code, curr]) => `${curr.name} (${curr.symbol || code})`)
        .join(', ')
    : 'N/A';

  const populationDensity = country.area && country.population
    ? (country.population / country.area).toFixed(2)
    : null;

  return (
    <div className="w-full lg:w-80 p-4 overflow-y-auto bg-card lg:border-l-2 border-t-2 lg:border-t-0 border-border max-h-[500px] lg:max-h-none">
      <h2 className="text-2xl font-bold text-foreground">Facts about</h2>
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        {country.name.common}
      </h2>

      {country.flags?.png && (
        <div className="mb-4">
          <img 
            src={country.flags.png} 
            alt={`Flag of ${country.name.common}`}
            className="w-full max-w-[250px] border border-border rounded-md shadow-sm"
          />
        </div>
      )}

      <div className="text-sm leading-relaxed space-y-2">
        <FactItem 
          label="Official Name" 
          value={country.name.official} 
        />
        
        <FactItem 
          label="Capital" 
          value={country.capital?.join(', ') || 'N/A'} 
        />

        <FactItem 
          label="Region" 
          value={country.subregion || country.region} 
        />

        <FactItem 
          label="Population" 
          value={country.population ? formatNumber(country.population) : 'N/A'}
          highlight
        />

        <FactItem 
          label="Area" 
          value={country.area ? `${formatNumber(country.area)} km²` : 'N/A'}
        />

        {populationDensity && (
          <FactItem 
            label="Population Density" 
            value={`${populationDensity} people/km²`}
          />
        )}

        <FactItem 
          label="Languages" 
          value={languages}
        />

        <FactItem 
          label="Currencies" 
          value={currencies}
        />

        {country.timezones && country.timezones.length > 0 && (
          <FactItem 
            label="Timezones" 
            value={country.timezones.length === 1 
              ? country.timezones[0]
              : `${country.timezones.length} zones`}
          />
        )}

        {country.car && (
          <FactItem 
            label="Drives on" 
            value={`${country.car.side === 'right' ? 'Right' : 'Left'} side`}
          />
        )}

        {country.landlocked !== undefined && (
          <FactItem 
            label="Landlocked" 
            value={country.landlocked ? 'Yes' : 'No'}
          />
        )}

        {country.borders && country.borders.length > 0 && (
          <FactItem 
            label="Bordering Countries" 
            value={`${country.borders.length} countries`}
          />
        )}

        {country.independent !== undefined && (
          <FactItem 
            label="Independent" 
            value={country.independent ? 'Yes' : 'No'}
          />
        )}

        {country.continents && country.continents.length > 0 && (
          <FactItem 
            label="Continent(s)" 
            value={country.continents.join(', ')}
          />
        )}
      </div>

      {country.coatOfArms?.png && (
        <div className="mt-4 text-center">
            <p className="text-xs font-bold mb-2 text-muted-foreground">
            Coat of Arms
            </p>
            <img 
            src={country.coatOfArms.png} 
            alt={`Coat of arms of ${country.name.common}`}
            className="w-full max-w-[150px] border border-border rounded-md bg-card p-2 mx-auto"
            />
        </div>
        )}

      {country.maps?.googleMaps && (
        <div className="mt-4">
          <a 
            href={country.maps.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-button inline-block"
          >
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

const FactItem: React.FC<{ 
  label: string; 
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div className={`
    mb-3 p-2 rounded-md
    ${highlight ? 'bg-warning/20' : ''}
  `}>
    <div className="font-bold text-xs text-muted-foreground mb-1">
      {label}
    </div>
    <div className="text-sm text-foreground">
      {value}
    </div>
  </div>
);

const Game: React.FC<GameProps> = ({ countries }) => {
  const { isDarkMode } = useTheme();

  const mapStyle = isDarkMode 
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  const [round, setRound] = useState<RoundState | null>(null);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [countryBorder, setCountryBorder] = useState<any>(null);
  const [loadingBorder, setLoadingBorder] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [roundsSurvived, setRoundsSurvived] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const continents = useMemo(() => {
    const set = new Set<string>();
    countries.forEach(c => {
      if (c.continents && c.continents.length > 0) {
        c.continents.forEach(continent => set.add(continent));
      }
    });
    return Array.from(set);
  }, [countries]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    countries.forEach(c => {
      if (c.languages) {
        Object.values(c.languages).forEach(l => set.add(l));
      }
    });
    return Array.from(set);
  }, [countries]);

  const fetchCountryBorder = async (cca3: string) => {
    setLoadingBorder(true);
    try {
      console.log('Fetching border for:', cca3);
      
      const sources = [
        {
          url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
          codeField: 'ISO_A3'
        },
        {
          url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json',
          codeField: 'id'
        }
      ];

      for (const source of sources) {
        try {
          const response = await fetch(source.url);
          const allCountries = await response.json();
          
          console.log('Loaded GeoJSON, searching for country...');
          
          let countryFeature = allCountries.features.find(
            (feature: any) => {
              const props = feature.properties;
              return props[source.codeField] === cca3 ||
                     props.ISO_A3 === cca3 ||
                     props.iso_a3 === cca3 ||
                     props.ADM0_A3 === cca3 ||
                     props.id === cca3;
            }
          );
          
          if (countryFeature) {
            console.log('Found country border!', countryFeature.properties);
            setCountryBorder({
              type: 'FeatureCollection',
              features: [countryFeature]
            });
            setLoadingBorder(false);
            return;
          } else {
            console.log(`Country ${cca3} not found in this source`);
          }
        } catch (err) {
          console.error(`Failed to load from ${source.url}:`, err);
        }
      }
      
      try {
        console.log('Trying Natural Earth Data...');
        const neResponse = await fetch(
          `https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson`
        );
        const neData = await neResponse.json();
        
        const countryFeature = neData.features.find(
          (feature: any) => {
            const props = feature.properties;
            return props.ADM0_A3 === cca3 || 
                   props.ISO_A3 === cca3 ||
                   props.iso_a3 === cca3;
          }
        );
        
        if (countryFeature) {
          console.log('Found in Natural Earth!', countryFeature.properties);
          setCountryBorder({
            type: 'FeatureCollection',
            features: [countryFeature]
          });
          setLoadingBorder(false);
          return;
        }
      } catch (err) {
        console.error('Natural Earth failed:', err);
      }
      
      console.warn(`Country border not found for ${cca3} in any source`);
      setCountryBorder(null);
    } catch (error) {
      console.error('Error fetching country border:', error);
      setCountryBorder(null);
    } finally {
      setLoadingBorder(false);
    }
  };

  const resetGame = () => {
    setRound(null);
    setViewState(INITIAL_VIEW_STATE);
    setCountryBorder(null);
    setRoundsSurvived(0);
    setGameOver(false);
  };

  const startNewRound = () => {
    // If game is over, force reset
    if (gameOver) {
      resetGame();
      return;
    }

    setViewState(INITIAL_VIEW_STATE);
    setCountryBorder(null);

    const types: PromptType[] = ['LETTER', 'CONTINENT', 'LANGUAGE'];
    let type = getRandomItem(types);

    let prompt: PromptConfig;
    let filtered: Country[] = [];

    if (type === 'LETTER') {
      const lettersSet = new Set(
        countries.map(c => c.name.common[0].toUpperCase())
      );
      const letters = Array.from(lettersSet);
      const letter = getRandomItem(letters);
      filtered = countries.filter(
        c => c.name.common.toUpperCase().startsWith(letter)
      );
      prompt = {
        type,
        letter,
        description: `Think of a country that starts with the letter ${letter}.`,
      };
    } else if (type === 'CONTINENT') {
        const continent = getRandomItem(continents);
        
        console.log(`Selected continent: ${continent}`);
        console.log('Sample countries in this continent:', 
            countries
            .filter(c => c.continents && c.continents.includes(continent))
            .slice(0, 5)
            .map(c => ({
                name: c.name.common,
                continents: c.continents
            }))
        );
        
       
        filtered = countries.filter(c => {
        if (!c.continents || c.continents.length === 0) return false;
        
        // This checks if ANY of the country's continents include "Europe"
        return c.continents.some(cont => 
            cont.toLowerCase() === continent.toLowerCase() ||
            cont.includes(continent) ||
            continent.includes(cont)
        );
        });
        
        console.log(`Found ${filtered.length} countries in ${continent}`);
        
        prompt = {
            type,
            continent,
            description: `Think of a country in ${continent}.`,
        };
    } else {
      // LANGUAGE
      const language = getRandomItem(languages);
      filtered = countries.filter(
        c => c.languages && Object.values(c.languages).includes(language)
      );
      prompt = {
        type,
        language,
        description: `Think of a country where people speak ${language}.`,
      };
    }

    if (filtered.length < 3) {
      startNewRound();
      return;
    }

    // Use ALL filtered countries as options, not just 10
    const options = filtered;

    setRound({
      prompt,
      options,
      secretCountry: null,
      userChoiceCca3: '', // Use empty string instead of null to trigger input reset
      result: 'idle',
    });
  };

  const handleSubmit = () => {
    if (!round || !round.userChoiceCca3) return;
    const { options } = round;
    const secretCountry = getRandomItem(options);
    const eliminated = secretCountry.cca3 === round.userChoiceCca3;

    console.log('Selected country:', secretCountry);
    fetchCountryBorder(secretCountry.cca3);

    if (secretCountry.latlng && secretCountry.latlng.length === 2) {
      const zoom = calculateZoom(secretCountry.area);
      setViewState({
        longitude: secretCountry.latlng[1],
        latitude: secretCountry.latlng[0],
        zoom: zoom,
        pitch: 0,
        bearing: 0,
      });
    }

    if (eliminated) {
      setGameOver(true);
    } else {
      setRoundsSurvived(prev => prev + 1);
    }

    setRound({
      ...round,
      secretCountry,
      result: eliminated ? 'eliminated' : 'survived',
    });
  };

  const layers = useMemo(() => {
    if (!countryBorder) {
      console.log('No country border to display');
      return [];
    }
    
    console.log('Creating GeoJSON layer with data:', countryBorder);
    
    return [
      new GeoJsonLayer({
        id: 'country-border',
        data: countryBorder,
        filled: true,
        stroked: true,
        getFillColor: [255, 200, 0, 150],
        getLineColor: [255, 100, 0, 255],
        getLineWidth: 5,
        lineWidthMinPixels: 3,
        pickable: true,
        opacity: 0.8,
      })
    ];
  }, [countryBorder]);



  return (
    <div className="flex flex-col lg:flex-row gap-0 h-auto lg:h-[600px] relative">
      {/* Info button - top right */}
      <button
        onClick={() => setShowInfoModal(true)}
        className="absolute top-2 right-2 lg:top-4 lg:right-4 z-50 w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 text-foreground border border-border flex items-center justify-center transition-colors"
        title="Data sources"
      >
        <span className="text-sm font-bold">ℹ️</span>
      </button>

      {/* Info Modal */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="bg-background border-2 border-border rounded-lg p-4 lg:p-6 max-w-md w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-foreground">Data Sources</h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-foreground">
              <div>
                <h3 className="font-semibold mb-1">Country Data</h3>
                <p className="text-sm text-muted-foreground">
                  Country information including names, continents, languages, and capitals from{' '}
                  <a 
                    href="https://restcountries.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    REST Countries API
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Geographic Borders</h3>
                <p className="text-sm text-muted-foreground">
                  Country border data from{' '}
                  <a 
                    href="https://www.naturalearthdata.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Natural Earth Data
                  </a>
                  {' '}and{' '}
                  <a 
                    href="https://github.com/datasets/geo-countries" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    geo-countries
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Map Tiles</h3>
                <p className="text-sm text-muted-foreground">
                  Base map provided by{' '}
                  <a 
                    href="https://www.openstreetmap.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenStreetMap
                  </a>
                  {' '}contributors
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left panel - Game controls */}
      <div className="w-full lg:w-[350px] p-4 flex flex-col gap-4 lg:border-r-2 border-b-2 lg:border-b-0 border-border">
        {/* Score counter */}
        <div className="p-4 rounded-lg text-center border-2 border-primary">
          <div className="text-primary text-sm font-bold">
            Rounds Survived
          </div>
          <div className="text-primary text-4xl font-bold">
            {roundsSurvived}
          </div>
        </div>

        {!round && !gameOver && (
          <button 
            onClick={startNewRound}
            className="cosmic-button w-full"
          >
            Start Game
          </button>
        )}

        {gameOver && (
          <div className="p-6 bg-destructive/10 rounded-lg border-3 border-destructive text-center">
            <h2 className="text-3xl font-bold mb-4 text-destructive">
              GAME OVER!
            </h2>
            <p className="mb-4 text-foreground text-lg">
              You survived <strong>{roundsSurvived}</strong> {roundsSurvived === 1 ? 'round' : 'rounds'}!
            </p>
            <button 
              onClick={resetGame}
              className="cosmic-button w-full"
            >
              Play Again
            </button>
          </div>
        )}

        {round && !gameOver && (
            <>
                <div className="p-4 bg-muted rounded-lg text-foreground font-bold">
                {round.prompt.description}
                </div>

                <div>
                    <label className="block mb-2 font-bold text-foreground">
                        Type your answer:
                    </label>
                    <CountrySearchInput
                        key={round.prompt.description} // Force remount on new round
                        options={round.options}
                        value={round.userChoiceCca3 ?? ''}
                        onChange={(cca3) => {
                        setRound(r => r ? { ...r, userChoiceCca3: cca3 } : r);
                        }}
                        disabled={round.result !== 'idle'}
                        placeholder="Start typing a country name..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={!round.userChoiceCca3 || round.result !== 'idle'}
                        className={`
                        flex-1 p-3 font-bold rounded-md transition-all
                        ${round.userChoiceCca3 && round.result === 'idle' 
                            ? 'cosmic-button' 
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        }
                        `}
                    >
                        Lock In
                    </button>
                    <button 
                        onClick={startNewRound}
                        disabled={round.result === 'idle'}
                        className={`
                        px-3 py-1 text-xs font-medium border rounded-full transition-colors
                        ${round.result === 'idle' 
                            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                            : 'bg-primary/20 text-foreground hover:bg-primary/30'
                        }
                        `}
                    >
                        Next Round
                    </button>
                </div>

            {loadingBorder && (
              <div className="p-2 text-muted-foreground text-sm">
                Loading country border...
              </div>
            )}

            {round.result !== 'idle' && round.secretCountry && !gameOver && (
              <div className={`
                p-4 rounded-lg border-2
                ${round.result === 'eliminated' 
                  ? 'bg-destructive/10 border-destructive' 
                  : 'bg-success/10 border-success'
                }
              `}>
                <p className="mb-2 text-foreground font-bold">
                  The answer was: {round.secretCountry.name.common}
                </p>
                {round.result === 'eliminated' ? (
                  <p className="text-destructive font-bold text-lg">
                    ❌ You are ELIMINATED!
                  </p>
                ) : (
                  <p className="text-success font-bold text-lg">
                    ✅ You SURVIVED this round!
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Center panel - Map */}
      <div className="flex-1 relative overflow-hidden h-[400px] lg:h-auto">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers}
          getTooltip={({ object }: any) => object && object.properties && object.properties.ADMIN}
        >
          <Map
            mapLib={import('maplibre-gl')}
            mapStyle={mapStyle}
          />
        </DeckGL>
      </div>

      {/* Right panel - Country facts */}
      {round?.result !== 'idle' && round?.secretCountry && (
        <CountryFacts country={round.secretCountry} />
      )}
    </div>
  );
};

export default Game;