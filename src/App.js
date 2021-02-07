import React, { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import { useApolloClient, useSubscription } from "@apollo/client";
import Recommendations from "./components/Recommendations";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

// make useSwitchRouter hook taking all ppages (path, props, protected or not?) returns methods to switch or even buttons, and renderComponent
// const useSwitchRouter = ({ path, props }) => {
const router = ({ path, props }) => {
  // const [routes, setRoutes] = useState(null);

  // window.history.pushState({}, null, path);
  // const endOfPathIndex = window.location.pathname.lastIndexOf("/");
  // const pathToRender = path.substring(endOfPathIndex, path.length);
  // console.log(pathToRender);
  // let routeToRender = routes.find((route) => {
  //   if (route.path === pathToRender && route.component) {
  //     return <route.component {...props} />;
  //   }
  //   return "404 Not Found";
  // });
  switch (path) {
    case "authors":
      return <Authors {...props} />;
    case "books":
      return <Books {...props} />;
    case "add":
      return <NewBook {...props} />;
    case "login":
      return <LoginForm {...props} />;
    case "recommended":
      return <Recommendations {...props} />;
    default:
      return "404 Not Found";
  }
  // return {
  //   setRoutes,
  //   routeToRender,
  // };
};

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
    if (message === "not authenticated") {
      logout();
    }
  };
  const [token, setToken] = useState(null);
  const [page, setPage] = useState({});
  // const { setRoutes } = useSwitchRouter();
  // const routes = [
  //   { path: "authors", component: Authors, props: {} },
  //   { path: "books", component: Books, props: {} },
  //   { path: "books", component: Books, props: {} },
  //   { path: "add", component: Books, props: {} },
  //   { path: "recommended", component: Books, props: {} },
  //   { path: "recommended", component: <LoginForm setToken={setToken} setError={notify} redirect={()=> setPage({ path: "recommended", component: Books, props: {} })} />}
  // ];
  // setRoutes(routes);
  const client = useApolloClient();
  useEffect(() => {
    const token = localStorage.getItem("graphql-library-app");
    if (token) {
      setToken(token);
    }
    setPage({
      path: "books",
      props: {},
    });
  }, []);

  const updateCacheWith = (bookAdded) => {
    const includedIn = (set, object) =>
      set.map((p) => p.id).includes(object.id);

    const dataInStore = client.readQuery({ query: ALL_BOOKS });
    if (!includedIn(dataInStore.allBooks, bookAdded)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(bookAdded) },
      });
    }
  };

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData);
      const bookAdded = subscriptionData.data.bookAdded;
      notify(`${bookAdded.title} added`);
      updateCacheWith(bookAdded);
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();

    setPage({
      path: "login",
      props: {
        setToken,
        setError: notify,
        redirectTo: redirectWith(),
      },
    });
  };

  const redirectWith = (props) => (path) => setPage({ path, props });

  return (
    <div>
      <div>
        <button
          onClick={() =>
            setPage({
              path: "authors",
              props: { token, setError: notify },
            })
          }
        >
          authors
        </button>
        <button onClick={() => setPage({ path: "books", props: {} })}>
          books
        </button>
        {token ? (
          <>
            <button
              onClick={() =>
                setPage({
                  path: "add",
                  props: { setError: notify, updateCacheWith },
                })
              }
            >
              add book
            </button>
            <button onClick={() => setPage({ path: "recommended", props: {} })}>
              recommended
            </button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                setPage({
                  path: "login",
                  props: {
                    setToken,
                    setError: notify,
                    redirectTo: redirectWith(),
                  },
                })
              }
            >
              login
            </button>
          </>
        )}
      </div>
      <Notify errorMessage={errorMessage} />
      {router(page)}
    </div>
  );
};

export default App;
