import { ResponseError } from "../error/response-error";
import gameService from "../service/game-service"

const upload = async (req, res, next) => {
    try {
        const result = await gameService.upload(req.body, req.user);
        res.status(201).json({
            message: 'Game successfully uploaded',
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const getSpecificGame = async (req, res, next) => {
    try {
        const result = await gameService.getSpecificGame(req.params.gameId);
        res.status(200).json({
            message: 'Game retrieved successfully',
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const getAllGames = async (req, res, next) => {
    let { page, limit } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
        next(new ResponseError('Invalid page value'));
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
        next(new ResponseError('Invalid limit value'));
    }

    try {
        const result = await gameService.getAllGames({page, limit});
        res.status(200).json({
            message: 'Data retrieved successfully',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const edit = async (req, res, next) => {
    try {
        const result = await gameService.edit(req.body, req.params.gameId, req.user);

        res.status(200).json({
            message: 'Game updated successfully',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const deleteGame = async (req, res, next) => {
    try {
        await gameService.deleteGame(req.params.gameId, req.user);

        res.status(200).json({
            message: 'Game deleted successfully'
        });
    } catch (e) {
        next(e);
    }
}

export default {
    upload,
    getSpecificGame,
    getAllGames,
    edit,
    deleteGame,
}