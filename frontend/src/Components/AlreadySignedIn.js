import { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { TokenContext } from "../Context/TokenContext";

//TODO: go over this again
export default function AlreadySignedIn({ children, ...rest }) {
  const token = useContext(TokenContext);

  //const token = localStorage.getItem("token");

  //localStorage.getItem("token");

  if (token !== null) {
    return <Redirect to={"/home"} />;
  }

  return <Route {...rest}>{children}</Route>;
}
