import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import "../css/request.css";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";

export default function MyMentor() {
  const [status, setStatus] = useState(0); //by default it will be 0 and will change when the API request comes back with a result
  const userToken = useContext(TokenContext);

  const history = useHistory();
  //const userToken = localStorage.getItem("token");

  //run once when the component is mounted onto the screen to get the status of being a mentee
  useEffect(() => {
    //runs once before to get all the topics that can be taught/learnt
    fetch(`${API_URL}menteeStatus/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
      .then((response) => {
        console.log(response.ok);
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json();
      })
      .then((actualData) => {
        if (actualData.status == 0) {
          console.log("selecting topics");
          history.push("/menteeselecttopics");
        }

        // means the mentee needs to choose a mentor
        else if (actualData.status == 1) {
          console.log("selecting topics");
          history.push("/menteeselectmentor");
        }

        //means the mentee has a mentor
        else {
          console.log("selecting topics");
          history.push("/mymentor");
        }
        setStatus(actualData.status);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  // means the mentee needs to select their topics
  return null; //because React functional components need to return something
}
