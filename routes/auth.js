const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const auth = require("../middleware/auth")

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    let userExists = await User.findOne({ email })
    if (userExists)
      return res.status(400).json({ error: "This email is already active." })

    const user = new User({ name, email, password })
    await user.save()

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: "User not found." })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: "Invalid Password." })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User profile not found." })
    }
    res.status(200)
    res.json({
      success: true,
      message: "user fetched successfully",
      respondedData: user,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

module.exports = router
