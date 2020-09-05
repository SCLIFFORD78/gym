"use strict";

const userstore = require("../models/user-store");
const logger = require("../utils/logger");
const uuid = require("uuid");

const accounts = {
  index(request, response) {
    const viewData = {
      title: "Login or Signup"
    };
    response.render("index", viewData);
  },

  login(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("login", viewData);
  },

  logout(request, response) {
    response.cookie("assessment", "");
    response.redirect("/");
  },

  signup(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("signup", viewData);
  },

  register(request, response) {
    const user = request.body;
    user.goals = [];
    const members = userstore.getAllUsers();
    var existingMember = false;
    for (var i = 0; i < members.length; i++) {
      if (members[i].email === user.email) {
        existingMember = true;
        break;
      }
    }
    if (!existingMember) {
      user.id = uuid.v1();
      userstore.addUser(user);
      logger.info(`registering ${user.email}`);
    }

    response.redirect("/");
  },

  authenticate(request, response) {
    const user = userstore.getUserByEmail(request.body.email);
    if (user === undefined) {
      response.redirect("/login");
    } else if (
      user.password === request.body.password &&
      user.accountType === "Member"
    ) {
      response.cookie("user", user.email);
      logger.info(`logging in ${user.email}`);
      response.redirect("/dashboard");
    } else if (
      user.password === request.body.password &&
      user.accountType === "Trainer"
    ) {
      response.cookie("user", user.email);
      logger.info(`logging in ${user.email}`);
      response.redirect("/dashboardTrainer");
    } else {
      response.redirect("/login");
    }
  },

  getCurrentUser(request) {
    const userEmail = request.cookies.user;
    return userstore.getUserByEmail(userEmail);
  }
};

module.exports = accounts;
