"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const userStore = require("../models/user-store");

const dashboardTrainer = {
  index(request, response) {
    logger.info("dashboardTrainer rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    var users = userStore.getAllUsers();
    var members = [];
    if (users.length > 0) {
      for (var i = 0; i < users.length; i++) {
        members.push(users[i]);
        var assessmentNumber = {
          assNum: assessmentStore.getUserAssessment(members[i].id).length
        };
        if (userStore.getUserGoals(members[i].id) != undefined) {
          var goalsNumber = {
            goalsNum: userStore.getUserGoals(members[i].id).length
          };
          members[i] = Object.assign(members[i], goalsNumber);
        }

        members[i] = Object.assign(members[i], assessmentNumber);
      }
      for (var i = 0; i < members.length; i++) {
        if (members[i].id === loggedInUser.id) members.splice(i, 1);
      }
    }

    const viewData = {
      members: members,
      user: loggedInUser
    };

    response.render("dashboardTrainer", viewData);
  },

  deleteMember(request, response) {
    const userID = request.params.id;
    logger.debug(`Deleting Assessments ${userID}`);
    var assessments = assessmentStore.getUserAssessment(userID);
    for (var i = 0; i < assessments.length; i++) {
      assessmentStore.removeAssessment(assessments[i].id);
    }
    logger.debug(`Deleting User ${userID}`);
    userStore.removeUser(userID);
    response.redirect("/dashboardTrainer");
  }
};

module.exports = dashboardTrainer;
