'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TitleBasic extends Model {
    static associate(models) {
    }
  }
  TitleBasic.init(
    {
      tconst: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      titletype: { type: DataTypes.TEXT },
      primarytitle: { type: DataTypes.TEXT },
      originaltitle: { type: DataTypes.TEXT },
      isadult: { type: DataTypes.BOOLEAN },
      startyear: { type: DataTypes.INTEGER },
      endyear: { type: DataTypes.INTEGER },
      runtimeminutes: { type: DataTypes.INTEGER },
      genres: { type: DataTypes.TEXT }
    },
    {
      sequelize,
      modelName: 'TitleBasic',
      tableName: 'title_basics',
      schema: 'imdb',
      timestamps: false,
    }
  );
  return TitleBasic;
};
