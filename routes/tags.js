const express = require("express")
const router = express.Router()
const Tag = require("../models/Tag")
const auth = require("../middleware/auth")

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body

    const tagExists = await Tag.findOne({ name })
    if (tagExists) {
      return res
        .status(400)
        .json({ error: "This tag name is already registered." })
    }

    const newTag = new Tag({ name })
    const savedTag = await newTag.save()
    res.status(200)
    res.json({
      success: true,
      message: "Tags created successfully",
      respondedData: savedTag,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get("/", auth, async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 })
    res.status(200)
    res.json({
      success: true,
      message: "Tags fetched successfully",
      respondedData: tags,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

module.exports = router
