'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NameBasic extends Model {
    static associate(models) {
    }
  }
  NameBasic.init(
    {
      nconst: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      primaryname: { type: DataTypes.TEXT },
      birthyear: { type: DataTypes.INTEGER },
      deathyear: { type: DataTypes.INTEGER },
      primaryprofession: { type: DataTypes.TEXT },
      knownfortitles: { type: DataTypes.TEXT }
    },
    {
      sequelize,
      modelName: 'NameBasic',
      tableName: 'name_basics',
      schema: 'imdb',
      timestamps: false,
    }
  );
  return NameBasic;
};
