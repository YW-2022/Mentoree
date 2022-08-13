import { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { TokenContext } from "../Context/TokenContext";

//TODO: go over this again
export default function AuthorizeRoute({ children, ...rest }) {
  const token = useContext(TokenContext);

  //const token = localStorage.getItem("token");

  //localStorage.getItem("token");

  //

  if (token == null) {
    return <Redirect to={"/signin"} />;
  }

  return <Route {...rest}>{children}</Route>;
}
