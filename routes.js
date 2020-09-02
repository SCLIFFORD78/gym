"use strict";

const express = require("express");
const accounts = require('./controllers/accounts.js');
const router = express.Router();
const dashboard = require("./controllers/dashboard.js");
const goals = require("./controllers/goals.js");
const dashboardTrainer = require("./controllers/dashboardTrainer.js");
const dashboardTrainerMember = require("./controllers/dashboardTrainerMember.js");
const about = require("./controllers/about.js");
const assessment = require('./controllers/assessment.js');

router.get("/goals", goals.index);
router.get("/goals/deletGoals/:id", goals.deletGoal);
router.get("/dashboard", dashboard.index);
router.get("/dashboardTrainer", dashboardTrainer.index);
router.get("/dashboardTrainer/:id/deleteMember", dashboardTrainer.deleteMember);
router.get("/dashboardTrainerMember", dashboardTrainerMember.index);
router.get("/dashboardTrainerMember/:id", dashboardTrainerMember.index);
router.get("/dashboardTrainerMember/deletGoals/:id",dashboardTrainerMember.deletGoal);
router.get("/about", about.index);
router.get('/assessment/:id', assessment.index);
router.get('/assessment/deletAssessment/:id', assessment.deletAssessment);
router.get('/', accounts.index);
router.get('/login', accounts.login);
router.get('/signup', accounts.signup);
router.get('/logout', accounts.logout);

router.post('/goals/:id/addGoal', goals.addGoal);
router.post("/dashboardTrainerMember/:id/addGoalTrainer", dashboardTrainerMember.addGoal);
router.post('/dashboard/addassessment', dashboard.addAssessment);
router.post('/register', accounts.register);
router.post('/authenticate', accounts.authenticate);
router.post('/listassessmentsTrainerSelect/updateAssessment/:id/:userid', dashboardTrainerMember.updateAssessment);
router.post('/listGoalsTrainerSelect/updateComment/:id', dashboardTrainerMember.updateGoalComments);


module.exports = router;
