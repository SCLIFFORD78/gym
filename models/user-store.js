"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const logger = require("../utils/logger"); //TEST

const userStore = {
  store: new JsonStore("./models/user-store.json", { users: [] }),
  collection: "users",

  getAllUsers() {
    return this.store.findAll(this.collection);
  },

  addUser(user) {
    this.store.add(this.collection, user);
    this.store.save();
  },

  removeUser(id) {
    const user = this.getUserById(id);
    this.store.remove(this.collection, user);
    this.store.save();
  },

  getUserById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  getUserByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },

  getUserGoals(userid) {
    const user = this.getUserById(userid);
    const goals = user.goals;
    return goals;
  },

  addGoal(id, goal) {
    const user = this.getUserById(id);
    logger.info(goal); //TEST
    user.goals.push(goal);
    this.store.save();
  },

  removeGoal(id, goalId) {
    const user = this.getUserById(id);
    const goals = user.goals;
    _.remove(goals, { id: goalId });
    this.store.save();
  },

  updateGoal(id, goalId, comments) {
    const user = this.getUserById(id);
    const goals = user.goals;
    if (goals) {
      for (var i = 0; i < goals.length; i++) {
        if (goals[i].id === goalId) {
          goals[i].comments = comments;
        }
      }
    }

    this.store.save();
  }
};

module.exports = userStore;
