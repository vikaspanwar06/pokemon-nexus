import { useState, useEffect } from "react";
import type { Pokemon } from "../types/pokemon";
import { getFavorites } from "../utils/favorites";
import PokemonCard from "../components/PokemonCard";
import "../styles/favorites.css";
import { getPokemonById } from "../services/pokemonApi";
import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip} from "recharts";
import { pokemonTypes, typeColors } from "../utils/getTypeColor";
import { getPokemonImage } from "../utils/getPokemonImage";
import { Link } from "react-router-dom";

function Favorites(){
    const [favorites, setFavorites] = useState<Pokemon[]>([]);
    const [showAll, setShowAll] = useState(false);

    const fetchFavorites = async () => {
        const favoriteIds = getFavorites();

        const favoritePokemons = await Promise.all(favoriteIds.map(
                (id: number)=> getPokemonById(id.toString())
            )
        )

        setFavorites(favoritePokemons);
    }

    useEffect(()=>{
        fetchFavorites();

        window.addEventListener("favoritesUpdated", fetchFavorites)

        return () => {
            window.removeEventListener("favoritesUpdated", fetchFavorites);
        };

    }, [])

    const displayedFavorites = showAll ? favorites : favorites.slice(0,8);
    const totalFavorites = favorites.length;

    const averagePower = favorites.length > 0 ?
        Math.round(favorites.reduce((total, pokemon) => {
            const pokemoPower = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
            return total + pokemoPower;
        }, 0) / (favorites.length || 1)) : 0;

    let collectionLevel = "Beginner Trainer";
    if (totalFavorites >= 400) {
        collectionLevel = "Pokédex Legend";
    } 
    else if(totalFavorites >= 300) {
        collectionLevel = "Pokémon Master";
    } 
    else if(totalFavorites >= 200) {
        collectionLevel ="Champion";
    } 
    else if(totalFavorites >= 100) {
        collectionLevel = "Gym Leader";
    } 
    else if(totalFavorites >= 50) {
        collectionLevel = "Collector";
    } 
    else if(totalFavorites >= 25) {
        collectionLevel = "Explorer";
    }

    const typesCollected = new Set(favorites.flatMap(pokemon => pokemon.types.map(type => type.type.name))).size;

    const collectionProgress = Math.round((totalFavorites / 576) * 100);

    const pieData = pokemonTypes.filter(type => type !== "all")
        .map(type => ({
            name: type,
            value: favorites.reduce(
                (count, pokemon) =>
                    count +
                    (pokemon.types.some(t => t.type.name === type) ? 1 : 0),
                0
        )
    })); 
    
    const strongestPokemon = favorites.length > 0 ? favorites.reduce(
        (strongest, pokemon) => {
            const strongestPower =
                strongest.stats.reduce(
                    (sum, stat) =>
                        sum + stat.base_stat,
                    0
                );

                const currentPower =
                    pokemon.stats.reduce(
                        (sum, stat) =>
                            sum + stat.base_stat,
                        0
                    );

                if(currentPower > strongestPower) {
                    return pokemon;
                }
                if(currentPower === strongestPower) {
                    const strongestAttack =
                        strongest.stats.find(
                            stat =>
                                stat.stat.name ===
                                "attack"
                        )?.base_stat ?? 0;

                    const currentAttack =
                        pokemon.stats.find(
                            stat =>
                                stat.stat.name ===
                                "attack"
                        )?.base_stat ?? 0;

                    if (currentAttack > strongestAttack) {
                        return pokemon;
                    }
                }
                return strongest;
            }
        ) : null;

    const typeCounts: Record<string, number> = {};

    favorites.forEach(
        (pokemon) => {

            pokemon.types.forEach(
                ({ type }) => {

                    typeCounts[
                        type.name
                    ] =
                        (
                            typeCounts[
                                type.name
                            ] || 0
                        ) + 1;

                }
            );

        }
    );

    if(favorites.length === 0){
        return(
            <div className="favorites-empty favorites-container">
                <div className="favorites-header">
                    <div>
                        <h1>Favorites ❤️</h1>
                        <p>
                            Build your personal Pokémon collection.
                            Collect, organize and manage your strongest Pokémon.
                        </p>
                    </div>
                </div>
                <p>No favorite Pokémon yet.</p>
            </div>
        )
    }

    return(
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>Favorites ❤️</h1>
                <p>Build your personal Pokémon collection. Collect, organize and manage your strongest Pokémon.</p>
            </div>

            <div className="favorites-summary">
                <div className="summary-card">
                    <span>❤️</span>
                    <h2>{totalFavorites}</h2>
                    <p>Total Favorites</p>
                </div>

                <div className="summary-card">
                    <span>⚡</span>
                    <h2>{averagePower}</h2>
                    <p>Average Power</p>
                </div>

                <div className="summary-card">
                    <span>🏅</span>
                    <h2>{collectionLevel}</h2>
                    <p>Collection Level</p>
                </div>

                <div className="summary-card">
                    <span>🌈</span>
                    <h2>{typesCollected}/18</h2>
                    <p>Types Collected</p>
                </div>
            </div>

            <div className="collection-progress">
                <div>
                    <h3>Collection Progress</h3>
                    <p>{totalFavorites} / 576 Pokémon</p>
                </div>
                <strong>{collectionProgress}%</strong>
            </div>

            <div className="progress-track">
                <div className="progress-fill" style={{width: `${collectionProgress}%`}} />
            </div>

            <div className="favorites-section-header">
                <div>
                    <h2>Your Favorites</h2>
                    <p>Showing{" "}{displayedFavorites.length}{" "}of{" "}{totalFavorites} Pokémon</p>
                </div>
            </div>

            <div className="pokemon-grid">
                {displayedFavorites.map((pokemon)=> 
                    (
                        <PokemonCard key={pokemon.id} pokemon={pokemon} />
                    )  
                )}
            </div>
            {
                totalFavorites > 8 && (
                    <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
                        { showAll ? "Show Less" : `Show All (${totalFavorites})`}
                    </button>
                )
            }

            <div className="favorites-insights">
                <div className="favorite-card">
                    <div className="favorite-types-wrapper">
                        <div className="favorite-pie">
                            <ResponsiveContainer  width="100%" height={320}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                                        {
                                            pieData.map(
                                                entry => (
                                                    <Cell key={entry.name} fill={typeColors[entry.name]} />

                                                )
                                            )
                                        }
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pie-center">
                                <h2>{totalFavorites}</h2>
                                <span>Favorites</span>
                            </div>
                        </div>

                        <div className="favorite-legend">
                            {
                                pieData.map(item => (
                                        <div key={item.name} className="legend-item">
                                            <div className="legend-left">
                                                <span className="legend-color" style={{background: typeColors[item.name]}} />
                                                <span className="legend-name">{item.name}</span>
                                            </div>
                                            <strong>{item.value}</strong>
                                        </div>
                                    )
                                )
                            }
                        </div>

                    </div>
                </div>

                <div className="strongest-card">
                    <h2>👑 Strongest Favorite</h2>
                    {
                        strongestPokemon && (
                            <>
                                <img src={getPokemonImage(strongestPokemon.id)}
                                    alt={strongestPokemon.name}
                                />
                                <h3>{strongestPokemon.name}</h3>
                                <div className="hero-types">
                                    {
                                        strongestPokemon.types.map(item => (
                                                    <span key={item.type.name} className={`type-badge ${item.type.name}`} style={{background: typeColors[item.type.name]}}>
                                                        {item.type.name}
                                                    </span>
                                                )
                                            )
                                    }

                                </div>
                                <Link to={`/pokemon/${strongestPokemon.id}`} className="pokemon-link"><button>View Details →</button></Link>
                            </>
                        )
                    }
                </div>

            </div>
        </div>           
    )
}

export default Favorites;