const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET MOVIES API 1
app.get("/movies/", async (request, response) => {
  const getMovies = `
        SELECT
            movie_name 
        FROM 
            movie;`;
  const movie = await db.all(getMovies);
  response.send(
    movie.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//POST MOVIE API 2
app.post("/movies/", async (request, response) => {
  const { movieName, leadActor, directorId } = request.body;
  const postDirectorList = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUES
        ('${directorId}','${movieName}','${leadActor}');`;
  await db.run(postDirectorList);
  response.send("Movie Successfully Added");
});
//GET API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
        SELECT 
            *
        FROM 
            movie
        WHERE
            movie_id = ${movieId};`;
  const movieList = await db.get(getMovie);
  response.send(convertMovieObjectToResponseObject(movieList));
});
//PUT API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { movieName, leadActor, directorId } = request.body;
  const updateMovieQuery = `
    UPDATE
        movie
    SET
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId}; `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//DELETE API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
        DELETE FROM
            movie
        WHERE 
            movie_id = ${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});
//GET DIRECTORS API 6
app.get("/directors/", async (request, response) => {
  const getDirectors = `
        SELECT
            * 
        FROM 
            director;`;
  const directors = await db.all(getDirectors);
  response.send(
    directors.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});
//GET SPECIFIC DIRECTOR API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT 
      movie_name 
    FROM 
      movie 
    WHERE 
      director_id = ${directorId};`;
  const director = await db.all(getDirectorQuery);
  response.send(
    director.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
