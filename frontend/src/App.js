import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import React from "react";
import LandingPage from "./Components/LandingPage";
import SendFeedback from "./Components/SendFeedback";
import Signin from "./Components/Signin";
import Signup from "./Components/Signup";
import Mentorprofile from "./Components/Mentorprofile";
import Menteeprofile from "./Components/Menteeprofile";
import FeedbackSent from "./Components/FeedbackSent";
import EndRelationship from "./Components/EndRelationship";
import NotFound from "./Components/NotFound";
import InNav from "./Components/InNav";
import MeetingRequest from "./Components/MeetingRequest";
import Home from "./Components/Home";
import EndRelationshipPopup from "./Components/EndRelationshipPopup";
import FeedbackPopup from "./Components/FeedbackPopup";
import WorkshopPopup from "./Components/WorkshopPopup";
import AuthorizeRoute from "./Components/AuthorizeRoute";
import OutNav from "./Components/OutNav";
import { TokenContext } from "./Context/TokenContext";
import MenteeMoreInfo from "./Components/MenteeMoreInfo";
import MentorMoreInfo from "./Components/MentorMoreInfo";
import Settings from "./Components/Settings";
import MyMentor from "./Components/MyMentor";
import { Notifications } from "./Components/Notifications";
import MyMentee from "./Components/MyMentee";
import Footer from "./Components/Footer";
import MentorInfo from "./Components/MentorInfo";
import MenteeInfo from "./Components/MenteeMoreInfo";
import MenteeRelation from "./Components/MenteeRelationship";
import Test from "./Components/test";

import AlreadySignedIn from "./Components/AlreadySignedIn";
import useToken from "./Components/useToken";
import MentorRelationship from "./Components/MentorRelationship";
import MenteeRelationship from "./Components/MenteeRelationship";
import FeedbackPopup1 from "./Components/FeedbackPopup1";

export default function App() {
  //const { token, setToken } = useToken();

  const [token, setToken] = React.useState(null);

  //console.log(token)
  //console.log(setToken)

  // if (!token) {
  //   return <Signin setToken={setToken} />;
  // }

  //with the token context, every child component using useContext has access to the token in App.js
  //without the token context, they would default to the default value which is null - can't change it.

  return (
    <Router>
      <div className="content">
        <TokenContext.Provider value={token}>
          {/*curent state of the token context, given to all child components*/}
          <Switch>
            <Route exact path="/">
              <LandingPage />
            </Route>

            <Route path="/todolist">
              <Test />
            </Route>

            <Route path="/FeedbackPopup1">
              <FeedbackPopup1 />
            </Route>

            <AuthorizeRoute path="/mentorprofile">
              <Mentorprofile setToken={setToken} /> {/*const token = useContext(tokenContext) */}
            </AuthorizeRoute>

            <AuthorizeRoute path="/menteeprofile">
              <Menteeprofile setToken={setToken} /> {/*const token = useContext(tokenContext) */}
            </AuthorizeRoute>

            <AuthorizeRoute path="/sendfeedback">
              <SendFeedback setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/feedbacksent">
              <FeedbackSent />
            </AuthorizeRoute>

            <Route path="/signin">
              <Signin setToken={setToken} />
            </Route>

            <Route path="/signup">
              <Signup setToken={setToken} />
            </Route>

            <AuthorizeRoute path="/endrelationship">
              <EndRelationship setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/settings">
              <Settings setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/meetingrequest">
              <MeetingRequest setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/home">
              <Home setToken={setToken} home={true} mymentor={false} mymentees={false} />
              {/* <Notification /> */}
            </AuthorizeRoute>

            <AuthorizeRoute path="/endrelationshippopup">
              <EndRelationshipPopup />
            </AuthorizeRoute>

            <AuthorizeRoute path="/feedbackpopup">
              <FeedbackPopup setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/workshoppopup">
              <WorkshopPopup setToken={setToken} />
            </AuthorizeRoute>

            {/* <AuthorizeRoute path="/mymentor">
              <MyMentor setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mymentees">
              <MyMentee setToken={setToken} />
            </AuthorizeRoute> */}

            <AuthorizeRoute path="/mymentorstatus">
              <MyMentor setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/menteeselecttopics">
              <MenteeMoreInfo setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/menteeselectmentor">
              <Mentorprofile setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mymentor">
              <MentorRelationship setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mymenteesstatus">
              <MyMentee setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mentorselecttopics">
              <MentorInfo setToken={setToken} />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mymentees">
              <Menteeprofile setToken={setToken} />
            </AuthorizeRoute>

            {/* <Route path="/menteemoreinfo">
              <MenteeMoreInfo setToken={setToken} />
            </Route> */}

            <AuthorizeRoute path="/mentorinfo">
              <MentorInfo setToken={setToken} />
              {/* <MentorMoreInfo setToken={setToken} /> */}
            </AuthorizeRoute>

            <AuthorizeRoute path="/menteeinfo">
              <MenteeInfo />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mentorrelationship">
              <MentorRelationship />
            </AuthorizeRoute>

            <AuthorizeRoute path="/menteerelationship/:param">
              <MenteeRelationship />
            </AuthorizeRoute>

            <AuthorizeRoute path="/mentormoreinfo">
              <MentorMoreInfo setToken={setToken} />
            </AuthorizeRoute>

            <Route path="/footer">
              <Footer />
            </Route>

            <AuthorizeRoute path="/notification">
              <Notifications />
            </AuthorizeRoute>

            <Route path="*">
              {token ? <InNav /> : <OutNav />}
              <NotFound />
            </Route>
          </Switch>
        </TokenContext.Provider>
      </div>
    </Router>
  );
}
