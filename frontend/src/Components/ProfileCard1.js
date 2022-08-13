import React from "react";
import { useHistory } from "react-router-dom";

export default function ProfileCard1(props) {
  // function setMenteeInfo() {
  //   local;
  // }

  const history = useHistory();

  return (
    <div>
      <div className="card1">
        <div className="menteephoto"></div>
        <div className="text-2xl text-center font-bold mt-4">{props.name}</div>
        <p className="text-left text-gray-800 text-xl pt-3 font-normal">
          <span className="font-bold ml-2">Department: </span>
          {props.department}
          <br />
        </p>
        <p className="text-left text-gray-800 text-xl pt-3 font-normal">
          <span className="font-bold ml-2">Email: </span>
          {props.email}
          <br />
        </p>
        <button
          className="w-full flex justify-center mt-4 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 rounded text-white font-bold px-2 py-2 text-md"
          onClick={() => history.push(`/menteerelationship/${props.id}`)}
        >
          Select
        </button>
      </div>
    </div>
  );
}
