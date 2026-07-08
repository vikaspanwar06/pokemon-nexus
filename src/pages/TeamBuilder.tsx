import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Pokemon } from "../types/pokemon";
import { getPokemonById } from "../services/pokemonApi";
import PokemonCard from "../components/PokemonCard";
import CustomModal from "../components/CustomModal";
import "../styles/teamBuild.css";

function TeamBuilder() {
  const [team, setTeam] = useState<Pokemon[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchTeam = async () => {
      const teamIds = JSON.parse(localStorage.getItem("pokemonTeam") || "[]");

      const teamPokemons = await Promise.all(teamIds.map((id: number) =>
              getPokemonById(id.toString())
        )
      );

      setTeam(teamPokemons);
    };

    const clearTeam = () => {localStorage.removeItem("pokemonTeam");
        setTeam([]);

        window.dispatchEvent(
            new Event("teamUpdated")
        );

        setShowClearModal(false);
    };

  const toggleCompare = (pokemonId: number) => {
    if (selectedPokemon.includes(pokemonId)) {
        setSelectedPokemon(selectedPokemon.filter(id => id !== pokemonId));
    } 
    else {
        if (selectedPokemon.length >= 2) return;
        const updatedSelection = [...selectedPokemon, pokemonId];
        setSelectedPokemon(updatedSelection);
        if (updatedSelection.length === 2) {
            setShowCompareModal(true);
        }
    }
};

  useEffect(() => {
    fetchTeam();

    window.addEventListener("teamUpdated", fetchTeam);

    return () => {
      window.removeEventListener("teamUpdated", fetchTeam);
    };
  }, []);

  const MAX_TEAM_POWER = 2200;

  const totalPower = team.reduce((total, pokemon) => {
    return (total + pokemon.stats.reduce(
        (sum, stat) => sum + stat.base_stat, 0)
    );
  }, 0);

  const typeCounts: Record<string, number> = {};

  team.forEach((pokemon) => 
    {pokemon.types.forEach((type) => {
          const name =
          type.type.name;
          typeCounts[name] =
          (typeCounts[name] || 0) + 1;
      });
    }
  );

  const familyCount = team.length;
  const emptySlots = 6 - team.length;

  if(team.length === 0) {
    return (
      <div className="teams-empty teams-container">
          <div className="teams-header">
              <div>
                  <h1>My Team ⚔️</h1>
                  <p>
                     Choose up to six Pokémon, balance their strengths, and build a team ready for any challenge.
                  </p>
              </div>
          </div>
          <p>No Pokémon added yet.</p>
      </div>
    );
  }

  return (
    <div className="teams-container">
      <div className="teams-header">
        <div>
            <h1>My Team ⚔️</h1>
            <p>
              Choose up to six Pokémon, balance their strengths, and build a team ready for any challenge.
            </p>
            <p>{team.length} / 6 Pokémon</p>
        </div>
      </div>

      <div className="team-dashboard">
        <div className="team-clear-flex">
          <h2>⚔ Team Summary</h2>
          {team.length > 0 && (
            <button
              className="clear-team-btn"
              onClick={() =>
                  setShowClearModal(true)
              }
              >
              Clear Team
            </button>
          )}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span>Power</span>
            <strong>{totalPower} / {MAX_TEAM_POWER}</strong>
          </div>

          <div className="dashboard-card">
            <span>Pokémon</span>
            <strong>{team.length} / 6</strong>
          </div>

          <div className="dashboard-card">
            <span>Families</span>
            <strong>{familyCount} / 6</strong>
          </div>

          <div className="dashboard-card">
            <span>Legendary</span>
            <strong>0 / 1</strong>
          </div>
        </div>

        <div className="team-power">
          <span>Team Power</span>
          <strong>{totalPower} / {MAX_TEAM_POWER}</strong>
        </div>

        <div className="power-bar">
          <div className="power-fill" style={{width: `${Math.min(totalPower / MAX_TEAM_POWER, 1) * 100}%`}}/>
        </div>

        <div className="team-types">
          {Object.entries(typeCounts).map(
            ([type, count]) => (
              <span key={type} className="team-type">{type}: {count}</span>
            )
          )}
        </div>

      </div>

      <div className="pokemon-grid mtb-50">
          {team.map((pokemon) => (
              <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  showCompareButton={true}
                  isSelectedForCompare={selectedPokemon.includes(pokemon.id)}
                  onToggleCompare={toggleCompare}
              />
            )
          )}

          {Array.from({length: emptySlots}).map((_, index) => (
            <div key={`empty-${index}`} className="empty-slot-card" onClick={() => navigate("/")}>
              <div className="empty-slot-icon">+</div>
              <p>Add Pokémon</p>
            </div>
          ))}
      </div>

      <CustomModal
        isOpen={showClearModal}
        title="Clear Team?"
        message="Remove all Pokémon from your team?"
        onClose={() => setShowClearModal(false)}
        onConfirm={clearTeam}
        confirmText="Clear"
      />

      <CustomModal
        isOpen={showCompareModal}
        title="Compare Pokémon"
        message="Ready to compare your selected Pokémon?"
        onClose={() => setShowCompareModal(false)}
        onConfirm={() => {
            navigate(`/compare/${selectedPokemon[0]}/${selectedPokemon[1]}`);
        }}
        confirmText="Compare"
      />

    </div>
  );
}

export default TeamBuilder;