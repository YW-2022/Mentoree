import React, { useState, useEffect, useContext } from "react";
// import { colourOptions } from "./data.js";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import InNav from "./InNav.js";
import Footer from "./Footer.js";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import { useHistory } from "react-router-dom";

async function submitPreferences(details, userToken) {
  console.log(details)
  return (
    fetch(`${API_URL}mentorTopicSetup/`, {
      //should be changed
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
      body: JSON.stringify(details),
    })
      //we need to check if the user doesn't actually have an account
      .then((response) => {
        if (response.status === 400) {
          // return {"token": ""};
          throw new Error("error submitting your preferences");
        } else {
          return true; //data has been submitted successfully
        }
      })
      .catch((err) => {
        console.log(err);
        return false; //details have not been submitted successfully
      })
  );
}

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} />
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

export default function MentorInfo() {
  const userToken = useContext(TokenContext);

  //const [userToken, setUserToken] = useState(null);

  const [topics, setTopics] = useState([]);
  const [errorSubmitting, setErrorSubmitting] = useState(false);

  const history = useHistory()

  const [info, setInfo] = useState({
    optionSelected: [], //for the topics
    numMentees: 0, // for the number of mentees
  });

  // [{id: 1, topic: "React"}, {id: 2, topic: "CSS"}, {id: 3, topic: "Django"}, {id: 4, topic: "Trading"},…]
  // 0: {id: 1, topic: "React"}
  // 1: {id: 2, topic: "CSS"}
  // 2: {id: 3, topic: "Django"}
  // 3: {id: 4, topic: "Trading"}
  // 4: {id: 5, topic: "algorithms"}
  // 5: {id: 6, topic: "Ancient History"}

  const allTopics = topics.map((topic) => {
    return {
      value: topic.id,
      label: topic.topic,
    };
  });

  // [
  //     { value: "maths", label: "Mathematics" },
  //     { value: "economics", label: "Economics" },
  //     { value: "physics", label: "Physics" },
  //     { value: "english", label: "English" },
  //     { value: "french", label: "French" },
  //     { value: "history", label: "History" },
  //     { value: "classics", label: "Classics" },
  //     { value: "art history", label: "Art History" },
  //     { value: "business management", label: "Business Management" },
  //     { value: "physical education", label: "Physical Education" }
  // ];

  // const topicOptions = topics.map(topic => {
  //     return <option name={topic.name} value={topic.name} key={topic.id}>{topic.name}</option>
  // })

  //runs once before to get all the topics that can be taught/learnt
  useEffect(() => {
    //setUserToken(localStorage.getItem("token"));
    //let userToken = localStorage.getItem("token");
    fetch(`${API_URL}mentorTopicSetup/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json();
      })
      .then((actualData) => {
        setTopics(actualData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  function handleChange(event) {
    setInfo({...info, optionSelected:event})
    console.log(info)
  }

  function handleChangeNumber(event){
    setInfo({...info, numMentees:parseInt(event.target.value)})
    console.log(info)
  }

  function handleSubmit() {
    console.log(info)
    var topics = info.optionSelected.map((t) => {
        return t.value
    })
    const returnValue = submitPreferences({ capacity: info.numMentees, topics: topics }, userToken);

    if (!returnValue) {
      //some Error has occured
      setErrorSubmitting(true);
      return; // authorisation failed
    }
    console.log("submitted");
    history.push("/mymenteesstatus")
  }

  return (
    <div>
      <InNav home={false} mymentor={false} mymentees={true} />

      <div>
        <h1 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">More Info</h1>
        <p className="mt-4 text-sm text-center leading-5 text-gray-600">
          Select the topics you would like to teach and preferences so we can get to know more about you.
        </p>
      </div>

      <div className="flex justify-center mt-10">
        <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800">Topics</h1>
      </div>

      <div className="flex justify-center">
        <p className="mt-3 text-sm leading-5 text-gray-600">
          Pick a topic/topics that you have experience in and are interested in teaching from our selection
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <span className="d-inline-block w-1/2" data-toggle="popover" data-trigger="focus" data-content="Please selecet account(s)">
          <ReactSelect
            options={allTopics}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{
              Option,
            }}
            onChange={handleChange}
            allowSelectAll={true}
            value={info.optionSelected}
          />
        </span>
      </div>

      <div className="mt-16 flex flex-col justify-start border-t border-gray-200">
        <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800 text-center mt-16">Number Of Mentees</h1>
      </div>

      <div className="text-center">
        <p className="text-sm leading-5 text-gray-600 mt-3">
          Specify the number of mentees that you are willing to undertake. <br />
          Please ensure that you will always be able to dedicate time to this number of mentees. <br />
          This number can be changed at any time.
        </p>
      </div>

      <form className="flex justify-center mt-4" onSubmit={handleSubmit}>
        <select
          name="numMentees"
          id="numMentees"
          className="rounded-md w-1/1.5 px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
          required
          onChange={handleChangeNumber}
          value={info.numMentees}
        >
          <option value="" disabled selected>
            Select Your Preferred Number
          </option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select>
      </form>
      <div className="flex justify-center">
        <button className="m-2 p-3 focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-md font-bold  rounded text-white border border-indigo-700 w-1/1.5" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <Footer />
    </div>
  );
}
