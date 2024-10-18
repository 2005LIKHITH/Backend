// baar baar try catch block use karna na padhe isilieye use karthe hain asyncHandler
//an async function will return a proimise 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
/*

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);

        } catch (err) {
            next(err);
        }
    };
};
can also be written like this

*/

export { asyncHandler }

