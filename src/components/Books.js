import React, { useState, useEffect } from "react";
import { ALL_BOOKS } from "../queries";
import { useLazyQuery, useQuery } from "@apollo/client";

const Books = () => {
  const [books, setBooks] = useState(null);
  const ALL_GENRES = "all genres";
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);
  const filterBooksByGenre = (genre) => {
    if (genre !== ALL_GENRES) {
      getBooks({ variables: { genre } });
    } else {
      getBooks();
    }
  };
  
  useEffect(() => {
    getBooks();
  }, [getBooks]);
  
  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks);
    }
  }, [result]);


  if (result.loading || !books) {
    return <div>loading...</div>;
  }
  console.log(books);
  const booksGenres = new Set(books.map((book) => book.genres).flat());
  booksGenres.add(ALL_GENRES);
  console.log(booksGenres);

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {[...booksGenres].map((genre) => (
        <button key={genre} onClick={() => filterBooksByGenre(genre)}>
          {genre}
        </button>
      ))}
    </div>
  );
};

export default Books;
