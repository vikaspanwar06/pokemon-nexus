import type { Pokemon } from "../types/pokemon";
import "../styles/tabSection.css";

type TabSectionProps = {
  pokemon: Pokemon;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
};

function TabSection({pokemon, activeTab, setActiveTab}: TabSectionProps){
    
    const statColors: Record<string, string> = {
        hp: "#22c55e",
        attack: "#ef4444",
        defense: "#3b82f6",
        "special-attack": "#f97316",
        "special-defense": "#8b5cf6",
        speed: "#facc15",
    };

    return(
        <div className="details-section">
            <div className="details-tabs">
                <button 
                    className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>

                <button
                    className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
                    onClick={() => setActiveTab("stats")}
                >
                    Stats
                </button>

                <button
                    className={`tab-btn ${activeTab === "abilities" ? "active" : ""}`}
                    onClick={() => setActiveTab("abilities")}
                >
                    Abilities
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="overview-grid">
                    <div className="info-card">
                        <span className="info-label">Height (in cm)</span>
                        <h2>{pokemon.height}</h2>
                    </div>

                    <div className="info-card">
                        <span className="info-label">Weight (in Kg)</span>
                        <h2>{pokemon.weight}</h2>
                    </div>

                    <div className="info-card">
                        <span className="info-label">Abilities</span>
                        <h2>{pokemon.abilities.length}</h2>
                    </div>

                    <div className="info-card">
                        <span className="info-label">Types</span>
                        <h2>{pokemon.types.length}</h2>
                    </div>
                </div>
            )}

            {activeTab === "stats" && (
                <div className="stats-card">
                    {pokemon.stats.map((stat) => (
                        <div className="stat-row" key={stat.stat.name}>
                            <div className="stat-header">
                                <span>{stat.stat.name}</span>
                                <strong>{stat.base_stat}</strong>
                            </div>

                            <div className="stat-bar">
                                <div className="stat-fill"
                                    style={{
                                        width: `${Math.min(
                                        stat.base_stat,
                                        150
                                        )}%`,
                                        background:
                                        statColors[
                                            stat.stat.name
                                        ] || "#38bdf8",
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {activeTab === "abilities" && (
                <div className="abilities-grid">
                    {pokemon.abilities.map((ability) => (
                        <div key={ability.ability.name} className="ability-card">
                            <div className="ability-icon">✨</div>
                            <h4>{ability.ability.name}</h4>
                            <p>Pokemon special ability</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TabSection;