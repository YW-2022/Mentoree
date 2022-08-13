import React, { useState, useEffect, useContext } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Popup from "reactjs-popup";
import "../css/request.css";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TokenContext } from "../Context/TokenContext";
import { API_URL } from "../constants/constants";
import { useHistory } from "react-router-dom";

function NoteForm(props) {
  const [value, setValue] = useState({ value: "" });

  const history = useHistory();

  const userToken = useContext(TokenContext);

  function handleChange(event) {
    setValue({ value: event.target.value });
  }

  async function postWorkshop(event, sD, eD) {
    event.preventDefault();

    fetch(`${API_URL}workshops/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
      body: JSON.stringify({
        time: sD,
        finish: eD,
        topic: props.workshopTopic,
        accepted: false,

      }), //message is blank because we accepted it
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`This is an HTTP error: The status is ${response.status}`);
        }
        return response.json();
      })
      .then((actualData) => {
        console.log(actualData);
        //this.history.push("/mentorstatus");
        // this.state.rerender = true;
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  const submitWorkshop = async (event) => {
    console.log(props.workshopStartTime)
    event.preventDefault();

    const sD = props.workshopStartTime;
    const eD = props.workshopEndTime;

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
    //alert("Thank you for submitting your workshop!");
    const result = await postWorkshop(event, startDateString, endDateString)
    history.push("/mymenteesstatus");
  }

  return (
    <form onSubmit={submitWorkshop}>
      <label>
        NOTES / COMMENTS
        <br />
        <textarea
          placeholder="Please leave your notes..."
          rows="4"
          required
          className="border-2 w-full h-32 border-blue-700 rounded-md pl-2"
          type="text"
          value={value.value}
          onChange={handleChange}
        />
      </label>
      <input
        className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        type="submit"
        value="Submit"
      />
    </form>
  );
}

// class NoteForm extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { value: "" };

//     this.handleChange = this.handleChange.bind(this);
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleChange(event) {
//     this.setState({ value: event.target.value });
//   }

//   async handleSubmit(event) {
//     //need to create a function to submit this.

//     //alert("Feedback was submitted: " + this.state.value);
//     // event.preventDefault();

//     // <Redirect to="/mymentees"></Redirect>;
//     // this.context.router.push("/mymentees");

//   }

// async submitWorkshopInfo(event) {
//   event.preventDefault();

//   fetch(`${API_URL}workshops/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Token ${this.props.token}`, //put the token here
//     },
//     body: JSON.stringify({
//       meeting: props.meetingObj.id,
//       accepted: false,
//       message: `Your mentor has requested for the meeting to be moved to this date ${props.startDate}; please make a new request `,
//     }), //message is blank because we accepted it
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`This is an HTTP error: The status is ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((actualData) => {
//       console.log(actualData);
//       console.log("meeting postponed");

//       history.push("/home");
//       //this.history.push("/mentorstatus");
//       // this.state.rerender = true;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// }

// render() {
//   return (
//     <form onSubmit={this.handleSubmit}>
//       <label>
//         NOTES
//         <br />
//         <textarea
//           placeholder="Please leave your comments..."
//           rows="4"
//           required
//           className="border-2 w-full h-32 border-blue-700 rounded-md "
//           type="text"
//           value={this.state.value}
//           onChange={this.handleChange}
//         />
//       </label>
//       <input
//         className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//         type="submit"
//         value="Submit"
//       />
//     </form>
//   );
// }
// }

//const localizer = momentLocalizer(moment);

export default function WorkshopPopup() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [workshopTitle, setWorkshopTitle] = useState();
  const [workshopTopic, setWorkshopTopic] = useState("");

  const [topics, setTopics] = useState();

  function handleChange1(event) {
    setWorkshopTitle(event.target.value);

    //console.log(startDate, endDate, workshopTitle, workshopTopic);
  }
  function handleChange(event) {
    // setWorkshopTopic(event.target.value);
    setWorkshopTopic(event.target.value);
  }

  const topicOptions = topics?.map((eachTopic) => {
    return (
      <option key={eachTopic.id} value={eachTopic.topic}>
        {eachTopic.topic}
      </option>
    );
  });

  const userToken = useContext(TokenContext);

  //this gets all the topics that are being taught/learnt
  useEffect(() => {
    fetch(`${API_URL}profiles/`, {
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
        console.log(actualData.mentor.mentorTopics)
        setTopics(actualData.mentor.mentorTopics); //this will be an array of objects
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <div>
      <Popup
        trigger={
          <button
            type="submit"
            className="mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Workshop
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
            <div className="header text-5xl font-bold"> New Workshop</div>

            <div className="content">
              {/* May need API call */}
              <div className="font-md text-xl mb-3 font-bold">
                WORKSHOP TITLE:
                <input type="text" className="meetingtitleline ml-3" value={workshopTitle} onChange={handleChange1} />
              </div>
              <div className="font-md text-xl mb-3 font-bold">
                WORKSHOP TOPIC:
                {/* <input type="text" className="meetingtitleline ml-3" value={workshopTopic} onChange={handleChange2} /> */}
                <select
                  name="numMentees"
                  id="numMentees"
                  className="rounded-md ml-2 w-1/1.5 px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  onChange={handleChange}
                >
                  <option value="" disabled selected>
                    Select Your Topic
                  </option>
                  {topicOptions}
                </select>
              </div>
              <div className="font-md text-xl mb-3 font-bold ">
                DATE
                <DatePicker className="border-2 border-blue-700 rounded-md" selected={startDate} onChange={(date) => setStartDate(date)} />
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
                <NoteForm
                  workshopTitle={workshopTitle}
                  workshopTopic={workshopTopic}
                  workshopStartTime={startDate}
                  workshopEndTime={endDate}
                />
              </div>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
