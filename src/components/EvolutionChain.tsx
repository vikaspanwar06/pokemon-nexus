import { useEffect, useState } from "react";
import type { Pokemon } from "../types/pokemon";
import "../styles/evolutionChain.css";
import { getEvolutionChain, getPokemonSpecies, getPokemonByName } from "../services/pokemonApi";
import { getTypeColor } from "../utils/getTypeColor";
import { useNavigate } from "react-router-dom";
import { getPokemonImage } from "../utils/getPokemonImage";

interface EvolutionChainProps {
  pokemonId: number;
  currentPokemonId: number;
}

function extractEvolutionChain(chain : any) : string[]{
    const evolutions: string[] = [];

    let current = chain;
    while(current){
        evolutions.push(current.species.name)
        current = current.evolves_to[0];
    }

    return evolutions;
}

function EvolutionChain({ pokemonId, currentPokemonId }: EvolutionChainProps){
    const [evolutions, setEvolutions] = useState<Pokemon[]>([])
    const navigate = useNavigate();

    useEffect(()=> {
        const fetchSpecies = async () => {
            try{
                const speciesData = await getPokemonSpecies(pokemonId.toString());
                const evolutionData = await getEvolutionChain(speciesData.evolution_chain.url)

                const evolutionNames = extractEvolutionChain(evolutionData.chain);

                const evolutionPokemons = await Promise.all(
                    evolutionNames.map((name) =>
                    getPokemonByName(name)
                ));

                setEvolutions(evolutionPokemons);

            }
            catch(error){
                console.error(error);
            }
        }
        fetchSpecies();
    }, [pokemonId]);

    return(
        <div className="evolution-section">
            <h2>Evolution Chain</h2>

            <div className="evolution-chain">
                
                {evolutions.map((pokemon, index) => {
                const primaryType =
                pokemon.types[0].type.name;

                return (
                <div
                    key={pokemon.id}
                    className="evolution-wrapper"
                >
                    <div
                    className={
                        pokemon.id ===
                        currentPokemonId
                        ? "evolution-card active"
                        : "evolution-card"
                    }
                    onClick={() =>
                        navigate(
                        `/pokemon/${pokemon.id}`
                        )
                    }
                    style={{
                        borderColor:
                        getTypeColor(primaryType),
                        boxShadow: `0 0 20px ${getTypeColor(
                        primaryType
                        )}30`,
                    }}
                    >
                    {pokemon.id ===
                        currentPokemonId && (
                        <div className="current-badge">
                        ⭐ Current
                        </div>
                    )}
                    <img src={getPokemonImage(pokemon.id)} />

                    <h3>{pokemon.name}</h3>

                    <span
                        className="evolution-type"
                        style={{
                        backgroundColor:
                            getTypeColor(primaryType),
                        }}
                    >
                        {primaryType}
                    </span>
                    </div>

                    {index !==
                    evolutions.length - 1 && (
                    <div className="evolution-arrow">
                        →
                    </div>
                    )}
                </div>
                );
            })}
            </div>

            {evolutions.length === 1 && (
                <p className="no-evolution-text">
                ✨ Single-stage Pokémon
                </p>
            )}
        </div>
    )
}

export default EvolutionChain;