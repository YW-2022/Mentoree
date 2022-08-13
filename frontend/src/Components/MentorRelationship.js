import React, { useEffect, useState, useContext } from "react";
import Footer from "./Footer";
import InNav from "./InNav";
//import MeetingLog from "./Meetinglog";
import Popup from "reactjs-popup";
import "../css/request.css";
import Todo from "./test.js";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import MeetingLog from "./Meetinglog";

function convertDate(date) {
  var theDate = new Date(date);
  console.log(theDate);
  //console.log(formattedDate)
  return theDate.toLocaleString();
}

export default function MentorRelationship() {
  // need to do some API calls to see what the name of the mentor and get all the topics and plans of action
  const userToken = useContext(TokenContext);

  const [mentorData, setMentorData] = useState(null);
  const [workshops, setWorkshops] = useState(undefined);
  const [meetings, setMeetings] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [comments, setComments] = useState("");
  const [errorSubmitting, setErrorSubmitting] = useState(false); //initially, there is no error when submitting a request
  const [overbooked, setOverbooked] = useState(false);

  const history = useHistory();

  function handleChange(event) {
    setComments(event.target.value);
  }

  // data should have {start, finish, notes}
  const handleSubmit = async (e) => {
    e.preventDefault();

    // startDate.format("YYYY-MM-DD HH:MM:SS");

    const sD = startDate;
    const eD = endDate;

    // const startDateSting = sD.getFullYear();

    const startDateString = `${sD.getUTCFullYear()}-${(sD.getUTCMonth() + 1).toString().padStart(2, "0")}-${sD
      .getUTCDate()
      .toString()
      .padStart(2, "0")} ${sD.getUTCHours().toString().padStart(2, "0")}:${sD.getUTCMinutes().toString().padStart(2, "0")}:${sD
      .getUTCSeconds()
      .toString()
      .padStart(2, "0")}`;

    const endDateString = `${sD.getUTCFullYear()}-${(sD.getUTCMonth() + 1).toString().padStart(2, "0")}-${sD
      .getUTCDate()
      .toString()
      .padStart(2, "0")} ${eD.getUTCHours().toString().padStart(2, "0")}:${eD.getUTCMinutes().toString().padStart(2, "0")}:${eD
      .getUTCSeconds()
      .toString()
      .padStart(2, "0")}`;

    const returnValue = await requestMeeting({ start: startDateString, finish: endDateString, notes: comments }, userToken);

    if (!returnValue) {
      //some Error has occured
      setErrorSubmitting(true);
      return; // authorisation failed
    }
    console.log("submitted");
    history.push("/mymentorstatus");
  };

  async function requestMeeting(timings, userToken) {
    return (
      fetch(`${API_URL}bookMeeting/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${userToken}`, //put the token here
        },
        body: JSON.stringify(timings),
      })
        //we need to check if the user doesn't actually have an account
        .then((response) => {
          if (response.status === 400) {
            //bad response - means an error has occurred
            throw new Error("You can not book a meeting now, as you have another booking at this time");
          } else {
            return true; //request has been submitted
          }
        })
        .catch((err) => {
          console.log(err);
          return false;
        })
    );
  }

  async function endrelationship() {
    return (
      fetch(`${API_URL}myMentor/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${userToken}`,
        },
      })
        //we need to check if the user doesn't actually have an account
        .then((response) => {
          if (response.status === 400) {
            //bad response - means an error has occurred
            throw new Error("There's been a error with submitting this request");
          } else {
            history.push("/mymentorstatus");
            return true; //request has been submitted
          }
        })
        .catch((err) => {
          console.log(err);
          return false; //login failure - token is set to a falsy value
        })
    );
  }

  async function joinWorkshop(id) {
    return (
      fetch(`${API_URL}workshops/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${userToken}`,
        },
        body: JSON.stringify({ workshop: id }),
      })
        //we need to check if the user doesn't actually have an account
        .then((response) => {
          if (response.status === 400) {
            //bad response - means an error has occurred
            setOverbooked(true);
            throw new Error("There's been a error with submitting this request");
          } else {
            setOverbooked(false);
            history.push("/mymentorstatus");
            return true; //request has been submitted
          }
        })
        .catch((err) => {
          console.log(err);
          return false; //login failure - token is set to a falsy value
        })
    );
  }

  useEffect(() => {
    fetch(`${API_URL}myMentor/`, {
      method: "GET", // for getting data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json(); //gets the data from the response object
      })
      .then((actualData) => {
        //gets passed the data
        setMentorData(actualData); //mentorData is populated with all the info from the backend
        const meetingData = actualData.meetings.map((m) => {
          let s = new Date(m.start).toLocaleString("en-GB");
          let f = new Date(m.finish).toLocaleString("en-GB");
          return { id: m.id, start: s, finish: f, notes: m.notes, feedback: m.feedback };
        });
        setMeetings(meetingData);
      })
      .catch((err) => {
        console.log(err.message);
      });
    ///////////////////////////////////////// workshops are just an array
    fetch(`${API_URL}workshops/`, {
      method: "GET", // for getting data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json(); //gets the data from the response object
      })
      .then((actualData) => {
        //gets passed the data

        setWorkshops(actualData); //mentorData is populated with all the info from the backend
        console.log(actualData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const allTopics = mentorData?.topics.map((eachTopic) => {
    return (
      <div key={eachTopic.topic} className="text-gray-700 font-bold">
        {eachTopic.topic}
      </div>
    );
  });

  // function populateMeetingLog() {}

  // let suggestedWorkshops = workshops?.map((wS) => {
  //   return (
  //     <div key={wS.id} className="text-indigo-400 font-bold">
  //       Workshop hosted by {wS.mentor} starting at {wS.start} and ending at {wS.finish}.<div>The topic is: {wS.topic}</div>
  //     </div>
  //   );
  // });

  const suggestedWorkshops = workshops?.map((wS) => {
    return (
      <div key={wS.id} className="ml-1 mr-1 mt-2 mb-2 border-2 rounded-md pl-2 pr-2 flex flex-row">
        <p className="text-white text-lg font-semibold mt-2 bg-indigo-400 pl-2 rounded-md w-2/3">
          Host: {wS.mentor} &nbsp;
          <br />
          Start: {convertDate(wS.start)}
          <br />
          Topic: {wS.topic}
        </p>
        <div className="flex flex-col ml-1 mr-1 mt-2 pl-2 pr-2 w-1/3">
          <button onClick={() => joinWorkshop(wS.id)} className="bg-green-500 text-white font-bold rounded-xl h-12">
            Accept
          </button>
        </div>
      </div>
    );
  });

  return (
    <div>
      <InNav home={false} mymentor={true} mymentees={false} />
      <div className="ml-28 text-6xl text-indigo-500 font-bold mb-3 mt-4">My Mentor</div>
      <div className="flex flex-col mt-4 lg:flex-row">
        <div className="w-full lg:w-3/5 ml-28">
          <div className="flex flex-col lg:flex-col">
            <div className="flex flex-col mt-4 lg:flex-row">
              <div className="w-full lg:w-2/5 bg-gray-300 proimg">{/* profile img */}</div>
              <div className="w-full lg:w-3/5 ml-8">
                <div className="mb-2 text-4xl font-bold">{mentorData ? mentorData.mentor.mentor : "Loading mentor"}</div>
                <div className="text-gray-500">{mentorData ? mentorData.mentor.email : "Loading email address"}</div>
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
            <div className="w-full mt-2 font-bold text-xl text-indigo-500">
              Topics you want to learn from {mentorData ? mentorData.mentor.mentor : "Loading mentor"}
            </div>

            <div className="bg-gray-200 topicbox mt-1">
              <div className="text-gray-700 rounded-md mt-2 ml-4 mr-4 font-bold text-2xl w-full pl-2 pt-2">{allTopics}</div>
            </div>

            <div className="flex flex-row lg:flex-row mr-24 poatitle">
              <div className="w-full lg:w-5/6 mt-6 font-bold text-xl text-indigo-500">Plan of Action</div>
            </div>
            <div className="bg-gray-200 poabox mt-1 text-gray-700">
              <Todo goals={[]} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/5">
          <div className="flex flex-col lg:flex-col">
            <div className="flex flex-row lg:flex-row mr-10">
              {/* <div className="w-full lg:w-1/2 mt-6 font-bold text-xl text-indigo-500">Meeting Log</div> */}
            </div>
          </div>

          <div className="meetinglog bg-gray-200 mb-1">
            <MeetingLog meetings={meetings} mentee={true} mentor={false}/>
            {/* RENDER ALL THE MEETINGS HERE - ALSO VIEW THE FEEDBACK TOO*/}
          </div>
          <Popup
            trigger={
              <button
                type="submit"
                className="lg:w-11/12 mt-2 h-10 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Request Meeting
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
                <div className="header text-5xl font-bold"> New Meeting Request </div>
                {errorSubmitting && (
                  <p className="text-red-600 border-2 border-rose-500">
                    You can not book a meeting at this time, as you have another booking at this time
                  </p>
                )}
                <div className="content">
                  <div className="font-md text-xl mb-3 font-bold">A NEW MEETING</div>
                  <div className="font-md text-xl mb-3 font-bold ">
                    DATE
                    <DatePicker
                      className="border-2 border-blue-700 rounded-md"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                    />
                  </div>
                  <div className="text-xl mb-3">
                    <span className="font-bold">TIME</span>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="border-2 rounded-md border-blue-700"
                    />
                    ---
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Time"
                      dateFormat="h:mm aa"
                      className="border-2 rounded-md border-blue-700"
                    />
                  </div>
                  <div className="font-md text-xl mb-3 font-bold">
                    <label>
                      COMMENTS
                      <br />
                      <textarea
                        placeholder="Please leave your comments..."
                        rows="4"
                        id="commentsBox"
                        required
                        className="border-2 w-full h-32 border-blue-700 rounded-md "
                        type="text"
                        // value={this.state.value}
                        onChange={handleChange}
                      />
                    </label>
                    <input
                      className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      type="submit"
                      value="Submit"
                      onClick={handleSubmit}
                    />
                  </div>
                </div>
              </div>
            )}
          </Popup>

          <div className="mt-10 font-bold text-xl text-indigo-500 mb-2">Upcoming Suggested Workshops</div>
          <div className="bg-gray-200 meetinglog mt-1">{overbooked && (<p className="text-red-600 border-2 border-rose-500">You can not accept that meeting, as you have a booking at that time already</p>)}{suggestedWorkshops}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
