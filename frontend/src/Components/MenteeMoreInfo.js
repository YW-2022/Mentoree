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
  console.log(details);
  return (
    fetch(`${API_URL}menteeTopicSetup/`, {
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

//const options = [1, 2]

export default function MentorInfo() {
  const userToken = useContext(TokenContext);
  //const [userToken, setUserToken] = useState(null);

  const [topics, setTopics] = useState([]);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [rankings, setRankings] = useState([]);
  const history = useHistory();

  const options = rankings.map((ranking) => {
    return (
      <option key={ranking} value={ranking}>
        {ranking}
      </option>
    );
  });

  const [info, setInfo] = useState({
    optionSelected: [], //for the topics
    introvert_rank: 0,
    extrovert_rank: 0,
    spontaneous_rank: 0,
    planning_rank: 0,
    motivated_rank: 0,
    material_delivery_rank: 0,
  });

  const allTopics = topics.map((topic) => {
    return {
      value: topic.id,
      label: topic.topic,
    };
  });

  //runs once before to get all the topics that can be taught/learnt
  useEffect(() => {
    setRankings([1, 2, 3, 4, 5, 6]);
    //setUserToken(localStorage.getItem("token"));
    //let userToken = localStorage.getItem("token");
    fetch(`${API_URL}menteeTopicSetup/`, {
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

  //th
  function handleChange(event) {
    setInfo({ ...info, optionSelected: event });
    console.log(info);
  }

  // old_array = [4, 5, 6];
  // new_array = [...old_array, 7, 8, 9];

  function handleChangeint(event) {
    setInfo({ ...info, introvert_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleChangeext(event) {
    setInfo({ ...info, extrovert_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleChangespont(event) {
    setInfo({ ...info, spontaneous_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleChangeplan(event) {
    setInfo({ ...info, planning_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleChangemot(event) {
    setInfo({ ...info, motivated_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleChangedel(event) {
    setInfo({ ...info, material_delivery_rank: parseInt(event.target.value) });
    console.log(info);
  }

  function handleSubmit() {
    console.log(info);
    var topics = info.optionSelected.map((t) => {
      return t.value;
    });
    const returnValue = submitPreferences(
      {
        introvert_rank: info.introvert_rank,
        extrovert_rank: info.extrovert_rank,
        spontaneous_rank: info.spontaneous_rank,
        planning_rank: info.planning_rank,
        motivated_rank: info.motivated_rank,
        material_delivery_rank: info.material_delivery_rank,
        topics: topics,
      },
      userToken
    );

    if (!returnValue) {
      //some Error has occured
      setErrorSubmitting(true);
      return; // authorisation failed
    }
    console.log("submitted");
    history.push("/menteeselectmentor");
  }
  return (
    <div>
      <InNav home={false} mymentor={true} mymentees={false} />

      <div>
        <h1 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">More Info</h1>
        <p class="mt-4 text-sm text-center leading-5 text-gray-600">
          Select the topics you would like to learn and teaching preferences so we can get to know more about you.
        </p>
      </div>

      <div className="flex justify-center mt-10">
        <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800">Topics</h1>
      </div>

      <div className="flex justify-center">
        <p className="mt-3 text-sm leading-5 text-gray-600">Pick a topic/topics that you would like to learn from our selection.</p>
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
        <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800 text-center mt-16">Teaching Preferences</h1>
      </div>

      <div className="text-center">
        <p className="text-sm leading-5 text-gray-600 mt-3">
          Order each teaching preference in order of which is most important to you in a mentor. <br></br> (<strong>1 being most important, 6 being least important)</strong>
        </p>
      </div>

      <div className="flex justify-center mt-4 mb-2">
        <div class="grid gap-x-16 gap-y-6 grid-cols-3">
          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Introverted</h3>
            </div>
            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangeint}
                  // value={}
                >
                  <option value="" disabled selected></option>
                  {options}
                </select>
              </div>
            </div>
          </div>

          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Extroverted</h3>
            </div>

            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangeext}
                >
                  <option value="" disabled selected>
                    {" "}
                  </option>
                  {options}
                </select>
              </div>
            </div>
          </div>

          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Material Delivery</h3>
            </div>
            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <label htmlFor="department" className="sr-only">
                  Current Email address
                </label>
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangedel}
                >
                  <option value="" disabled selected>
                    {" "}
                  </option>
                  {options}
                </select>
              </div>
            </div>
          </div>
          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Planning</h3>
            </div>
            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <label htmlFor="department" className="sr-only">
                  Current Email address
                </label>
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangeplan}
                >
                  <option value="" disabled selected>
                    {" "}
                  </option>
                  {options}
                </select>
              </div>
            </div>
          </div>
          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Spontaneous</h3>
            </div>

            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <label htmlFor="department" className="sr-only">
                  Current Email address
                </label>
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangespont}
                >
                  <option value="" disabled selected>
                    {" "}
                  </option>
                  {options}
                </select>
              </div>
            </div>
          </div>
          <div class="flex space-x-4 ">
            <div>
              <h3 class=" mt-4 text-center leading-5 text-gray-600">Motivated</h3>
            </div>
            <div class=" items-center  mt-2">
              <div class=" mb-6 w-3/4">
                <label htmlFor="department" className="sr-only">
                  Current Email address
                </label>
                <select
                  name="department"
                  id="department"
                  className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChangemot}
                >
                  <option value="" disabled selected>
                    {" "}
                  </option>
                  {options}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center subbutton">
        <button
          className="focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-xl font-bold  rounded text-white px-4 sm:px-10 border border-indigo-700 sm:py-4 text-sm"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      <Footer />
    </div>
  );
}
