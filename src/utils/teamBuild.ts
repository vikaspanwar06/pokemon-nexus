import type { Pokemon } from "../types/pokemon";
import { validateTeam } from "./teamValidation";

const TEAM_KEY = "pokemonTeam";

export function getTeam(): number[] {
  return JSON.parse(localStorage.getItem(TEAM_KEY) || "[]");
}

export function saveTeam(team: number[]) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

export function isInTeam(pokemonId: number) {
  return getTeam().includes(pokemonId);
}

export async function toggleTeam(pokemon: Pokemon): Promise<{
  success: boolean;
  isInTeam: boolean;
  error?: string;
}> {
  const team = getTeam();

  let updatedTeam: number[];

  if (team.includes(pokemon.id)) {
    updatedTeam = team.filter(id => id !== pokemon.id);
  } 
  else {
    updatedTeam = [...team, pokemon.id];

    const { getPokemonById } = await import("../services/pokemonApi");

    const teamPokemons = await Promise.all(
      updatedTeam.map(id => getPokemonById(id.toString()))
    );

    const error = await validateTeam(teamPokemons);

    if (error) {
      return {
        success: false,
        isInTeam: false,
        error,
      };
    }
  }

  saveTeam(updatedTeam);

  window.dispatchEvent(new Event("teamUpdated"));

  return {
    success: true,
    isInTeam: updatedTeam.includes(pokemon.id),
  };
}

