
const Constans = require('../suppors/constans');
const ServiceSupport = require('../suppors/serviceSupport');




module.exports.pokemon = async (event) => {
    try {
        const { type, evolutionPhase, generation, page = 1 } = event.queryStringParameters || {};
        const { results: pokemonList, count } = await ServiceSupport.getPokemonList(parseInt(page));
        const pokemonDetails = await Promise.all(
            pokemonList.map(pokemon => ServiceSupport.getPokemonWithDetails(pokemon))
        );
        const validPokemon = pokemonDetails.filter(p => p !== null);

        const filteredPokemon = validPokemon.filter(pokemon => {
            const typeMatch = !type || type !== 'water' || pokemon.types.includes('water');
            const phaseMatch = !evolutionPhase || evolutionPhase !== '1' || pokemon.evolutionPhase === 1;
            const genMatch = !generation || generation !== '1' || pokemon.generation === 1;
            return typeMatch && phaseMatch && genMatch;
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                data: filteredPokemon,
                page: parseInt(page),
                pageSize: Constans.PAGE_SIZE,
                total: count,
                filteredCount: filteredPokemon.length,
                filtersApplied: {
                    type: type || 'none',
                    evolutionPhase: evolutionPhase || 'none',
                    generation: generation || 'none'
                }
            })
        };
    } catch (error) {
        console.error(`Controller error: ${error.message}`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                requestId: event.requestContext?.requestId || 'none'
            })
        };
    }
};