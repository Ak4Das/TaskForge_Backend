const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const Team = require("../models/Team")
const auth = require("../middleware/auth")

router.get("/pending", auth, async (req, res) => {
  try {
    const activeTasks = await Task.find({ status: { $ne: "Completed" } })

    const totalDaysPending = activeTasks.reduce((accumulator, currentTask) => {
      const days = Number(currentTask.timeToComplete) || 0
      return accumulator + days
    }, 0)

    res.json({
      success: true,
      message: "Successful",
      respondedData: totalDaysPending,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get("/closed-tasks", auth, async (req, res) => {
  try {
    const completedTasks = await Task.find({ status: "Completed" })

    const teamCountsMap = {}
    completedTasks.forEach((task) => {
      if (task.team) {
        const teamIdStr = task.team.toString()
        teamCountsMap[teamIdStr] = (teamCountsMap[teamIdStr] || 0) + 1
      }
    })

    const allTeams = await Team.find()

    const distributions = allTeams
      .map((team) => {
        const teamIdStr = team._id.toString()
        return {
          _id: team._id,
          count: teamCountsMap[teamIdStr] || 0,
          teamDetails: {
            name: team.name,
          },
        }
      })
      .filter((item) => item.count > 0)

    res.status(200)
    res.json({
      success: true,
      message: "Successful",
      respondedData: distributions,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get("/last-week", auth, async (req, res) => {
  try {
    const date = new Date()
    date.setDate(date.getDate() - 7)

    const tasks = await Task.find({
      status: "Completed",
      updatedAt: { $gte: date },
    })

    const weekArray = [0, 0, 0, 0, 0, 0, 0]

    tasks.forEach((task) => {
      if (task.updatedAt) {
        const calendarIndex = new Date(task.updatedAt).getDay()

        const Index = calendarIndex === 0 ? 6 : calendarIndex - 1

        if (Index >= 0 && Index < 7) {
          weekArray[Index] += 1
        }
      }
    })

    res.json({
      success: true,
      message: "Successful",
      respondedData: weekArray,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

module.exports = router
