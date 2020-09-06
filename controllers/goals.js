"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const userstore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const assessmentStore = require("../models/assessment-store");

const goals = {
  index(request, response) {
    logger.info("dashboard with goals rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    var goals = userstore.getUserGoals(loggedInUser.id);
    var goalSummary;
    if (loggedInUser.goals) {
      for (var i = 0; i < goals.length; i++) {
        if (goals[i]) {
          utility.checkGoalStatus(loggedInUser.id, goals[i]);
          var targetDate = goals[i].date;
          targetDate = utility.timeStampDay(targetDate);
          var assign = { targetDate: targetDate };
          goals[i] = Object.assign(goals[i], assign);
        }
      }
    }
    goalSummary = utility.goalSummary(goals);
    const viewData = {
      goals: goals,
      user: loggedInUser,
      goalSummary: goalSummary
    };
    logger.info("about to render", userstore.getUserGoals(loggedInUser.id));
    if (request.params.trainer) {
      response.render("goalsTrainer", viewData);
    } else {
      response.render("goals", viewData);
    }
  },

  addGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    var assessments = assessmentStore.getUserAssessment(loggedInUser.id);
    var prop, initialValue;
    if (assessments) {
      var latestAssessment = assessments[assessments.length - 1];
      for (prop in latestAssessment) {
        if (prop === request.body.measurements) {
          initialValue = latestAssessment[prop];
        }
      }
    }
    const newGoal = {
      id: uuid.v1(),
      status: "Open",
      setBy: loggedInUser.name,
      measurements: request.body.measurements,
      date: Date.now() + 604800000 * Number(request.body.date),
      comments: request.body.comments,
      target: request.body.target,
      initialValue: initialValue
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
