import React, { Children, useEffect, useContext, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Upcominglist from "./Upcominglist";
import { TokenContext } from "../Context/TokenContext";
import "../css/request.css";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import { API_URL } from "../constants/constants";

const localizer = momentLocalizer(moment);

const allViews = Object.keys(Views).map((k) => Views[k]);

const eventWrapper = ({ children }) => {
  return React.cloneElement(Children.only(children), {
    style: {
      ...children.style,
      backgroundColor: "#6366f1",
    },
    onClick: () => alert("Click agenda to see more details!"),
  });
};

// const [visibility, setVisibility] = useState(false);

// const popupCloseHandler = (e) => {
//   setVisibility(e);
// };

function dateAndTime(when) {
  //when is the string that is returned from the endpoint
  //const date = new Date(when.substring(0,10));

  //console.log(when);
  const dd = new Date(when);
  //const dd = new Date(parseInt(year), parseInt(month + 1), parseInt(day), parseInt(hour), parseInt(minute), 0, 0);
  //console.log(dd);
  return dd;
}

export default function Timetable() {
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());
  // const [comments, setComments] = useState("");
  // const [errorSubmitting, setErrorSubmitting] = useState(false); //initially, there is no error when submitting a request

  //////////////////////////////////these pieces of state are for the calendar
  const [meetings, setMeetings] = useState(null);
  const [name, setName] = useState("Absalom"); //default name - if Absalom is seen - there's been a problem somewhere

  const userToken = useContext(TokenContext);

  //const userToken = localStorage.getItem("token");

  // runs once when the component mounts -gets every meeting for a user
  useEffect(() => {
    fetch(`${API_URL}timetable/`, {
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
        //console.log(actualData)
        setMeetings(actualData);
      })
      .catch((err) => {
        console.log(err.message);
      });

    /////////////////////////////////////////////// we're doing 2 fetch requests - this one is for the name
    fetch(`${API_URL}user/`, {
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
        setName(actualData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const myEventsList = [];

  if (meetings !== null) {
    for (let meeting of meetings.timetable) {
      console.log(meeting)
      myEventsList.push({
        id: myEventsList.length,
        start: new Date(meeting.time),
        end: new Date(meeting.finish),
        title: meeting.notes ? meeting.notes : `Workshop for ${meeting.topic} with ${meeting.mentor}`,
        //title: "hi",
      });
      console.log(myEventsList)
    }
  }
  return (
    <div className="flex flex-col ml-6 mt-4 lg:flex-row">
      <div className="w-full lg:w-3/5">
        <div className="text-6xl text-indigo-500 font-bold mb-3">{`Welcome back ${name.first_name} ${name.last_name} !`}!</div>
        {/* <Link to="/mentorinfo">Send Feedback</Link> */}

        <Calendar
          className="rounded-md"
          localizer={localizer}
          views={allViews}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          showMultiDayTimes
        />
      </div>

      <div className="w-full lg:w-2/5 ml-8">
        <div className="font-bold text-3xl mt-7 text-indigo-500">Upcoming events</div>

        <div className="bg-slate-200 mt-3 upcominglist rounded-md">
          {/* <Upcominglist upcomings={meetings.nextFour}/> */}
          <Upcominglist upcomingFour={meetings?.nextFour} />
        </div>
      </div>
    </div>
  );
}
