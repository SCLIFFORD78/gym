'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');

const assessmentStore = {

  store: new JsonStore('./models/assessment-store.json', { assessmentCollection: [] }),
  collection: 'assessmentCollection',

  getAllAssessment() {
    return this.store.findAll(this.collection);
  },

  getAssessment(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },
  
  updateAssessment(id, comments){
    const assessment = this.getAssessment(id);
    assessment.comments = comments;
    this.store.save(this.collection, assessment);
    this.store.save();
  },
  
  updateAssessmentTrend(id, trend){
    const assessment = this.getAssessment(id);
    assessment.trend = trend;
    this.store.save(this.collection, assessment);
    this.store.save();
  },

  addAssessment(assessment) {
    this.store.add(this.collection, assessment);
    this.store.save();
  },

  removeAssessment(id) {
    const assessment = this.getAssessment(id);
    this.store.remove(this.collection, assessment);
    this.store.save();
  },

  removeAllAssessment() {
    this.store.removeAll(this.collection);
    this.store.save();
  },
  
 
  getUserAssessment(userid) {
    return this.store.findBy(this.collection, { userid: userid });
  },
  
};

module.exports = assessmentStore;