import { API_URL } from "../constants/constants";

export default async function loginUser(credentials) {
  return (
    fetch(`${API_URL}login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      //we need to check if the user doesn't actually have an account
      .then((response) => {
        if (response.status === 400) {
          // return {"token": ""};
          throw new Error("login error - user doesn't exist");
        } else {
          return response.json(); //.json() parses the data
        }
      })
      .then((data) => data.token) //dunno if this works
      .catch((err) => {
        console.log(err);
        return ""; //login failure - token is set to a falsy value
      })
  );
}



