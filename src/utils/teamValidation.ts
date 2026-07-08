import type { Pokemon } from "../types/pokemon";
import { getPokemonSpecies } from "../services/pokemonApi";

const getEvolutionChainId = (url: string): number => {
  return Number(url.split("/").filter(Boolean).pop());
};

export async function validateTeam(team: Pokemon[]): Promise<string | null> {
  if (team.length > 6) {
    return "Maximum 6 Pokémon allowed.";
  }
  
  const totalPower = team.reduce(
    (total, pokemon) => {
      const power = pokemon.stats.reduce(
        (sum, stat) => sum + stat.base_stat,
        0
      );
      return total + power;
    }, 0);

  if(totalPower > 2200) {
    return "Team power limit exceeded.";
  }

  const typeCounts: Record<string, number> = {};

  team.forEach((pokemon) => {
    pokemon.types.forEach((type) => {
      const name = type.type.name;
      typeCounts[name] =
        (typeCounts[name] || 0) + 1;
    });
  });

  for (const type in typeCounts) {
    if (typeCounts[type] > 2) {
      return `Maximum 2 ${type} Pokémon allowed.`;
    }
  }

  const speciesData = await Promise.all(
    team.map((pokemon) =>
      getPokemonSpecies(
        pokemon.id.toString()
      )
    )
  );

  const legendaryCount = speciesData.filter((pokemon) => pokemon.is_legendary).length;
  if (legendaryCount > 1) {
    return "Only 1 legendary Pokémon allowed.";
  }

  const evolutionChains = speciesData.map(
    (pokemon) =>
      getEvolutionChainId(
        pokemon.evolution_chain.url
      )
  );

  const uniqueChains = new Set(
    evolutionChains
  );

  if (
    uniqueChains.size !==
    evolutionChains.length
  ) {
    return "Only one Pokémon from the same evolution family is allowed.";
  }

  return null;
}