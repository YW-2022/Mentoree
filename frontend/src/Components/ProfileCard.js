import React, { Children, useEffect, useContext, useState } from "react";
import star from "../img/star.png";
import { Link, useHistory } from "react-router-dom";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";

export default function ProfileCard(props) {
  const [submitError, setSubmitError] = useState(false);
  const userToken = useContext(TokenContext)
  const history = useHistory()

  async function registerUser(id) {
    return fetch(`${API_URL}menteeMentorSelection/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
      body: JSON.stringify({"mentor":id}),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`This is an HTTP error: The status is ${response.status}`);
      }
      return response.json();
    })
    .then((actualData) => {
      console.log(actualData)
      return true;
    })
    .catch((err) => {
      console.log(err.message);
    });
  }

  const handleSubmit = async (e) => {
    console.log("selected")
    e.preventDefault()
    
    const submitSuccess = await registerUser(props.id)
    if (submitSuccess){
        console.log(submitSuccess)
        history.push("/mymentor")
    }
    return true;
  }


  return (
    <div>
      <div className="card1">
          <div className="menteephoto"></div>
          <div className="text-2xl text-center font-bold mt-4">{props.name}</div>
          <p className="text-gray-800 text-md text-center">
                      {props.email}
          </p>
          <p className="text-left text-gray-800 text-xl pt-3 font-normal">
                      <span className="font-bold ml-2">Department: </span>{props.department}
                      <br />
                      {/* <span className="font-bold ml-2">Topics: </span>
                      <span> {props.topics} </span> */}
                      <div className="card--stats ml-2">
                          <span className="font-bold">Rating: </span> 
                          &nbsp; 
                          <img src={star} className="card--star" />
                          &nbsp; 
                          <span>{props.rating}</span>
                      </div>  
          </p>

          <button className="w-full flex justify-center mt-4 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 rounded text-white font-bold px-2 py-2 text-md" onClick={handleSubmit}>
                      Select
          </button>
      </div>
    </div>
  );
}
