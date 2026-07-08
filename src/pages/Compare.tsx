import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPokemonById, getPokemons } from "../services/pokemonApi";
import type { Pokemon } from "../types/pokemon";
import Loading from "../components/Loading";
import { typeColors } from "../utils/getTypeColor";
import CustomModal from "../components/CustomModal";
import { validateTeam } from "../utils/teamValidation";
import { getPokemonImage } from "../utils/getPokemonImage";
import "../styles/compare.css";

function Compare(){
    const { id1, id2 } = useParams();
    const [leftPokemon, setLeftPokemon] = useState<Pokemon | null>(null);
    const [rightPokemon, setRightPokemon] = useState<Pokemon | null>(null);
    const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
    const [leftSuggestions, setLeftSuggestions] = useState<Pokemon[]>([]);
    const [rightSuggestions, setRightSuggestions] = useState<Pokemon[]>([]);
    const [powerSuggestions, setPowerSuggestions] = useState<Pokemon[]>([]);
    const [refreshSeed, setRefreshSeed] = useState(0);

    const [pendingLeft, setPendingLeft] = useState<Pokemon | null>(null);
    const [pendingRight, setPendingRight] = useState<Pokemon | null>(null);
    const [validationError, setValidationError] = useState("");
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [selectedRandom, setSelectedRandom] = useState<Pokemon | null>(null);
    const [showRandomModal, setShowRandomModal] = useState(false);
    const [draggedPokemon, setDraggedPokemon] = useState<Pokemon | null>(null);
    const [dropTarget, setDropTarget] = useState<"left" | "right" | null>(null);
    const [leftOriginal, setLeftOriginal] =useState<Pokemon | null>(null);
    const [rightOriginal, setRightOriginal] =useState<Pokemon | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(()=> {
        const fetchPokemons = async () => {
            if(!id1 || !id2) return;
            const data1 = await getPokemonById(id1);
            const data2 = await getPokemonById(id2);

            setLeftPokemon(data1);
            setRightPokemon(data2);
            setLeftOriginal(data1);
            setRightOriginal(data2);

            const data = await getPokemons();
            setAllPokemons(data);
        }
        fetchPokemons();
    }, [id1, id2])

    useEffect(()=>{
        if(!leftPokemon || !rightPokemon || allPokemons.length === 0) return;

        const leftType = leftPokemon.types[0].type.name;
        const rightType = rightPokemon.types[0].type.name;
        const leftPower = getPower(leftPokemon);
        const rightPower = getPower(rightPokemon);

        const leftResults = allPokemons.filter((pokemon) => {
            const typeMatch = pokemon.types.some((type) => type.type.name === leftType);
            const powerDiff = Math.abs(getPower(pokemon) - leftPower);

            return (typeMatch && pokemon.id !== leftPokemon.id && powerDiff <= 100);
        }).slice(0, 3);

        const rightResults = allPokemons.filter((pokemon) => {
            const typeMatch = pokemon.types.some((type) => type.type.name === rightType);
            const powerDiff = Math.abs(getPower(pokemon) - rightPower);

            return (typeMatch && pokemon.id !== rightPokemon.id && powerDiff <= 100);
        }).slice(0, 3);

        setLeftSuggestions(leftResults);
        setRightSuggestions(rightResults);

    }, [leftPokemon, rightPokemon, allPokemons]);

    useEffect(()=>{
        if(!leftPokemon || !rightPokemon || allPokemons.length === 0) return;

        const averagePower = (getPower(leftPokemon) + getPower(rightPokemon)) / 2;

        const randomSuggestions = allPokemons.filter((pokemon) => {
            const powerDiff = Math.abs(getPower(pokemon) - averagePower);
            return (pokemon.id !== leftPokemon.id && pokemon.id !== rightPokemon.id && powerDiff <= 100);
        }).sort(() => Math.random() - 0.5);

        const usedTypes = new Set();
        const uniqueSuggestions = randomSuggestions.filter((pokemon) => {
            const type = pokemon.types[0].type.name;
            if(usedTypes.has(type)) {return false;}
            usedTypes.add(type);
            return true;
        })

        setPowerSuggestions(uniqueSuggestions.slice(0, 6));

    }, [refreshSeed, leftPokemon, rightPokemon, allPokemons]); 
    
    useEffect(() => {
        const handleResize = () => {setIsMobile(window.innerWidth <= 768);};
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getTotalPower = (pokemon: Pokemon) => {
        return pokemon.stats.reduce(
            (total, stat) =>
            total + stat.base_stat,
            0
        );
    };

    if (!leftPokemon || !rightPokemon) {
        return <Loading />;
    }

    const total1 = getTotalPower(leftPokemon);
    const total2 = getTotalPower(rightPokemon);

    const winner = total1 > total2 ? leftPokemon : rightPokemon;

    const getPower = (pokemon: Pokemon) => {
        return pokemon.stats.reduce(
            (sum, stat) => sum + stat.base_stat, 0);
    };

    const replaceLeftPokemon = (pokemon: Pokemon) => {
        setLeftPokemon(pokemon);
        setPendingLeft(pokemon);
    };

    const replaceRightPokemon = (pokemon: Pokemon) => {
        setRightPokemon(pokemon);
        setPendingRight(pokemon);
    };

    const saveChanges = async () => {
        const team = JSON.parse(localStorage.getItem("pokemonTeam") || "[]");
        const teamPokemons = await Promise.all(team.map(
            (id: number) =>getPokemonById(id.toString()))
        );

        const updatedTeam = teamPokemons.map((pokemon) => {
            if(pokemon.id === Number(id1) && pendingLeft) {
                return pendingLeft;
            }
            if(pokemon.id === Number(id2) && pendingRight) {
                return pendingRight;
            }
            return pokemon;
        });

        const error = await validateTeam(updatedTeam);

        if(error) {
            setValidationError(error);
            setShowValidationModal(true);
            return;
        }

        localStorage.setItem("pokemonTeam", JSON.stringify(updatedTeam.map(pokemon => pokemon.id)));
        window.dispatchEvent(new Event("teamUpdated"));

        setPendingLeft(null);
        setPendingRight(null);
    }

    return(
        <>
        <div className="compare-container">
            <div className="compare-header">
                <h1>Compare Pokémon</h1>
                <p>
                    Compare two Pokémon side by side. Analyze their stats, abilities, types, strengths, and weaknesses to choose the better battler.
                </p>
            </div>

            <div className="compare-layout">
                <div className=
                    {`compare-card left-card 
                    ${total1 > total2 ? "winner-card" : ""} 
                    ${dropTarget === "left" ? "drop-active" : ""}`}

                    onDragOver={isMobile ? undefined : (e) => {e.preventDefault();setDropTarget("left");}}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={() => {if (draggedPokemon) {replaceLeftPokemon(draggedPokemon);}

                    setDraggedPokemon(null);
                    setDropTarget(null);
                }}
                >
                    <img 
                        src={getPokemonImage(leftPokemon.id)} 
                        alt={leftPokemon.name}
                    />
                    <h2>{leftPokemon.name}</h2>
                    <div className="compare-types">
                        {leftPokemon.types.map((type) => (
                            <span key={type.type.name} className="compare-type" style={{background: typeColors[type.type.name]}}>
                                {type.type.name}
                            </span>
                            )
                        )}
                    </div>
                    <div className="compare-stats">
                        {leftPokemon.stats.map((stat) => (
                            <div key={stat.stat.name} className="compare-stat">
                                <span>
                                    {stat.stat.name.replace("-", " ").replace("special attack", "Sp. Attack").replace("special defense", "Sp. Defense")}
                                </span>
                                <strong>{stat.base_stat}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="power-score">
                        <span>Total Power</span>
                        <strong>{total1}</strong>
                    </div>
                </div>

                <div className="battle-center">
                    <div className="vs-circle">VS</div>
                </div>

                <div className=
                    {`compare-card right-card 
                    ${total2 > total1 ? "winner-card" : ""} 
                    ${dropTarget === "right" ? "drop-active" : ""}`}

                    onDragOver={isMobile ? undefined : (e) => {e.preventDefault();setDropTarget("right");}}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={() => {if (draggedPokemon) {replaceRightPokemon(draggedPokemon);}

                    setDraggedPokemon(null);
                    setDropTarget(null);
                }}
                >
                    <img 
                        src={getPokemonImage(rightPokemon.id)} 
                        alt={rightPokemon.name} 
                    />
                    <h2>{rightPokemon.name}</h2>
                    <div className="compare-types">
                        {rightPokemon.types.map((type) => (
                            <span key={type.type.name} className="compare-type" style={{background: typeColors[type.type.name]}}>
                                {type.type.name}
                            </span>
                            )
                        )}
                    </div>
                    <div className="compare-stats">
                        {rightPokemon.stats.map((stat) => (
                            <div key={stat.stat.name} className="compare-stat">
                                <span>
                                    {stat.stat.name.replace("-", " ").replace("special attack", "Sp. Attack").replace("special defense", "Sp. Defense")}
                                </span>
                                <strong>{stat.base_stat}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="power-score">
                        <span>Total Power</span>
                        <strong>{total2}</strong>
                    </div>
                </div>
            </div>

            <div className="power-winner">
                <div className="power-difference">
                    <div className="battle-winner">🏆 Winner</div>
                    <strong>{winner.name.charAt(0).toUpperCase() + winner.name.slice(1)}</strong>
                </div>
                <div className="power-difference">
                    <div className="battle-winner">Power Difference</div>
                    <strong>{Math.abs(total1 - total2)}</strong>
                </div>
            </div>

            <div className="suggestions-section">
                <div className="suggestion-box">
                    <h2>{leftPokemon.types[0].type.name.toLowerCase()} Alternatives</h2>
                    <div className="suggestion-flex-card">
                        {leftSuggestions.map((pokemon) => (
                            <div 
                                key={pokemon.id}
                                draggable={!isMobile}
                                className="suggestion-card" 
                                onDragStart={isMobile ? undefined : () => setDraggedPokemon(pokemon)}
                                onClick={() =>replaceLeftPokemon(pokemon)}
                                onDragEnd={isMobile ? undefined : () => {
                                    setDraggedPokemon(null);
                                    setDropTarget(null);}
                                }
                            >
                                <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
                                <div>
                                    <h4>{pokemon.name}</h4>
                                    <span>Power:{" "}{getPower(pokemon)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="suggestion-box">
                    <h2>{rightPokemon.types[0].type.name.toLowerCase()} Alternatives</h2>
                    <div className="suggestion-flex-card">
                        {rightSuggestions.map((pokemon) => (
                            <div 
                                key={pokemon.id}
                                draggable={!isMobile}
                                className="suggestion-card" 
                                onDragStart={isMobile ? undefined : () => setDraggedPokemon(pokemon)}
                                onClick={() =>replaceRightPokemon(pokemon)}
                                onDragEnd={isMobile ? undefined : () => {
                                    setDraggedPokemon(null);
                                    setDropTarget(null);}
                                }
                            >
                                <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
                                <div>
                                    <h4>{pokemon.name}</h4>
                                    <span>Power:{" "}{getPower(pokemon)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>   

            <div className="power-suggestions-pp">
                <div className="power-header">
                    <h2>🎲 Similar Power Pokémon</h2>
                    <button className="refresh-btn" onClick={() =>setRefreshSeed(prev => prev + 1)}>🔄</button>
                </div>

                <div className="power-suggestions">
                    <div className="power-grid">
                        {powerSuggestions.map((pokemon) => (
                            <div 
                                key={pokemon.id}
                                draggable={!isMobile}
                                className="suggestion-card" 
                                onDragStart={isMobile ? undefined : () => setDraggedPokemon(pokemon)}
                                onClick={() => {
                                    setSelectedRandom(pokemon)
                                    setShowRandomModal(true)}
                                }
                                onDragEnd={isMobile ? undefined : () => {
                                    setDraggedPokemon(null);
                                    setDropTarget(null);}
                                }
                            >
                                <img src={getPokemonImage(pokemon.id)} alt={pokemon.name} />
                                <div>
                                    <h4>{pokemon.name}</h4>
                                    <span>Power:{" "}{getPower(pokemon)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>   

            {(pendingLeft || pendingRight) && (
                <div className="pending-changes">
                    <h2>Pending Changes</h2>
                    <div className="change-row">
                        <span>{leftOriginal?.name}</span>
                        <span> → </span>
                        <span>{pendingLeft?.name}</span>
                    </div>

                    <div className="change-row">
                        <span>{rightOriginal?.name}</span>
                        <span> → </span>
                        <span>{pendingRight?.name}
                        </span>
                    </div>

                    <button className="save-team-btn" onClick={saveChanges}>Save Team Changes</button>
                </div>
            )}  

        </div>

        <CustomModal
            isOpen={showValidationModal}
            title="Team Validation"
            message={validationError}
            onClose={() =>setShowValidationModal(false)}
        />

        <CustomModal
            isOpen={showRandomModal}
            title={selectedRandom ? selectedRandom.name : ""}
            message="Which side should be replaced?"
            onClose={() => setShowRandomModal(false)}
        >
            <div className="replace-side">
                <button 
                    onClick={() => {if(selectedRandom){replaceLeftPokemon(selectedRandom);} 
                    setShowRandomModal(false);}}
                >
                    Replace1 {leftPokemon?.name}
                </button>
                <button
                    onClick={() => { if(selectedRandom) {replaceRightPokemon(selectedRandom);}
                    setShowRandomModal(false);}}
                >
                    Replace2 {rightPokemon?.name}
                </button>
            </div>
        </CustomModal>

        </>
    )
}

export default Compare;