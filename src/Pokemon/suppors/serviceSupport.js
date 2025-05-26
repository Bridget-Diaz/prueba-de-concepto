const Constans = require('../suppors/constans');

module.exports = {
    getGenerationByID(pokemonID) {
        const generationRanges = [
            { end: 151, gen: 1 },
            { end: 251, gen: 2 },
            { end: 386, gen: 3 },
            { end: 493, gen: 4 },
            { end: 649, gen: 5 },
            { end: 721, gen: 6 },
            { end: 809, gen: 7 },
            { end: 898, gen: 8 },
            { end: Infinity, gen: 9 }
        ];

        return generationRanges.find(range => pokemonID <= range.end).gen;
    },


    async getPokemonDetails(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching Pokémon details: ${error.message}`);
            return null;
        }
    },


    async getPokemonList(page = 1) {
        try {
            const offset = (page - 1) * PAGE_SIZE;
            const response = await axios.get(`${Constans.POKEAPI_URL}/pokemon`, {
                params: { limit: PAGE_SIZE, offset }
            });
            return {
                results: response.data.results,
                count: response.data.count
            };
        } catch (error) {
            console.error(`Error fetching Pokémon list: ${error.message}`);
            throw error;
        }
    },


    async getPokemonWithDetails(pokemon) {
        try {
            const details = await this.getPokemonDetails(pokemon.url);
            if (!details) return null;

            const generation = this.getGenerationByID(details.id);
            const types = details.types.map(type => type.type.name);


            let evolutionPhase = 1;
            try {
                const speciesData = await axios.get(`${POKEAPI_URL}/pokemon-species/${pokemon.name}`);
                if (speciesData.data.evolves_from_species) {
                    evolutionPhase = 2;
                }
            } catch (error) {
                console.error(`Error checking evolution for ${pokemon.name}: ${error.message}`);
            }

            return {
                name: pokemon.name,
                types,
                evolutionPhase,
                generation,
                id: details.id,
                sprite: details.sprites.front_default,
                url: pokemon.url
            };
        } catch (error) {
            console.error(`Error processing ${pokemon.name}: ${error.message}`);
            return null;
        }
    }
};