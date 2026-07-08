import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import Loading from "../components/Loading";
import TabSection from "../components/TabSection";
import "../styles/pokemonDetails.css";
import { getTypeColor } from "../utils/getTypeColor";
import type { Pokemon } from "../types/pokemon";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { isInTeam, toggleTeam } from '../utils/teamBuild';
import { getPokemonImage } from "../utils/getPokemonImage";
import { getPokemonById, getPokemonSpecies } from "../services/pokemonApi";
import EvolutionChain from "../components/EvolutionChain";
import CustomModal from '../components/CustomModal';

function PokemonDetails() {
    const {id} = useParams();
    const navigate = useNavigate();
    const pokemonId = Number(id);

    const previousPokemonId = pokemonId > 1 ? pokemonId - 1 : null;
    const nextPokemonId = pokemonId < 576 ? pokemonId + 1 : null;

    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [description, setDescription] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [isFavorited, setIsFavorited] = useState(false);
    const [inTeam, setInTeam] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [showValidationModal, setShowValidationModal] = useState(false);

    useEffect(()=> {
        const fetchPokemon = async () => {
            if(!id) return

            try{
                const pokemonData = await getPokemonById(id);
                setPokemon(pokemonData);

                const speciesData = await getPokemonSpecies(id);
                const englishEntry = speciesData.flavor_text_entries.find(
                     (entry: any) => entry.language.name === "en"
                )    
                
                if (englishEntry) {
                    setDescription(englishEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "));
                }

            }
            catch(error){
                console.error("Error fetching pokemon:", error);
            }
        }

        fetchPokemon()
    }, [id]);

    useEffect(()=> {
        setIsFavorited(isFavorite(pokemonId))
        setInTeam(isInTeam(pokemonId));
    }, [pokemonId])

    if (
        !id ||
        Number.isNaN(pokemonId) ||
        pokemonId < 1 ||
        pokemonId > 576
    ) {
        return <Navigate to="/404" replace />;
    }

    if (!pokemon) {
        return <Loading />;
    }

    const primaryType = pokemon.types[0].type.name;
    const typeColor = getTypeColor(primaryType);

    const handleFavorite = () => {
        setIsFavorited(toggleFavorite(pokemonId))
    }
    const handleToggleTeam = async () => {

        const result = await toggleTeam(pokemon);

        if (!result.success) {
            setValidationError(result.error!);
            setShowValidationModal(true);
            return;
        }

        setInTeam(result.isInTeam);
    }

    return(
        <>
        <div className="details-page">
            <button className="back-btn" onClick={()=> navigate(-1)}>← Back </button> 

            <div className="details-header">
                <div className="details-info">
                    <p className="pokemon-number">#{pokemon.id.toString().padStart(3, "0")}</p>
                    <h1 className="pokemon-name">{pokemon.name}</h1>

                    <div className="details-types" >
                        {pokemon.types.map((type) => (
                        <span
                            key={type.type.name}
                            className="details-type"
                            style={{ backgroundColor: getTypeColor(type.type.name) }}
                        >
                            {type.type.name}
                        </span>
                        ))}
                    </div>

                    <button
                        className={
                        isFavorited
                            ? "detail-favorite-btn active"
                            : "detail-favorite-btn"
                        }
                        onClick={handleFavorite}
                    >
                        {isFavorited
                        ? "🤍 Remove from Favorites"
                        : "❤️ Add to Favorites"}
                    </button>

                    <button className={
                            inTeam
                                ? "detail-team-btn active"
                                : "detail-team-btn"
                            } onClick={handleToggleTeam}>
                                {inTeam
                        ? "Remove from Team"
                        : "Add To Team"}      
                    </button>

                    <div className="pokemon-description">{description}</div>
                </div>

                <div
                    className="details-image-container"
                    style={{ "--pokemon-color": typeColor } as React.CSSProperties}
                >

                    <div className="hero-dots"></div>
                    <div className="hero-glow"></div>
                    <div className="pokemon-platform"></div>
                    <div className="bubble bubble-1"></div>
                    <div className="bubble bubble-2"></div>
                    <div className="bubble bubble-3"></div>

                    <img
                        className="details-image"
                        src={getPokemonImage(pokemon.id)}
                        alt={pokemon.name}
                    />
                </div>
            </div>

            <TabSection pokemon={pokemon} activeTab={activeTab} setActiveTab={setActiveTab} />

            <EvolutionChain pokemonId={pokemonId} currentPokemonId={pokemonId} />

            <div className="pokemon-navigation">
                {previousPokemonId && (
                <button
                    className="nav-pokemon-btn"
                    onClick={() =>
                    navigate(
                        `/pokemon/${previousPokemonId}`
                    )
                    }
                >
                    ← Previous
                </button>
                )}

                {nextPokemonId && (
                <button
                    className="nav-pokemon-btn"
                    onClick={() =>
                    navigate(
                        `/pokemon/${nextPokemonId}`
                    )
                    }
                >
                    Next →
                </button>
                )}

            </div>
        </div>
        <CustomModal
            isOpen={
                showValidationModal
            }
            title="Team Validation"
            message={
                validationError
            }
            onClose={() =>
                setShowValidationModal(
                    false
                )
            }
        />
        </>
    )
}

export default PokemonDetails;