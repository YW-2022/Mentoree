import React, { useState, useContext } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import Popup from "reactjs-popup";
import "../css/request.css";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useHistory } from "react-router-dom";

function NoteForm(props) {
  const [value, setValue] = useState({ value: "" });

  const history = useHistory();

  function handleChange(event) {
    setValue({ value: event.target.value });
  }

  async function postponeMeetingRequest(event) {
    event.preventDefault();

    fetch(`${API_URL}meetings/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${props.token}`, //put the token here
      },
      body: JSON.stringify({
        meeting: props.meetingObj.id,
        accepted: false,
        message: `Your mentor has requested for the meeting to be moved to this date ${props.startDate}; please make a new request `,
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
        console.log("meeting postponed");

        history.push("/home");
        //this.history.push("/mentorstatus");
        // this.state.rerender = true;
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  return (
    <form onSubmit={postponeMeetingRequest}>
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

//     //this.history = useHistory();

//     this.state = { value: "" };
//     this.handleChange = this.handleChange.bind(this);
//     //this.handleSubmit = this.handleSubmit.bind(this);
//     this.postponeMeetingRequest = this.postponeMeetingRequest.bind(this);
//   }

//   handleChange(event) {
//     this.setState({ value: event.target.value });
//   }

//   //   handleSubmit(event) {
//   //     event.preventDefault();

//   //     this.props.

//   //     //alert("Feedback was submitted: " + this.state.value);
//   //   }

//   async postponeMeetingRequest(event) {
//     event.preventDefault();

//     fetch(`${API_URL}meetings/`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Token ${this.props.token}`, //put the token here
//       },
//       body: JSON.stringify({
//         meeting: this.props.meetingObj.id,
//         accepted: false,
//         message: `Your mentor has requested for the meeting to be moved to this date ${this.props.startDate}; please make a new request `,
//       }), //message is blank because we accepted it
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`This is an HTTP error: The status is ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((actualData) => {
//         console.log(actualData);
//         console.log("meeting postponed");

//         //this.history.push("/mentorstatus");
//         // this.state.rerender = true;
//       })
//       .catch((err) => {
//         console.log(err.message);
//       });
//   }

//   render() {
//     return (
//       <form onSubmit={this.postponeMeetingRequest}>
//         <label>
//           NOTES / COMMENTS
//           <br />
//           <textarea
//             placeholder="Please leave your notes..."
//             rows="4"
//             required
//             className="border-2 w-full h-32 border-blue-700 rounded-md pl-2"
//             type="text"
//             value={this.state.value}
//             onChange={this.handleChange}
//           />
//         </label>
//         <input
//           className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           type="submit"
//           value="Submit"
//         />
//       </form>
//     );
//   }
// }

// these are the props that are passed into the component

// meetingObj={meeting} meetings={meetingrequests} setMeetingRequest={setMeetings}
export default function PostPoneMeetingRequest(props) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const userToken = useContext(TokenContext);

  return (
    <div>
      <Popup
        trigger={
          <button type="submit" className="text-white font-bold">
            Postpone Meeting
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
            <div className="header text-5xl font-bold"> Postpone the meeting</div>

            <div className="content">
              <div className="font-md text-xl mb-3 font-bold">You can postpone the meeting to the date you like</div>
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
                <NoteForm startDate={startDate} token={userToken} meetingObj={props.meetingObj} />
              </div>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
