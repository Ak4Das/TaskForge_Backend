const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization")
  if (!authHeader) {
    return res.status(401).json({
      error: "Access Denied: Missing authentication JWT token.",
    })
  }

  const token = authHeader.split(" ")[1]
  if (!token) {
    return res
      .status(401)
      .json({ error: "Access Denied: Token not present in header." })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (err) {
    res.status(403).json({ error: "Access Denied: Invalid Token." })
  }
}
