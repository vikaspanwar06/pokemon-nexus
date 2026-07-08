import "../styles/loading.css";

function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-pokeball"></div>

      <h2>Loading Pokédex...</h2>

      <p>
        Fetching Pokémon data
      </p>
    </div>
  );
}

export default Loading;