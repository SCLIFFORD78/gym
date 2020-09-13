"use strict";

const accounts = require("../controllers/accounts.js");
const assessmentStore = require("../models/assessment-store");
const logger = require("../utils/logger");
const userstore = require("../models/user-store");

const utility = {
  calculateBMI(startingWeight, height, assessment) {
    var bmi;
    if (!assessment) {
      bmi = startingWeight / height / height;
    } else {
      if (assessment.weight != 0) {
        bmi = assessment.weight / height / height;
      } else {
        bmi = startingWeight / height / height;
      }
    }
    return bmi.toFixed(2);
  },

  isIdealBodyWeight(user, assessment) {
    var heightInmm = user.height * 1000;
    var mmAboveFiveFeet = heightInmm - 1524; //5ft in mm = 1524
    mmAboveFiveFeet = mmAboveFiveFeet / 25.4; //mm per inch

    var lowerBracket;
    var upperBracket;
    var result = true;

    if (user.gender === "Male") {
      mmAboveFiveFeet = mmAboveFiveFeet * 2.3 + 50;
      lowerBracket = mmAboveFiveFeet - 0.2;
      upperBracket = mmAboveFiveFeet + 0.2;
      if (!assessment) {
        if (user.startWeight < lowerBracket || user.startWeight > upperBracket)
          result = false;
      } else {
        if (
          assessment.weight < lowerBracket ||
          assessment.weight > upperBracket
        )
          result = false;
      }
    } else if (user.gender === "Female" || user.gender === "Unspecified") {
      mmAboveFiveFeet = mmAboveFiveFeet * 2.3 + 45.5;
      lowerBracket = mmAboveFiveFeet - 0.2;
      upperBracket = mmAboveFiveFeet + 0.2;
      if (assessment === 0) {
        if (user.weight < lowerBracket || user.weight > upperBracket)
          result = false;
      } else {
        if (
          assessment.weight < lowerBracket ||
          assessment.weight > upperBracket
        )
          result = false;
      }
    }
    return result;
  },

  determineBMICategory(bmiValue) {
    if (bmiValue < 16) return "SEVERELY UNDERWEIGHT";
    else if (bmiValue >= 16 && bmiValue < 18.5) return "UNDERWEIGHT";
    else if (bmiValue >= 18.5 && bmiValue < 25) return "NORMAL";
    else if (bmiValue >= 25 && bmiValue < 30) return "OVERWEIGHT";
    else if (bmiValue >= 30 && bmiValue < 35) return "MODERATELY OBESE";
    else if (bmiValue >= 35) return "SEVERELY OBESE";
    else return null;
  },

  trend(assessments, user) {
    var test = [];
    var assessment = assessmentStore.getUserAssessment(user.id).reverse();
    var trend;
    if (assessment.length === 1) {
      if (Number(assessment[0].weight) < Number(user.startWeight)) {
        trend = true;
        assessmentStore.updateAssessmentTrend(assessment[0].id, trend);
      } else {
        trend = false;
        assessmentStore.updateAssessmentTrend(assessment[0].id, trend);
      }
    } else if (assessment.length > 1) {
      for (var i = 0; i < assessment.length; i++) {
        if (i === assessment.length - 1) {
          if (Number(assessment[i].weight) <= Number(user.startWeight)) {
            trend = true;
            assessmentStore.updateAssessmentTrend(assessment[i].id, trend);
          } else {
            trend = false;
            assessmentStore.updateAssessmentTrend(assessment[i].id, trend);
          }
        } else if (i < assessment.length - 1) {
          if (
            Number(assessment[i].weight) <= Number(assessment[i + 1].weight)
          ) {
            trend = true;
            assessmentStore.updateAssessmentTrend(assessment[i].id, trend);
          } else {
            trend = false;
            assessmentStore.updateAssessmentTrend(assessment[i].id, trend);
          }
        }
      }
    }

    return assessment;
  },

  timeStamp(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    if (date < 10) {
      date = "0" + date;
    }
    var hour = a.getHours();
    var min = a.getMinutes();
    if (min < 10) {
      min = "0" + min;
    }
    var sec = a.getSeconds();
    if (sec < 10) {
      sec = "0" + sec;
    }
    var time =
      date + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;
    return time;
  },

  timeStampDay(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    if (date < 10) {
      date = "0" + date;
    }
    var time = date + "/" + month + "/" + year;
    return time;
  },

  checkGoalStatus(userID, goals) {
    var user = userstore.getUserById(userID);
    var assessments = assessmentStore.getUserAssessment(userID);
    assessments = assessments[assessments.length - 1];
    var targetMeasurement;
    var targetMeasurementValue;
    var prop, currentValue;
    if (assessments && goals.status == "Open") {
      for (prop in assessments) {
        if (prop === goals.measurements) {
          targetMeasurement = goals.measurements;
          //goals.date = Date.now() - 5000; //For testing purposes TEST
          currentValue = assessments[targetMeasurement];
          if (
            (currentValue <= goals.target &&
              Date.now() < goals.date &&
              goals.initialValue > goals.target) ||
            (currentValue >= goals.target &&
              Date.now() < goals.date &&
              goals.initialValue < goals.target)
          ) {
            goals.status = "Achieved";
            goals.comments =
              "Actual Value: " +
              currentValue +
              ". Achieved on " +
              this.timeStampDay(Date.now());
          } else if (Date.now() > goals.date) {
            goals.status = "Missed";
          }
        }
      }
    } else {
      //goals.date = Date.now() - 5000; //For testing purposes TEST
      if (Date.now() > goals.date && goals.status == "Open") {
        goals.status = "Missed";
        goals.comments = "Assessment not entered in Time";
      }
    }
	userstore.store.save();
    return goals;
  },

  goalSummary(goals) {
    var goalSummary = [];
    var open = 0,
      achieved = 0,
      total = 0,
      missed = 0;
    if (goals) {
      for (var i = 0; i < goals.length; i++) {
        if (goals[i].status == "Open") {
          open += 1;
        } else if (goals[i].status == "Missed") {
          missed += 1;
        } else if (goals[i].status == "Achieved") {
          achieved += 1;
        }
        total = goals.length;
      }
    }
    goalSummary.total = total;
    goalSummary.open = open;
    goalSummary.missed = missed;
    goalSummary.achieved = achieved;
	userstore.store.save();
    return goalSummary;
  }
};

module.exports = utility;
