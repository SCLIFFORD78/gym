"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");

const assessment = {
  index(request, response) {
    const assessmentId = request.params.id;
    logger.debug("Assessment id = ", assessmentId);
    const viewData = {
      assessment: assessmentStore.getAssessment(assessmentId)
    };
    response.render("assessment", viewData);
  },

  deletAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.debug(`Deleting Assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    response.redirect("/dashboard");
  }
};

module.exports = assessment;
