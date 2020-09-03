"use strict";

const logger = require("../utils/logger");
const utility = require("../utils/utility");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");

const member = {
  index(request, response) {
    logger.info("Account details rendering");
    var loggedInUser = accounts.getCurrentUser(request);

    const viewData = {
      user: loggedInUser
    };
    if (request.params.trainer) {
      response.render("memberTrainer", viewData);
    } else {
      response.render("member", viewData);
    }
  },

  updateMemberAccount(request, response) {
    logger.info("Updating Account details");
    var loggedInUser = accounts.getCurrentUser(request);

    var name = request.body.name;
    var gender = request.body.gender;
    var password = request.body.password;
    var address = request.body.address;
    var height = request.body.height;
    var startWeight = request.body.startWeight;

    if (name) {
      loggedInUser.name = name;
    }
    if (gender) {
      loggedInUser.gender = gender;
    }
    if (password) {
      loggedInUser.password = password;
    }
    if (address) {
      loggedInUser.address = address;
    }
    if (height) {
      loggedInUser.height = height;
    }
    if (startWeight) {
      loggedInUser.startWeight = startWeight;
    }

    response.redirect("/dashboard");
  }
};

module.exports = member;
