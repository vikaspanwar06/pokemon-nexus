import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import "../styles/home.css";
import ImageBanner from "../assests/img/banner.png";
import type { Pokemon } from "../types/pokemon";
import { getPokemons } from "../services/pokemonApi";
import Loading from "../components/Loading";
import PokemonCard from "../components/PokemonCard";
import SearchFilter from "../components/SearchFilter";

const POKEMONS_PER_PAGE = 24;

function Home(){
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(() => {
        return Number(localStorage.getItem("currentPage") || 1);
    });
    const [pageInput, setPageInput] = useState(currentPage.toString());

    const searchRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=> {
        const fetchData = async () => {
            try{
                const data = await getPokemons();
                setPokemons(data);
            }
            catch(error){
                console.error("Error fetching Pokémon:", error);
            }
        }
        fetchData();
    }, []);

    useEffect(()=> {
        gsap.to(
            ".electric-flash",
            {
                scale: 1.3,
                opacity: .5,
                duration: .5,
                repeat: -1,
                yoyo: true,
                repeatDelay: 2
            }
        )
    }, []);

    useEffect(()=>{
        localStorage.setItem("currentPage", currentPage.toString())
    }, [currentPage]);

    useEffect(() => {
        if (searchTerm !== "" || selectedType !== "all") {
            setCurrentPage(1);
        }
    }, [searchTerm, selectedType]);

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);

    useEffect(()=> {
        const timer = setTimeout(()=> {
            setDebouncedSearch(searchTerm);
        }, 300)

        return () => clearTimeout(timer);
    }, [searchTerm])

    const filteredPokemons = pokemons.filter((pokemon) => {
        const matchesSearch = 
            pokemon.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        
        const matchesType = 
            selectedType === "all" || pokemon.types.some((type) => type.type.name === selectedType)

        return matchesSearch && matchesType;
    });

    const indexOfLastPokemon = currentPage * POKEMONS_PER_PAGE;
    const indexOfFirstPokemon = indexOfLastPokemon - POKEMONS_PER_PAGE;

    const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

    const totalPages = Math.ceil(
        filteredPokemons.length / POKEMONS_PER_PAGE
    );

     const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    );

    const goToPage = () => {
        const page = Number(pageInput);
        if (isNaN(page) || page < 1 || page > totalPages) {
            setPageInput(currentPage.toString());
            return;
        }
        setCurrentPage(page);
    };

    const scrollToSearch = () => {searchRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return(
        <div className="pokedex-container">  
            <section className="hero">
                <div className="hero-bg-circle"></div>
                <div className="hero-bg-circle circle-2"></div>

                <div className="hero-left">
                    <div className="welcome">⚡ WELCOME TRAINER!</div>
                    <h1 className="hero-title">POKÉMON <span>NEXUS</span></h1>
                    <h2>Catch • Build • Battle</h2>
                    <p>Explore 576 Pokémon and build your ultimate team.</p>
                    <button className="hero-btn" onClick={scrollToSearch}>
                        Explore Pokémon
                    </button>

                    <div className="hero-stats">
                        <div>
                            <h3>576</h3>
                            <span>Pokémon</span>
                        </div>
                        <div>
                            <h3>18</h3>
                            <span>Types</span>
                        </div>
                        <div>
                            <h3>1000+</h3>
                            <span>Battles</span>
                        </div>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="electric-flash"></div>
                    <img src={ImageBanner} alt="pikachu" className="hero-pikachu" />
                </div>

            </section>

                {pokemons.length === 0 ? (<Loading /> ) : (
                    <> 
                    <div ref={searchRef}> 
                        <SearchFilter 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm}
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                        /> 
                    </div> 
                    <div className="pokemon-grid">
                        {filteredPokemons.length > 0 ? (
                            currentPokemons.map((pokemon) => (  
                                <PokemonCard 
                                    key={pokemon.id} 
                                    pokemon={pokemon}
                                />
                            )) ) : 
                            (
                                <h2 className="h2-pokemon-find">No Pokemon Find</h2>
                            )
                        }
                    </div>

                    <div className="pagination-container">
                        <div className="page-input">
                            Page

                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                onKeyDown={(e) => {if (e.key === "Enter") {goToPage();}}}
                                onBlur={() => {goToPage();}}
                            />

                            / {totalPages}
                        </div>

                        <div className="pagination">
                            <button
                                onClick={() => {
                                const page = Math.max(currentPage - 1, 1);
                                setCurrentPage(page);
                                }}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>

                            {pageNumbers
                                .filter((page) =>
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                ).map((page) => (
                                <button
                                    key={page}
                                    className={
                                    currentPage === page
                                        ? "page-btn active"
                                        : "page-btn"
                                    }
                                    onClick={() => {
                                    setCurrentPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => {
                                const page = Math.min(currentPage + 1, totalPages);
                                setCurrentPage(page);
                                }}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>

                    </div>

                    </>
                )}
        </div>
    )
}

export default Home;