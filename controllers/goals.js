"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const userstore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");

const goals = {
  index(request, response) {
    logger.info("dashboard with goals rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    var goals = userstore.getUserGoals(loggedInUser.id);
    if (loggedInUser.goals) {
      for (var i = 0; i < goals.length; i++) {
        if (goals[i]) {
          utility.checkGoalStatus(loggedInUser.id, goals[i])
          var targetDate = goals[i].date;
          targetDate = utility.timeStampDay(targetDate);
          var assign = { targetDate: targetDate };
          goals[i] = Object.assign(goals[i], assign);
        }
      }
    }
    const viewData = {
      goals: goals,
      user: loggedInUser
    };
    logger.info("about to render", userstore.getUserGoals(loggedInUser.id));
    response.render("goals", viewData);
  },

  addGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    logger.info(loggedInUser);
    const newGoal = {
      id: uuid.v1(),
      status: "Open",
      setBy: loggedInUser.name,
      measurements: request.body.measurements,
      date: Date.now() + 604800000 * Number(request.body.date),
      comments: request.body.comments,
      target: request.body.target
    };
    logger.debug("Creating a new Goal", newGoal);
    userstore.addGoal(loggedInUser.id, newGoal);
    response.redirect("/goals");
  },

  deletGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const goalID = request.params.id;
    logger.debug(`Deleting Goal ${goalID}`);
    userstore.removeGoal(loggedInUser.id, goalID);
    response.redirect("/goals");
  }
};

module.exports = goals;
