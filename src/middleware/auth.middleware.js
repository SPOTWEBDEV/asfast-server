const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload; // attach payload
    next();

  } catch (err) {
    return res.json({
      success: false,
      message: "Invalid token"
    });
  }
};
