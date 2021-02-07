import React, { useState, useEffect } from "react";
import { ALL_BOOKS, ME } from "../queries";
import { useQuery } from "@apollo/client";

const Recommendations = () => {
  const meResult = useQuery(ME);

  const booksQuerySkip = meResult?.data?.me?.favoriteGenre === undefined;
  const booksQueryVariables = { genre: meResult?.data?.me?.favoriteGenre };
  const booksResult = useQuery(ALL_BOOKS, {
    skip: booksQuerySkip,
    variables: booksQueryVariables,
    fetchPolicy: "network-only",
  });
  // const [getBooks, booksResult] = useLazyQuery(ALL_BOOKS);
  // useEffect(() => {
  //   if (meResult?.data?.me?.favoriteGenre) {
  //     getBooks({
  //       variables: { genre: meResult.data.me.favoriteGenre },
  //     });
  //   }
  // }, [meResult, getBooks]);

  if (booksResult?.data?.allBooks === undefined) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      in genre <b>{meResult.data.me.favoriteGenre}</b>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksResult.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
