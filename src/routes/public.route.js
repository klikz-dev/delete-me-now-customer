import React from "react";
import { Route, Redirect } from "react-router-dom";

function PublicRoute({ component: Component, path, ...rest }) {
  if (path === "/login") {
    return (
      <Route
        {...rest}
        render={(props) =>
          !rest.isAuthenticated ? (
            <Component {...props} />
          ) : (
            <Redirect to={{ pathname: "/" }} />
          )
        }
      />
    );
  } else {
    return <Route {...rest} render={(props) => <Component {...props} />} />;
  }
}

export default PublicRoute;
