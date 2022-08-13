import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// import App from "./Practice/App/App";
// import InNav from "./Components/InNav";
// import OutNav from "./Components/OutNav";

import reportWebVitals from "./reportWebVitals";
// import Profile from "./Components/Profile";
// import Timetable from "./Components/Timetable";
// import Upcominglist from "./Components/Upcominglist";
// import LandingPage from "./Components/LandingPage";
// import Mentorprofile from "./Components/Mentorprofile";
// import SendFeedback from "./Components/SendFeedback";
// import Settings from "./Components/Settings";
// import FeedbackSent from "./Components/FeedbackSent";

ReactDOM.render(
  <React.StrictMode>
    <App />

    {/* // <InNav />
    // <Signin />
    // <Signup />
    // <OutNav />
    // <Profile />
    // <Timetable />
    // <Upcominglist /> */}

    {/* <MeetingRequest /> */}
    {/* <EndRelationship />
    <InNav />
    <FeedbackSent />
    <SendFeedback />
    <LandingPage /> */}
    {/* <Mentorprofile /> */}

    {/* <Settings /> */}
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
