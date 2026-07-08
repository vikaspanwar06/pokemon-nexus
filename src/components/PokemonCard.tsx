import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Pokemon } from "../types/pokemon";
import "../styles/pokemonCard.css";
import { getTypeColor } from "../utils/getTypeColor";
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { isInTeam, toggleTeam } from '../utils/teamBuild';
import { getPokemonImage } from "../utils/getPokemonImage";
import CustomModal from './CustomModal';

interface PokemonCardProps {
    pokemon: Pokemon;
    showCompareButton?: boolean;
    isSelectedForCompare?: boolean;
    onToggleCompare?: (pokemonId: number) => void;
}

function PokemonCard( {pokemon, showCompareButton = false, isSelectedForCompare = false, onToggleCompare,}: PokemonCardProps ){
    const [isFavorited, setIsFavorited] = useState(false);
    const [inTeam, setInTeam] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [showValidationModal, setShowValidationModal] = useState(false);

    useEffect(()=> {
        setIsFavorited(isFavorite(pokemon.id))
        setInTeam(isInTeam(pokemon.id));
    }, [pokemon.id])

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsFavorited(
            toggleFavorite(
                pokemon.id
            )
        );
    };

    const handleToggleTeam = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const result = await toggleTeam(pokemon);

        if (!result.success) {
            setValidationError(result.error!);
            setShowValidationModal(true);
            return;
        }

        setInTeam(result.isInTeam);
    };

    return(
        <>
        <Link to={`/pokemon/${pokemon.id}`} className="pokemon-link">
            <div className="pokemon-card">
                <div className="commonCFB-parent">
                    {showCompareButton && (
                        <button
                            className={
                            isSelectedForCompare
                                ? "commonCFB-btn compare-btn active"
                                : "commonCFB-btn compare-btn"
                            }
                            onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleCompare?.(pokemon.id);
                            }}
                        >
                            ⚔️
                        </button>
                    )}

                    <button 
                        className={
                        isFavorited
                            ? "commonCFB-btn favorite-btn active"
                            : "commonCFB-btn favorite-btn"
                        }
                        onClick={handleFavorite}>
                        {isFavorited ? "❤️" : "🤍"}
                    </button>
                    
                    <button className={
                            inTeam
                                ? "commonCFB-btn build-btn active"
                                : "commonCFB-btn build-btn"
                            } onClick={handleToggleTeam}>{inTeam ? "−" : "+"}</button>
                </div>

                <img
                    className="pokemon-image"
                    src={getPokemonImage(pokemon.id)}
                    alt={pokemon.name}
                />

                <span className="pokemon-id">
                    #{pokemon.id.toString().padStart(3, "0")}
                </span>

                <h3 className="pokemon-name">
                    {pokemon.name}
                </h3>

                <div className="pokemon-types">
                    {pokemon.types.map((item) => (
                        <span
                            key={item.type.name}
                            className="type-badge"
                            style={{
                                backgroundColor: getTypeColor(
                                    item.type.name
                                ),
                            }}
                        >
                            {item.type.name}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
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

export default PokemonCard;