'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TitleRating extends Model {
    static associate(models) {
    }
  }
  TitleRating.init(
    {
      tconst: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      averagerating: { type: DataTypes.DECIMAL},
      numvotes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'TitleRating',
      tableName: 'title_ratings',
      schema: 'imdb',
      timestamps: false,
    }
  );
  return TitleRating;
};
