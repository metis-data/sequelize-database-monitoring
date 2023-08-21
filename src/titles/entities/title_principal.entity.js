'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TitlePrincipal extends Model {
    static associate(models) {
    }
  }
  TitlePrincipal.init(
    {
      tconst: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      ordering: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      nconst: { type: DataTypes.TEXT },
      category: { type: DataTypes.TEXT },
      job: { type: DataTypes.TEXT },
      characters: { type: DataTypes.TEXT }
    },
    {
      sequelize,
      modelName: 'TitlePrincipal',
      tableName: 'title_principals',
      schema: 'imdb',
      timestamps: false,
    }
  );
  return TitlePrincipal;
};
