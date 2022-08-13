//entire file is redundant

import { useState } from "react";

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem("token");
    //const userToken = JSON.parse(tokenString);
    // return userToken;
    return tokenString;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken) => {
    localStorage.removeItem("token");
    localStorage.setItem("token", JSON.stringify(userToken));
    setToken(userToken.token);
    console.log(localStorage.getItem("token"))
  };

  const deleteToken = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return {
    setToken: saveToken,
    token,
    deleteToken,
  };
}
