'use strict';

const Sequelize = require('sequelize');
const sequelize = require('./connection');
const Issue = require('./issue');

const Revision = sequelize.define('revision', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  issue_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'issue_id',
    references: {
      model: Issue,
      key: 'id'
    }
  },
  issue_data: {
    type: Sequelize.JSON,
    allowNull: false,
    field: 'issue_data'
  },
  changes: {
    type: Sequelize.JSON,
    allowNull: false,
    field: 'changes'
  },
  created_by: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'created_by',
    defaultValue: 'unknown'
  }
}, {
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
  tableName: 'revisions'
});

// Define the association between Issue and Revision
Issue.hasMany(Revision, { foreignKey: 'issue_id' });
Revision.belongsTo(Issue, { foreignKey: 'issue_id' });

module.exports = Revision;