import ApiError from '../utils/ApiError.js';

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

export default notFound;
