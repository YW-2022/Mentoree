import Popup from 'reactjs-popup';
import "../css/request.css";
import React from 'react';
import { useState } from 'react';

import 'react-calendar/dist/Calendar.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// import Timeimg from "../img/clock-regular.svg";
// import Calendarimg from "../img/calendar-solid.svg";


class FeedbackForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('Feedback was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          COMMENTS
          <br/>
          <textarea placeholder="Please leave your feedback..." rows="4" required className="border-2 w-full h-32 border-blue-700 rounded-md " type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" value="Submit" />
      </form>
    );
  }
}


export default function FeedbackPopup(){


    const [startDate, setStartDate] = useState(new Date()); 


    return(

        <div>
            <Popup 
            trigger={<button type="submit" className="mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Give Feedback </button>}
            modal
            nested
            >
            {close => (
              <div className="modal">
                <button className="close" onClick={close}>
                  &times;
                </button>
                <div className="header text-5xl font-bold"> Feedback </div>

                <div className="content">
                  {' '}
                  <div className="font-md text-xl mb-3 font-bold">MEETING TITLE:
                  <input type="text" className="meetingtitleline ml-3" />
                  </div>


                  <div className="font-md text-xl mb-3 font-bold ">DATE
                     <DatePicker className="border-2 border-blue-700 rounded-md" selected={startDate} onChange={(date) => setStartDate(date)} />
                  </div>

                  <div className="text-xl mb-3">
                    
                    <span className="font-bold">START TIME
                    </span>
                    
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

                  </div>

                  <div className="font-md text-xl mb-3 font-bold">

                  <FeedbackForm /> 

                  </div>
                  
     
                </div>

              </div>
            )}
          </Popup>

            
        </div>

    );
}

