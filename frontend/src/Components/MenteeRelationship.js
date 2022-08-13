import React, { useEffect, useContext, useState } from "react";
import Footer from "./Footer";
import InNav from "./InNav";
import Popup from "reactjs-popup";
import "../css/request.css";
import { useHistory } from "react-router-dom";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import Todo from "./test.js";
import MeetingLog from "./Meetinglog";

export default function MyMentee() {
  const path = window.location.pathname.split("/");
  const id = parseInt(path[path.length - 1]);

  const [meetings, setMeetings] = useState([]);
  const [topics, setTopics] = useState([]);
  const [goals, setGoals] = useState([]);
  const [mentee, setMentee] = useState("");
  const [email, setEmail] = useState("");

  const history = useHistory();

  const userToken = useContext(TokenContext);

  //console.log(id);

  useEffect(() => {
    fetch(`${API_URL}myMentee/?mentee=${id}`, {
      method: "GET", // for getting data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
      .then((response) => {
        console.log("hello")
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json(); //gets the data from the response object
      })
      .then((actualData) => {
        console.log(meetings)
        const meetingData = actualData.meetings.map((m) => {
            let s = new Date(m.start).toLocaleString("en-GB");
            let f = new Date(m.finish).toLocaleString("en-GB");
            return { id: m.id, start: s, finish: f, notes: m.notes, feedback: m.feedback };
        });
        console.log(meetingData)
        setMeetings(meetingData);
        const gs = actualData.goals.not_completed.map((g) => {
          return g.goal;
        });

        const allGoals = [];
        for (let goal of gs) {
          allGoals.push({
            label: goal,
            id: allGoals.length + 1,
            done: false,
            important: false,
          });
        }
        console.log(allGoals);
        setGoals(JSON.parse(JSON.stringify(allGoals)));

        // console.log(goals);

        const ts = actualData.topics.map((t) => {
          return t.topic;
        });
        setTopics(ts);
        setMentee(actualData.mentor.mentee);
        setEmail(actualData.mentor.email);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  // useEffect(() => {
  //   console.log(goals);
  // }, [goals]);

  //TODO - mentor wants to end the relationship with a mentee
  async function endrelationship() {
    return (
      fetch(`${API_URL}myMentee/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${userToken}`, //put the token here
        },
        body: JSON.stringify({ mentee: id }),
      })
        //we need to check if the user doesn't actually have an account
        .then((response) => {
          if (response.status === 400) {
            //bad response - means an error has occurred
            throw new Error("There's been a error with submitting this request");
          } else {
            history.push("/home");
            return true; //request has been submitted
          }
        })
        .catch((err) => {
          console.log(err);
          return false; //login failure - token is set to a falsy value
        })
    );
  }

  const allTopics = topics?.map((eachTopic) => {
    return (
      <div key={eachTopic} className="text-gray-700 font-bold">
        {eachTopic}
      </div>
    );
  });

  return (
    <div>
      <InNav home={false} mymentor={false} mymentees={true} />

      <div className="ml-28 text-6xl text-indigo-500 font-bold mb-3 mt-4">My Mentee</div>

      <div className="flex flex-col mt-4 lg:flex-row">
        <div className="w-full lg:w-3/5 ml-28">
          <div className="flex flex-col lg:flex-col">
            <div className="flex flex-col mt-4 lg:flex-row">
              <div className="w-full lg:w-2/5 bg-gray-300 proimg">{/* profile img */}</div>
              <div className="w-full lg:w-3/5 ml-8">
                <div className="mb-2 text-4xl font-bold">{mentee ? mentee : "Loading name"}</div>
                <div className="text-gray-500">{email ? email : "Loading email address"}</div>
                {/* <div className="mt-4 endrs font-bold text-white">
                                    <div className="text-center pt-1.5 text-lg">End Mentor Relationship</div>
                                </div> */}
                <Popup
                  trigger={
                    <button
                      type="submit"
                      className="mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      End Relationship
                    </button>
                  }
                  modal
                  nested
                >
                  {(close) => (
                    <div className="modal">
                      <button className="close" onClick={close}>
                        &times;
                      </button>

                      <div className="content1 text-4xl font-bold text-center mt-9 mb-9 mr-2 ml-2">
                        <br></br>
                        Are You Sure <br></br>
                        You Want to End This <br></br>
                        Relationship? <br></br>
                        <br></br>
                        <button
                          type="submit"
                          className="group relative w-1/3 mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={endrelationship}
                        >
                          Yes
                        </button>
                        <button className="group relative w-1/5"> </button>
                        <button
                          type="submit"
                          className="group relative w-1/3 mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grey-500"
                          onClick={close}
                        >
                          No
                        </button>
                        <br></br>
                        <br></br>
                      </div>
                    </div>
                  )}
                </Popup>
              </div>
            </div>

            <div className="w-full mt-2 font-bold text-xl text-indigo-500">Topics you are teaching {mentee}</div>

            <div className="bg-gray-300 topicbox mt-1">
              <div className="text-gray-700 rounded-md mt-2 ml-4 mr-4 font-bold text-2xl w-full pl-2 pt-2">{allTopics}</div>
            </div>

            <div className="flex flex-row lg:flex-row mr-24">
              <div className="w-full lg:w-5/6 mt-6 font-bold text-xl text-indigo-500">Plan of Action</div>
            </div>

            <div className="bg-gray-300 poabox mt-1">
              <Todo goals={goals} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="flex flex-col lg:flex-col">
            <div className="flex flex-row lg:flex-row mr-24">
              <div className="w-full lg:w-3/7 mt-6 font-bold text-xl text-indigo-500 ">Meeting Log</div>
            </div>
          </div>

          <div className="bg-gray-300 meetinglog mt-1">
          <MeetingLog meetings={meetings} mentee={false} mentor={true}/>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
