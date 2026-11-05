import {createError, ErrorDictionary} from "../utils/errors.js"

export const routeNotFoundHandle = (req,res,next) => {
    next(createError(ErrorDictionary.ROUTE_NOT_FOUND))
}