import Popup from 'reactjs-popup';
import "../css/request.css";
import React, { useContext } from 'react';
import { useState } from 'react';

import 'react-calendar/dist/Calendar.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useHistory } from 'react-router-dom';
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";

// import Timeimg from "../img/clock-regular.svg";
// import Calendarimg from "../img/calendar-solid.svg";



function FeedbackForm1(props){

  const [value, setValue] = useState("");
  const history = useHistory();
  
  function handleChange(event){
    setValue({value: event.target.value});
  }

  function handleSubmit(event){
    event.preventDefault();
    alert('Feedback was submitted!');
    history.push("/mymenteesstatus")
    
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <label>
        COMMENTS
        <br/>
        <textarea placeholder="Please leave your feedback..." rows="4" required className="border-2 w-full h-32 border-blue-700 rounded-md " type="text" onChange={handleChange} />
      </label>
      <input className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" value="Submit" />
    </form>
  );
  
}

export default function FeedbackPopup(props){

    const history = useHistory();
    const userToken = useContext(TokenContext);

    const [info, setInfo] = useState({
        introvert_rank: 1,
        extrovert_rank: 1,
        spontaneous_rank: 1,
        planning_rank: 1,
        motivated_rank: 1,
        material_delivery_rank: 1,
      });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            meeting:props.meeting,
            introvert:info.introvert_rank,
            extrovert:info.extrovert_rank,
            spontaneous:info.spontaneous_rank,
            planning:info.planning_rank,
            motivated:info.motivated_rank,
            material_delivery:info.material_delivery_rank
        }
        const result = await sendFeedback(data)
        alert('Feedback was submitted!');
        history.push("/mymentorstatus")
        
    }


    async function sendFeedback(feedback) {
        return (
          fetch(`${API_URL}MenteeFeedback/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${userToken}`, //put the token here
            },
            body: JSON.stringify(feedback),
          })
            //we need to check if the user doesn't actually have an account
            .then((response) => {
              console.log(feedback)
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

    function handleChangeint(event) {
        setInfo({ ...info, introvert_rank: parseInt(event.target.value) });
        console.log(info);
      }

    function handleChangeext(event) {
        setInfo({ ...info, extrovert_rank: parseInt(event.target.value) });
        console.log(info);
      }
    
    function handleChangespont(event) {
        setInfo({ ...info, spontaneous_rank: parseInt(event.target.value) });
        console.log(info);
      }
    
    function handleChangeplan(event) {
        setInfo({ ...info, planning_rank: parseInt(event.target.value) });
        console.log(info);
      }
    
    function handleChangemot(event) {
        setInfo({ ...info, motivated_rank: parseInt(event.target.value) });
        console.log(info);
      }
    
    function handleChangedel(event) {
        setInfo({ ...info, material_delivery_rank: parseInt(event.target.value) });
        console.log(info);
      }

    function handleClose(event) {
        history.push("/mymenteesstatus")
    }
    const [startDate, setStartDate] = useState(new Date(2022, 2, 11, 16, 0, 0)); 

    if (props.mentee){
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
                    <div className="font-md text-xl mb-3 font-bold">MEETING Notes:
                    First Meeting
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

                    <div className="font-md text-xl mb-3 font-bold ml-10">Rate your mentors traits from 1-5 (1 being not so good, 5 being very good)</div>
                        <div class="grid gap-x-16 gap-y-6 grid-cols-3">
                            <div class="flex space-x-4 ">
                                <div>
                                    <h3 class=" mt-4 text-center leading-5 text-gray-600 font-bold text-base">Introverted</h3>
                                </div>
                                    <div class=" items-center  mt-2">
                                        <div class=" mb-6 w-3/4">
                                            <select
                                                name="department"
                                                id="department"
                                                className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                                required
                                                onChange={handleChangeint}
                                                // value={}
                                            >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                    </div>
                            </div>
                            <div class="flex space-x-4 ">
                                <div>
                                    <h3 class=" mt-4 leading-5 text-gray-600 font-bold text-base">Material Delivery</h3>
                                </div>
                                <div class=" items-center  mt-2">
                                    <div class=" mb-6 w-3/4">
                                        <label htmlFor="department" className="sr-only">
                                        Current Email address
                                        </label>
                                        <select
                                        name="department"
                                        id="department"
                                        className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        onChange={handleChangedel}
                                        >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="flex space-x-4 ">
                                    <div>
                                    <h3 class=" mt-4 leading-5 text-gray-600 font-bold text-base">Extroverted</h3>
                                    </div>
                                    <div class=" items-center  mt-2">
                                    <div class=" mb-6 w-3/4">
                                        <label htmlFor="department" className="sr-only">
                                        Current Email address
                                        </label>
                                        <select
                                        name="department"
                                        id="department"
                                        className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        onChange={handleChangeext}
                                        >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        </select>
                                    </div>
                                    </div>
                                </div>

                                <div class="flex space-x-4 ">
                                    <div>
                                    <h3 class=" mt-4  leading-5 text-gray-600 font-bold text-base">Planning</h3>
                                    </div>
                                    <div class=" items-center  mt-2">
                                    <div class=" mb-6 w-3/4">
                                        <label htmlFor="department" className="sr-only">
                                        Current Email address
                                        </label>
                                        <select
                                        name="department"
                                        id="department"
                                        className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        onChange={handleChangeplan}
                                        >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        </select>
                                    </div>
                                    </div>
                                </div>
                                
                                <div class="flex space-x-4 ">
                                    <div>
                                    <h3 class=" mt-4  leading-5 text-gray-600 font-bold text-base">Spontaneous</h3>
                                    </div>

                                    <div class=" items-center  mt-2">
                                    <div class=" mb-6 w-3/4">
                                        <label htmlFor="department" className="sr-only">
                                        Current Email address
                                        </label>
                                        <select
                                        name="department"
                                        id="department"
                                        className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        onChange={handleChangespont}
                                        >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        </select>
                                    </div>
                                    </div>
                                </div>

                                <div class="flex space-x-4 ">
                                    <div>
                                    <h3 class=" mt-4  leading-5 text-gray-600 font-bold text-base">Motivated</h3>
                                    </div>
                                    <div class=" items-center  mt-2">
                                    <div class=" mb-6 w-3/4">
                                        <label htmlFor="department" className="sr-only">
                                        Current Email address
                                        </label>
                                        <select
                                        name="department"
                                        id="department"
                                        className="rounded-md relative block w-13  px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        onChange={handleChangemot}
                                        >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        </select>
                                    </div>
                                    </div>
                                </div>
                        </div>    

                    <div className="font-md text-xl mb-3 font-bold">
                    <input className="group relative w-full mt-5 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" value="Submit" onClick={handleSubmit} />
                    </div>
                    
        
                    </div>

                </div>
                )}
            </Popup>

                
            </div>

        );
    }
    else {
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
                    <div className="font-md text-xl mb-3 font-bold">MEETING Notes:
                    First Meeting
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
                    <FeedbackForm1 /> 
                    </div>
                    
        
                    </div>

                </div>
                )}
            </Popup>

                
            </div>

        );
    }
}

