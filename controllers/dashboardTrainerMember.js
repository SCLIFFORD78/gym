"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const userstore = require("../models/user-store");

const dashboardTrainerMember = {
  index(request, response) {
    logger.info("dashboardTrainerMember rendering");
    const memberId = request.params.id;
    const member = userstore.getUserById(memberId);
    var assessments = utility.trend(
      assessmentStore.getUserAssessment(memberId),
      member
    );
    var goals = userstore.getUserGoals(memberId);
    if (member.goals) {
      for (var i = 0; i < goals.length; i++) {
        if (goals[i]) {
          utility.checkGoalStatus(member.id, goals[i]);
          var targetDate = goals[i].date;
          targetDate = utility.timeStampDay(targetDate);
          var assign = { targetDate: targetDate };
          goals[i] = Object.assign(goals[i], assign);
        }
      }
    }
    var latestWeight;
    if (assessments.length === 0) {
      latestWeight = 0;
    } else {
      latestWeight = assessments[0];
      for (var i = 0; i < assessments.length; i++) {
        var time = { time: utility.timeStamp(assessments[i].date) };
        assessments[i] = Object.assign(assessments[i], time);
      }
    }
    var bmi = utility.calculateBMI(
      member.startWeight,
      member.height,
      latestWeight
    );

    const viewData = {
      member: member,
      assessments: assessments,
      goals: goals,
      bmi: bmi,
      isIdealBodyWeight: utility.isIdealBodyWeight(member, latestWeight),
      determineBMICategory: utility.determineBMICategory(bmi)
    };

    response.render("dashboardTrainerMember", viewData);
  },

  updateAssessment(request, response) {
    const assessmentId = request.params.id;
    const userID = request.params.userid;
    logger.debug(`Updating Assessment ${assessmentId}`);
    var assessment = assessmentStore.getAssessment(assessmentId);
    assessmentStore.updateAssessment(assessmentId, request.body.comments);
    response.redirect("/dashboardTrainerMember/" + userID);
  },

  addGoal(request, response) {
    const member = userstore.getUserById(request.params.id);
    const loggedInUser = accounts.getCurrentUser(request);
    var assessments = assessmentStore.getUserAssessment(member.id);
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
      title: request.body.title,
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
    userstore.addGoal(member.id, newGoal);
    response.redirect("/dashboardTrainerMember/" + request.params.id);
  },

  deletGoal(request, response) {
    const goalID = request.params.id;
    var allUsers = userstore.getAllUsers();
    for (var i = 0; i < allUsers.length; i++)
      if (allUsers[i].goals)
        for (var j = 0; j < allUsers[i].goals.length; j++)
          if (goalID === allUsers[i].goals[j].id) var member = allUsers[i];
    logger.debug(`Deleting Goal ${goalID}`);
    userstore.removeGoal(member.id, goalID);
    response.redirect("/dashboardTrainerMember/" + member.id);
  },

  updateGoalComments(request, response) {
    const goalID = request.params.id;
    var comments = request.body.comments;
    var allUsers = userstore.getAllUsers();
    for (var i = 0; i < allUsers.length; i++)
      if (allUsers[i].goals)
        for (var j = 0; j < allUsers[i].goals.length; j++)
          if (goalID === allUsers[i].goals[j].id) var member = allUsers[i];
    logger.debug(`Updating Goal comment ${goalID}`);
    userstore.updateGoal(member.id, goalID, comments);
    response.redirect("/dashboardTrainerMember/" + member.id);
  }
};

module.exports = dashboardTrainerMember;
