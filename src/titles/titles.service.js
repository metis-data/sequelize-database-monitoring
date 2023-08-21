const { Op } = require("sequelize");
const sequelize = require('../models').sequelize;
const titleBasic = require('../models').TitleBasic;
const titlePrincipal = require('../models').TitlePrincipal;
const titleRating = require('../models').TitleRating;
const titleCrew = require('../models').TitleCrew;
const nameBasic = require('../models').NameBasic;

module.exports = {
  getTitles(title) {
    return titleBasic 
      .findAll({
        where: {
          primarytitle: { [Op.like]: '%' + title + '%' }
        }
      });
  },
  
  titlesForAnActor(nconst) {
    function titlesForAnActorNaive() {
      return titleBasic 
        .findAll({
          include: [{
            model: titlePrincipal,
            required: true,
            as: 'titleBasicTitlePrincipal',
            where: {
              'nconst': nconst
            },
          }],
          order: [
            ['startyear', 'DESC']
          ],
          limit: 10
        });
    }

    return titlesForAnActorNaive();
  },
  
  highestRatedMoviesForAnActor(nconst) {
    function highestRatedMoviesForAnActorNaive(){
      return titleBasic 
        .findAll({
          include: [
            {
              model: titleRating,
              required: true,
              duplicating: false,
            },
            {
              model: titlePrincipal,
              required: true,
              duplicating: false,
              as: 'titleBasicTitlePrincipal',
              where: {
                'nconst': nconst
              },
            },
          ],
          order: [
            [ titleRating, 'averagerating', 'DESC'], 
          ],
          limit: 10
        });
    }

    return highestRatedMoviesForAnActorNaive();
  },
  
  highestRatedMovies(numvotes) {
    function highestRatedMoviesNaive() {
      return titleBasic 
        .findAll({
          include: [
            {
              model: titleRating,
              required: true,
              duplicating: false,
              where: {
                'numvotes': { [Op.gte]: numvotes }
              }
            },
          ],
          order: [
            [ titleRating, 'averagerating', 'DESC'], 
          ]
        });
    }

    return highestRatedMoviesNaive();
  },
  
  commonMoviesForTwoActors(actor1, actor2) {
    function commonMoviesForTwoActorsNaive() {
      // We had to configure second association in models to make this work
      return titleBasic 
        .findAll({
          include: [
            {
              model: titlePrincipal,
              required: true,
              duplicating: false,
              as: 'titleBasicTitlePrincipal',
              where: {
                'nconst': actor1
              }
            },
            {
              model: titlePrincipal,
              required: true,
              duplicating: false,
              as: 'titleBasicTitlePrincipal2',
              where: {
                'nconst': actor2
              }
            },
          ]
        });
    }
    
    return commonMoviesForTwoActorsNaive();
  },
  
  crewOfGivenMovie(tconst) {
    function crewOfGivenMovieManualSlow(){
        return sequelize.query(`
          SELECT DISTINCT NB.*
          FROM imdb.title_basics AS TB
          LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
          LEFT JOIN imdb.title_crew AS TC ON TC.tconst = TB.tconst
          LEFT JOIN imdb.name_basics AS NB ON 
                  NB.nconst = TP.nconst 
                  OR TC.directors = NB.nconst
                  OR TC.directors LIKE NB.nconst || ',%'::text
                  OR TC.directors LIKE '%,'::text || NB.nconst || ',%'::text
                  OR TC.directors LIKE '%,'::text || NB.nconst
                  OR TC.writers = NB.nconst
                  OR TC.writers LIKE NB.nconst || ',%'::text
                  OR TC.writers LIKE '%,'::text || NB.nconst || ',%'::text
                  OR TC.writers LIKE '%,'::text || NB.nconst
          WHERE TB.tconst = :tconst
        `, {
          model: nameBasic,
          mapToModel: true,
          replacements: {
            tconst: tconst
          }
      });
    }

    return crewOfGivenMovieManualSlow();
  },
  
  mostProlificActorInPeriod(startYear, endYear) {
    function mostProlificActorInPeriodInApp() {
      const titlesMatchingPeriod = titleBasic
        .findAll({
          attributes: ['tconst'],
          where: {
            startyear: { 
              [Op.and]: [ 
                { [Op.gte]: startYear },
                { [Op.lte]: endYear }
              ]
            }
          }
        }).then(titles => titles.map(t => t.tconst));

      const principals = titlesMatchingPeriod.then(titles => titlePrincipal
        .findAll({
          attributes: ['nconst'],
          where: {
            tconst: { [Op.in]: [...new Set(titles)] }
          }
        }).then(principals => {
          const counts = principals
            .reduce(
              (entryMap, e) => {
                entryMap[e.nconst] = (entryMap[e.nconst] || 0) + 1;
                return entryMap;
              },
              {}
            );
          const keys = Object.keys(counts);
          const countsWithKeys = keys.map(k => [counts[k], k]);
          countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
          const topResults = countsWithKeys.splice(0,1);
          return topResults;
        })
      );

      return principals.then(countsWithKeys => nameBasic
        .findAll({
          where: {
            nconst: { [Op.in]: countsWithKeys.map(c => "" + c[1]) }
          }
        }).then(actors => actors.map(a => {
          a.movies_count = countsWithKeys.filter(c => c[1] == a.nconst)[0][0];
          return a;
        })));
    }

    return mostProlificActorInPeriodInApp();
  },
  
  mostProlificActorInGenre(genre) {
    function mostProlificActorInGenreInApp() {
      const titlesMatchingGenre = titleBasic
        .findAll({
          attributes: ['tconst', 'genres'],
          where: {
            genres: { [Op.like]: '%' + genre + '%' }
          }
        }).then(titles => titles
          .filter(t => t.genres.split(',').indexOf(genre) >= 0)
          .map(t => t.tconst)
        );

      const principals = titlesMatchingGenre.then(titles => titlePrincipal
        .findAll({
          attributes: ['nconst'],
          where: {
            tconst: { [Op.in]: [...new Set(titles)] }
          }
        }).then(principals => {
          const counts = principals
            .reduce(
              (entryMap, e) => {
                entryMap[e.nconst] = (entryMap[e.nconst] || 0) + 1;
                return entryMap;
              },
              {}
            );
          const keys = Object.keys(counts);
          const countsWithKeys = keys.map(k => [counts[k], k]);
          countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
          const topResults = countsWithKeys.splice(0,10);
          return topResults;
        })
      );

      return principals.then(countsWithKeys => nameBasic
        .findAll({
          where: {
            nconst: { [Op.in]: countsWithKeys.map(c => "" + c[1]) }
          }
        }).then(actors => actors.map(a => {
          a.movies_count = countsWithKeys.filter(c => c[1] == a.nconst)[0][0];
          return a;
        })));
    }

    return mostProlificActorInGenreInApp();
  },
  
  mostCommonTeammates(nconst) {
    function mostCommonTeammatesManual(){
      return sequelize.query(`
        WITH RECURSIVE numbers AS (
          SELECT 1 AS number
          UNION ALL
          SELECT number + 1 AS number FROM numbers WHERE number < 1500
        ),
        titles_for_person AS (
            SELECT TC.tconst
            FROM imdb.title_crew AS TC
            WHERE directors = :nconst OR directors LIKE :nconst || ',%' OR directors LIKE '%,' || :nconst || ',%' OR directors LIKE '%,' || :nconst
          UNION
            SELECT TC.tconst
            FROM imdb.title_crew AS TC
            WHERE writers = :nconst OR writers LIKE :nconst || ',%' OR writers LIKE '%,' || :nconst || ',%' OR writers LIKE '%,' || :nconst
          UNION
            SELECT tconst
            FROM imdb.title_principals
            WHERE nconst = :nconst
        ),
        titles_corresponding AS (
          SELECT TC.tconst, TC.directors, TC.writers
          FROM imdb.title_crew AS TC
          JOIN titles_for_person AS TFP ON TFP.tconst = TC.tconst
        ),
        split_associations AS (
            SELECT TC.tconst, SPLIT_PART(TC.directors, ',', N.number) AS nconst
            FROM titles_corresponding AS TC
            CROSS JOIN numbers AS N
            WHERE directors IS NOT NULL AND CHAR_LENGTH(directors) - CHAR_LENGTH(REPLACE(directors, ',', '')) + 1 >= N.number
          UNION
            SELECT TC.tconst, SPLIT_PART(TC.writers, ',', N.number) AS nconst
            FROM titles_corresponding AS TC
            CROSS JOIN numbers AS N
            WHERE writers IS NOT NULL AND CHAR_LENGTH(writers) - CHAR_LENGTH(REPLACE(writers, ',', '')) + 1 >= N.number
        ),
        all_associations AS (
            SELECT SA.tconst, SA.nconst
            FROM split_associations AS SA
          UNION
            SELECT TP.tconst, TP.nconst
            FROM imdb.title_principals AS TP
            JOIN titles_for_person AS TFP ON TFP.tconst = TP.tconst
        ),
        other_people AS (
          SELECT nconst
          FROM all_associations
          WHERE nconst != :nconst
        ),
        top_peers AS (
          SELECT OP.nconst, COUNT(*) as common_titles
          FROM other_people AS OP
          GROUP BY nconst
          ORDER BY common_titles DESC
          LIMIT 5
        )
        SELECT TP.nconst, TP.common_titles, NB.*
        FROM top_peers AS TP
        JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
        ORDER BY TP.common_titles DESC
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          nconst: nconst
        }
      });
    }

    return mostCommonTeammatesManual();
  },
};
