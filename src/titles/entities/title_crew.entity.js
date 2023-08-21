'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TitleCrew extends Model {
    static associate(models) {
    }
  }
  TitleCrew.init(
    {
      tconst: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      directors: { type: DataTypes.TEXT },
      writers: { type: DataTypes.TEXT }
    },
    {
      sequelize,
      modelName: 'TitleCrew',
      tableName: 'title_crew',
      schema: 'imdb',
      timestamps: false,
    }
  );
  return TitleCrew;
};
