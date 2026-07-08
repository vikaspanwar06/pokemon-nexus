import '../styles/searchFilter.css';
import { getTypeColor, pokemonTypes } from '../utils/getTypeColor';
import { typeIcons } from "../utils/typeIcons";

type SearchFilterProps = {
    searchTerm: string;
    setSearchTerm: React.Dispatch<
        React.SetStateAction<string>
    >;

    selectedType: string;

    setSelectedType: React.Dispatch<
        React.SetStateAction<string>
    >;
};

function SearchFilter({searchTerm, setSearchTerm, selectedType, setSelectedType} : SearchFilterProps) {
    return (
        <div>
            <div className="search-align">
                <div className="search-container">
                    <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="explore400-text">
                    <div className='text-pokeball'></div>
                    Explore 400+ Pokemons
                </div>
            </div>

            <div className="type-filters">
                {pokemonTypes.map((type) => {
                    const Icon = typeIcons[type as keyof typeof typeIcons];
                        return(
                        <button
                            key={type}
                            className={
                                selectedType === type ? "type-btn active" : "type-btn"
                            }
                            style={{backgroundColor:
                                    type === "all"
                                        ? "#76918a"
                                        : getTypeColor(type),
                                }}
                            onClick={() => setSelectedType(type)}
                        >
                            <Icon />
                            <span className='type-btn-span'>{type}</span>
                        </button> 
                    )   
                })}
            </div>
        </div>
    );
}

export default SearchFilter;