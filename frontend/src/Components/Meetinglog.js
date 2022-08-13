import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Popup from "reactjs-popup";
import "../css/request.css";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import FeedbackPopup from "./FeedbackPopup1";

export default function MeetingLog(props) {
  const [startDate, setStartDate] = useState(new Date());
  const [meetinglog, setMeetingLog] = useState([]);

  console.log(props.meetings);

  const history = useHistory();

  return (
    <div className="flex flex-col">
      <div className="text-center font-bold text-2xl mt-2 text-indigo-600">Meeting Log</div>
      <div className="text-gray-600 mb-1"></div>
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-auto border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {props.meetings?.map((data) => (
                  <tr key={data.mentor}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-sky-100 border"></div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{data.start}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {data.feedback == false && <FeedbackPopup meeting={data.id} mentee={props.mentee} mentor={props.mentor}/>}
                      <Popup
                        trigger={
                          <button
                            type="submit"
                            className="mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {" "}
                            View Feedback{" "}
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
                            <div className="header text-5xl font-bold"> Feedback </div>

                            <div className="content">
                              {" "}
                              <div className="font-md text-xl mb-3 font-bold">{data.notes}: </div>
                              <div className="font-md text-xl mb-2 font-bold">FEEDBACK: </div>
                              <div className="text-lg pl-3 text-gray-800">Your feedback will appear here when your mentor submits it.</div>
                            </div>
                          </div>
                        )}
                      </Popup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
