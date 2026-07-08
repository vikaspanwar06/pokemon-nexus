const FAVORITES_KEY = "favorites";

export function getFavorites(): number[]{
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

export function saveFavorites(favorites: number[]){
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(pokemonId: number){
    return getFavorites().includes(pokemonId);
}

export function toggleFavorite(pokemonId: number){
    const favorites = getFavorites();
    let updatedFavorites: number[];

    if(favorites.includes(pokemonId)){
        updatedFavorites = favorites.filter(id => id !== pokemonId)
    }
    else{
        updatedFavorites = [...favorites, pokemonId]
    }

    saveFavorites(updatedFavorites);

    window.dispatchEvent(new Event("favoritesUpdated"));

    return updatedFavorites.includes(pokemonId);
}