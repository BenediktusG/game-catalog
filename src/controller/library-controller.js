import libraryService from "../service/library-service"

const buyGame = async (req, res, next) => {
    try {
        const result = await libraryService.buyGame(req.body, req.user);
        res.status(201).json({
            message: 'Game bought successfully',
            data: {
                gameId: result.gameId,
                price: result.game.price,
            },
        });
    } catch (e) {
        next(e);
    }
}

const getAllGames = async (req, res, next) => {
    try {
        const result = await libraryService.getAllGames(req.user);
        const game_data = result.map((data) => {
            return {
                gameId: data.game.id,
                gameName: data.game.name,
            }
        });
        res.status(200).json({
            message: 'Retrieved all of your game successfully',
            data: {
                totalGame: game_data.length,
                games: game_data,
            }
        });
    } catch (e) {
        next(e);
    }
}

export default {
    buyGame,
    getAllGames,
}