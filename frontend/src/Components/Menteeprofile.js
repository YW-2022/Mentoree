import React, { Children, useEffect, useContext, useState } from "react";
import ProfileCard1 from "./ProfileCard1";
import InNav from "./InNav";
import Footer from "./Footer";
import { TokenContext } from "../Context/TokenContext";
import { API_URL } from "../constants/constants";
import { format } from "date-fns";
import WorkshopPopup from "./WorkshopPopup";
import PostPoneMeetingRequest from "./PostponeMeetingRequest";


function convertDate(date) {
  console.log(date)
  var theDate = new Date(date);
  console.log(theDate);
  //console.log(formattedDate)
  return theDate.toLocaleString("en-GB");
}

//shows you all the mentees
function Menteeprofile(item) {
  const [mentees, setMentees] = useState([]);
  const [meetingrequests, setMeetings] = useState([]);
  const [suggWorkshops, setWorkshops] = useState([]);
  const [errorSubmitting, setErrorSubmitting] = useState("");
  const [overbooked, setOverbooked] = useState(false);

  const userToken = useContext(TokenContext);

  useEffect(() => {
    fetch(`${API_URL}myMentees/`, {
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
        console.log(actualData);
        setMentees(actualData.mentees);
        setMeetings(actualData.meeting_requests);
        setWorkshops(actualData.suggested_topics);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const cards = mentees.map((mentee) => {
    return (
      <ProfileCard1
        id={mentee.id}
        name={mentee.mentee}
        email={mentee.email}
        //img={item.coverImg}
        department={mentee.business}
        //topic={item.topic}
        //rating={item.stats.rating}
        //reviewCount={item.stats.reviewCount}
      />
    );
  });

  //accepting a meeting request - remove it from the state - not shown anymore on the screen
  async function acceptMeetingRequest(meetingObj) {
    console.log(meetingObj);

    //{id: 2, mentee: 'v v', time: '2022-03-10T19:27:16Z', finish: '2022-03-10T19:37:19Z', notes: 'nlkdsjfa;jfk'}
    fetch(`${API_URL}meetings/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
      body: JSON.stringify({ meeting: meetingObj.id, accepted: true }), //message is blank because we accepted it
    })
      .then((response) => {
        if (!response.ok) {
          setOverbooked(true);
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json();
      })
      .then((actualData) => {
        console.log(actualData);
        console.log("meeting accepted");
        setOverbooked(false);

        const updatedMeetingRequests = [];

        for (let mR of meetingrequests) {
          if (mR.id !== meetingObj.id) {
            updatedMeetingRequests.push(meetingObj);
          }
        }
        //now we need to remove that meeting from the state
        setMeetings(updatedMeetingRequests);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  const meetings = meetingrequests.map((meeting) => {
    return (
      <div className="ml-1 mr-1 mt-2 mb-2 border-2 rounded-md pl-2 pr-2 flex flex-row">
        <p className="text-white text-lg font-semibold mt-2 bg-indigo-400 pl-2 rounded-md w-2/3">
          Meeting with {meeting.mentee} &nbsp;
          <br />
          Requested for {convertDate(meeting.time)}
          &nbsp; and to finish at {convertDate(meeting.finish)}. &nbsp;
          <br />
          Notes: {meeting.notes}
        </p>
        <div className="flex flex-col ml-1 mr-1 mt-2 pl-2 pr-2 w-1/3">
          <button onClick={() => acceptMeetingRequest(meeting)} className="bg-green-500 text-white font-bold rounded-xl h-12">
            Accept
          </button>
          {/* add the popup for postponing a meeting request*/}
          <button className="bg-rose-600 text-white font-bold rounded-xl mt-4 h-12">
            <PostPoneMeetingRequest meetingObj={meeting} meetings={meetingrequests} setMeetingRequest={setMeetings} />
          </button>
        </div>
      </div>
    );
  });

  const workshopTopics = suggWorkshops.map((workTopic) => {
    return <p>{workTopic.topic_name}</p>;
  });

  return (
    <div>
      <InNav home={false} mymentor={false} mymentees={true} />
      <div className="container flex justify-center mx-auto pt-10">
        <div>
          <h1 className="xl:text-6xl text-6xl text-center font-extrabold pb-3 mx-auto text-indigo-500">My Mentees</h1>
        </div>
      </div>
      <section className="cards-list1">{cards}</section>
      {/* <div className="workshop">
        <div className="font-bold text-xl text-indigo-500 flex justify-center mt-6 mb-2">Suggested Workshop Topics</div>
      </div> */}
      <div className="flex flex-col lg:flex-row mt-8">
        <div className="w-full lg:w-1/2 ml-24 mr-4">
          <div className="font-bold text-2xl workshop text-indigo-600">Suggested Workshop Topics</div>
          <div className="bg-gray-200 topicbox mt-1">
            <div className="text-gray-700 rounded-md mt-2 ml-4 mr-4 font-bold text-2xl w-2/3 pt-6 pl-3">{workshopTopics}</div>
          </div>
          <WorkshopPopup /> {/* might need to style this further down the line*/}
        </div>

        <div className="w-full lg:w-1/2 mr-20">
          <div className="font-bold text-2xl meetingrequest text-indigo-600">Meeting Requests</div>
          <div className="mt-4 meetingrequestbox bg-gray-200 rounded">{overbooked && (<p className="text-red-600 border-2 border-rose-500">You can not accept that meeting, as you have a booking at that time already</p>)}
          {meetings}</div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Menteeprofile;
