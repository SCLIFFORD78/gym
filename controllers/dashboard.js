"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    var loggedInUser = accounts.getCurrentUser(request);
    var assessments = utility.trend(
      assessmentStore.getUserAssessment(loggedInUser.id),
      loggedInUser
    );
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
      loggedInUser.startWeight,
      loggedInUser.height,
      latestWeight
    );
    const viewData = {
      assessments: assessments,
      user: loggedInUser,
      bmi: bmi,
      isIdealBodyWeight: utility.isIdealBodyWeight(loggedInUser, latestWeight),
      determineBMICategory: utility.determineBMICategory(bmi)
    };
    //logger.info('about to render', assessmentStore.getAllAssessment());
    response.render("dashboard", viewData);
  },

  addAssessment(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    var weight = request.body.weight
    if(weight === ''){      //catches a 'NaN' value when converted to float'
      weight = 0
    }
    const newAssessment = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      weight: parseFloat(weight),
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      comments: request.body.comments,
      date: Date.now() ,
      trend: ""
    };
    logger.debug("Creating a new Assessment", newAssessment);
    assessmentStore.addAssessment(newAssessment);
    response.redirect("/dashboard");
  }
};

module.exports = dashboard;
