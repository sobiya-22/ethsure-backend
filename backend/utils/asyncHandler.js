export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    console.error("🔥 ERROR:", err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";

    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
    }

    if (err.name === "CastError") {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `${field} already exists`;
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
};
