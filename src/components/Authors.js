import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "./../queries";

const EditAuthor = ({ authors, setError }) => {
  const [birthYear, setBirthYear] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(
    authors[0]?.name ? authors[0].name : ""
  );
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  const submit = (event) => {
    event.preventDefault();
    if (!birthYear) return;
    const birthYearNb = parseInt(birthYear, 10);
    if (isNaN(birthYearNb)) {
      setError("The birth year needs to be a number");
      return;
    }
    editAuthor({
      variables: {
        name: selectedAuthor,
        setBornTo: parseInt(birthYearNb, 10),
      },
    });
    setBirthYear("");
  };
  return (
    <div>
      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            name
            <select
              value={selectedAuthor}
              onChange={({ target }) => setSelectedAuthor(target.value)}
            >
              {authors.map((author) => (
                <option key={author.name} value={author.name}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            born
            <input
              value={birthYear}
              onChange={({ target }) => setBirthYear(target.value)}
            />
          </label>
        </div>
        <div>
          <button type="submit">update author</button>
        </div>
      </form>
    </div>
  );
};

const Authors = ({ token, setError }) => {
  const result = useQuery(ALL_AUTHORS);
  if (result.loading) {
    return <div>loading...</div>;
  }
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && <EditAuthor authors={authors} setError={setError} />}
    </div>
  );
};

export default Authors;
