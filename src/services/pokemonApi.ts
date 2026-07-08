export const getPokemons = async () => {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=576");
    const data = await response.json();

    const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: { url: string }) => {
            const res = await fetch(pokemon.url);
            return res.json();
        })
    )
    return detailedPokemons;
}

export const getPokemonById = async ( id: string) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return response.json();
}

export const getPokemonSpecies = async ( id: string) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    return response.json();
}

export const getEvolutionChain = async (url: string) => {
    const response = await fetch(url);
    return response.json();
}

export const getPokemonByName = async (name: string) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    return response.json();
}