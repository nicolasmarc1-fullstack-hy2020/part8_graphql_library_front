import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { ADD_BOOK, ALL_BOOKS } from "../queries";
import { ALL_AUTHORS } from "./../queries";

const NewBook = ({ setError, updateCacheWith }) => {
  const [title, setTitle] = useState("");
  const [author, setAuhtor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [addBook, result] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
    onError: (error) => {
      setError(error.graphQLErrors[0]?.message ?? error.message);
    },
    update: (store, response) => {
      updateCacheWith(response.data.addBook);
    },
  });
  // useEffect(() => {
  //   if (result) {
  //     console.log("result", result);
  //   }
  // }, [result]);

  const submit = (event) => {
    event.preventDefault();

    const publishedNb = parseInt(published, 10);
    if (!published || isNaN(publishedNb)) {
      setError("Publication date must be specified");
      return;
    }
    addBook({
      variables: {
        title,
        author,
        published: publishedNb,
        genres,
      },
    });

    setTitle("");
    setPublished("");
    setAuhtor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres([...genres, genre]);
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuhtor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
