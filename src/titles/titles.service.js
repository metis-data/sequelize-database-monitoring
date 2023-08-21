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

    function titlesForAnActorWithoutExplosion() {
      return titleBasic 
        .findAll({
          include: [{
            model: titlePrincipal,
            required: true,
            duplicating: false,
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

    function titlesForAnActorManual() {
      return sequelize.query(`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
        sequelize.query(`
          SELECT TitleBasic.*
          FROM imdb.title_basics AS TitleBasic
          JOIN imdb.title_principals AS TitlePrincipals ON TitlePrincipals.tconst = TitleBasic.tconst
          WHERE TitlePrincipals.nconst = :nconst
          ORDER BY TitleBasic.startyear DESC
          LIMIT 10
        `, {
          model: titleBasic,
          mapToModel: true,
          replacements: {
            nconst: nconst
          },
        })
      );
    }

    //return titlesForAnActorNaive();
    //return titlesForAnActorWithoutExplosion();
    return titlesForAnActorManual();
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

    function highestRatedMoviesForAnActorWithIndex() {
      return sequelize.query(`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
        titleBasic 
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
          })
      );
    }

    //return highestRatedMoviesForAnActorNaive();
    return highestRatedMoviesForAnActorWithIndex();
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

    function highestRatedMoviesWithIndex() {
      return sequelize.query(`CREATE INDEX IF NOT EXISTS IDX_title_ratings_637d5836 ON imdb.title_ratings (numvotes)`).then(() => 
        titleBasic 
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
          })
      );
    }

    //return highestRatedMoviesNaive();
    return highestRatedMoviesWithIndex();
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

    function commonMoviesForTwoActorsInApp() {
      const first = titlePrincipal 
        .findAll({
          attributes: ['tconst'],
          where: {
            'nconst': actor1
          }
        }).then(titles => titles.map(t => t.tconst));

      const second = titlePrincipal 
      .findAll({
        attributes: ['tconst'],
        where: {
          'nconst': actor2
        }
      }).then(titles => titles.map(t => t.tconst));

      return first.then(firstTitles => second.then(secondTitles => { 
        return titleBasic 
          .findAll({
            where: {
              tconst: { 
                [Op.and]: [
                  {
                    [Op.in]: [...firstTitles]
                  },
                  {
                    [Op.in]: [...secondTitles]
                  }
                ]
              }
            }
        });
      }));
    }
    
    function commonMoviesForTwoActorsManual() {
      return sequelize.query(`CREATE INDEX IF NOT EXISTS title_principals_nconst_idx ON imdb.title_principals(nconst) INCLUDE (tconst)`).then(() => 
        sequelize.query(`
          SELECT TB.*
          FROM imdb.title_basics AS TB
          JOIN imdb.title_principals AS TP1 ON TP1.tconst = TB.tconst
          JOIN imdb.title_principals AS TP2 ON TP2.tconst = TB.tconst
          WHERE TP1.nconst = :actor1 AND TP2.nconst = :actor2
        `, {
          model: titleBasic,
          mapToModel: true,
          replacements: {
            actor1: actor1,
            actor2: actor2
          },
        })
      );
    }
    
    //return commonMoviesForTwoActorsNaive();
    //return commonMoviesForTwoActorsInApp();
    return commonMoviesForTwoActorsManual();
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

    function crewOfGivenMovieWithUnions() {
      return sequelize.query(`
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE '%,'::text || NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.directors LIKE '%,'::text || NB.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers = NB.nconst
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE '%,'::text || NB.nconst || ',%'::text
      UNION
        SELECT DISTINCT NB.*
        FROM imdb.title_principals AS TP
        JOIN (
          SELECT tconst, directors, writers
          FROM imdb.title_crew
          WHERE tconst = :tconst
        ) AS TC ON TC.tconst = TP.tconst
        LEFT JOIN imdb.name_basics AS NB ON TC.writers LIKE '%,'::text || NB.nconst
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          tconst: tconst
        }
      });
    }

    function crewOfGivenMovieInAppCode() {
      const crewViaTitlePrincipals = titlePrincipal 
        .findAll({
          attributes: ['nconst'],
          where: {
            'tconst': tconst
          }
        }).then(crew => crew.map(c => c.nconst));

      const crewViaTitleCrew = titleCrew
        .findAll({
          where: {
            'tconst': tconst
          }
        });

      const crewMatchingNames = crewViaTitleCrew.then(crew => crew.flatMap(c => [
          c.directors.split(','),
          c.writers.split(',')
        ].flat()));

      const allMatchingNames = crewViaTitlePrincipals.then(crew1 => crewMatchingNames.then(crew2 => new Set([crew1, crew2].flat())));

      return allMatchingNames.then(names => nameBasic
        .findAll({
          where: {
            'nconst': { [Op.in]: [...names] }
          }
        }));
    }

    function crewOfGivenMovieManualFast() {
      return sequelize.query(`
        WITH RECURSIVE numbers AS (
          SELECT 1 AS number
          UNION ALL
          SELECT number + 1 AS number FROM numbers WHERE number < 1500
        ),
        split_associations AS (
            SELECT SPLIT_PART(TC.directors, ',', N.number) AS nconst
            FROM imdb.title_crew AS TC
            CROSS JOIN numbers AS N
            WHERE tconst = :tconst AND directors IS NOT NULL AND CHAR_LENGTH(directors) - CHAR_LENGTH(REPLACE(directors, ',', '')) + 1 >= N.number
          UNION
            SELECT SPLIT_PART(TC.writers, ',', N.number) AS nconst
            FROM imdb.title_crew AS TC
            CROSS JOIN numbers AS N
            WHERE tconst = :tconst AND writers IS NOT NULL AND CHAR_LENGTH(writers) - CHAR_LENGTH(REPLACE(writers, ',', '')) + 1 >= N.number
        ),
        all_associations AS (
          SELECT SA.nconst
          FROM split_associations AS SA
          UNION
          SELECT TP.nconst
          FROM imdb.title_principals AS TP
          WHERE TP.tconst = :tconst
        )
        SELECT NB.*
        FROM imdb.name_basics AS NB
        JOIN all_associations AS AA ON AA.nconst = NB.nconst
        `, {
          model: nameBasic,
          mapToModel: true,
          replacements: {
            tconst: tconst
          }
        });
    }

    //return crewOfGivenMovieManualSlow();
    //return crewOfGivenMovieWithUnions();
    //return crewOfGivenMovieInAppCode();
    return crewOfGivenMovieManualFast();
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

    function mostProlificActorInPeriodManual(){
      return sequelize.query(`
      SELECT NB.nconst, MAX(NB.primaryname) AS primaryname, MAX(nb.birthyear) AS birthyear, MAX(NB.deathyear) AS deathyear, MAX(nb.primaryprofession) AS primaryprofession, COUNT(*) AS number_of_titles
        FROM imdb.title_basics AS TB
        RIGHT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
        RIGHT JOIN imdb.name_basics AS NB ON NB.nconst = TP.nconst
        WHERE TB.startyear >= :startyear AND TB.startyear <= :endyear
        GROUP BY NB.nconst
        ORDER BY number_of_titles DESC
        LIMIT 1
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          startyear: startYear,
          endyear: endYear
        }
      });
    }

    function mostProlificActorInPeriodManualOptimized(){
      return sequelize.query(`
        WITH best_actor AS (
                SELECT TP.nconst, COUNT(*) AS number_of_titles
                FROM imdb.title_basics AS TB
                LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
                WHERE TB.startyear >= :startyear AND TB.startyear <= :endyear AND TP.nconst IS NOT NULL
                GROUP BY TP.nconst
                ORDER BY number_of_titles DESC
                LIMIT 1
        )
        SELECT BA.nconst, BA.number_of_titles, NB.primaryname, nb.birthyear, NB.deathyear, nb.primaryprofession
        FROM best_actor AS BA
        JOIN imdb.name_basics AS NB ON NB.nconst = BA.nconst
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          startyear: startYear,
          endyear: endYear
        }
      });
    }

    //return mostProlificActorInPeriodInApp();
    //return mostProlificActorInPeriodManual();
    return mostProlificActorInPeriodManualOptimized();
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

    function mostProlificActorInGenreManual(){
      return sequelize.query(`
        SELECT NB.nconst, NB.primaryname, NB.birthyear, COUNT(*) AS movies_count
        FROM imdb.name_basics AS NB
        LEFT JOIN imdb.title_principals AS TP ON TP.nconst = NB.nconst
        LEFT JOIN imdb.title_basics AS TB ON TB.tconst = TP.tconst
        WHERE TB.genres = :genre OR TB.genres LIKE (:genre || ',%') OR TB.genres LIKE ('%,' || :genre || ',%') OR TB.genres LIKE ('%,' || :genre)
        GROUP BY NB.nconst, NB.primaryname, NB.birthyear
        ORDER BY movies_count DESC
        LIMIT 10
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          genre: genre
        }
      });
    }

    function mostProlificActorInGenreManualOptimized(){
      return sequelize.query(`
        WITH best_actors AS (
          SELECT TP.nconst, COUNT(*) AS movies_count
          FROM imdb.title_basics AS TB
          LEFT JOIN imdb.title_principals AS TP ON TP.tconst = TB.tconst
          WHERE TB.genres = :genre OR TB.genres LIKE (:genre || ',%') OR TB.genres LIKE ('%,' || :genre || ',%') OR TB.genres LIKE ('%,' || :genre)
          GROUP BY TP.nconst
          ORDER BY movies_count DESC
          LIMIT 10
        )
        SELECT BA.nconst, NB.primaryname, NB.birthyear, BA.movies_count
        FROM best_actors AS BA
        JOIN imdb.name_basics AS NB ON NB.nconst = BA.nconst
        ORDER BY movies_count DESC
      `, {
        model: nameBasic,
        mapToModel: true,
        replacements: {
          genre: genre
        }
      });
    }

    //return mostProlificActorInGenreInApp();
    //return mostProlificActorInGenreManual();
    return mostProlificActorInGenreManualOptimized();
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

    function mostCommonTeammatesInApp() {
      const titlesPrincipalMatchingPerson = titlePrincipal
        .findAll({
          attributes: ['tconst'],
          where: {
            nconst: nconst
          }
        }).then(titles => titles.map(t => t.tconst));

      const otherTitlePrincipals = titlesPrincipalMatchingPerson.then(titles => titlePrincipal
        .findAll({
          attributes: ['nconst'],
          where: {
            tconst: { [Op.in]: titles },
            nconst: { [Op.ne]: nconst }
          }
        })).then(titles => titles.map(t => t.nconst));

      const titleCrewMatchingPerson = titleCrew
        .findAll({
          where: {
            [Op.or]: [
              { directors: { [Op.like]: '%' + nconst + '%' } },
              { writers: { [Op.like]: '%' + nconst + '%' } }
            ]
          }
        }).then(titles => {
          return titles
            .filter(t => (t.directors || "").split(",").indexOf(nconst) >= 0 || (t.writers || "").split(",").indexOf(nconst) >= 0)
            .map(t => [...new Set([(t.directors || "").split(","), (t.writers || "").split(",")].flat())].filter(n => n != nconst && n != "" && n))
        });

      const allTeammates = Promise.all([otherTitlePrincipals, titleCrewMatchingPerson]).then(nconsts => {
        return nconsts.flat().filter(n => n && n != "");
      });

      const topTeammates = allTeammates.then(nconsts => {
        const counts = nconsts
          .reduce(
            (entryMap, e) => {
              entryMap[e] = (entryMap[e] || 0) + 1;
              return entryMap;
            },
            {}
          );
        const keys = Object.keys(counts);
        const countsWithKeys = keys.map(k => [counts[k], k]);
        countsWithKeys.sort((pair1, pair2) => pair2[0] - pair1[0]);
        const topResults = countsWithKeys.splice(0,5);
        return topResults;
      });

      return topTeammates.then(countsWithKeys => nameBasic
        .findAll({
          where: {
            nconst: { [Op.in]: countsWithKeys.map(c => "" + c[1]) }
          }
        }).then(actors => actors.map(a => {
          a.common_titles = countsWithKeys.filter(c => c[1] == a.nconst)[0][0];
          return a;
        })));
    }

    //return mostCommonTeammatesManual();
    return mostCommonTeammatesInApp();
  },
};
