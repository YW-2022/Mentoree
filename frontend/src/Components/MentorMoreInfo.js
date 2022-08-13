import React, { Component } from "react";
import { colourOptions } from "./data.js";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import InNav from "./InNav.js";
import Footer from "./Footer.js";

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

function MentorInfo() {

    // const [info, setInfo] = useState({
    //   optionSelected: null, //for the topics
    //   numMentees: 0 // for the number of mentees
    // })


    // function handleChange(event){
    //   const {name, value, type, checked} = selected.target;

    //   setInfo(prevState => ({
    //       return {
    //           ...prevState, 
    //           name: value
    //       }    
    //   }))
    //   console.log(info)
    // }

    

    // return (

    // )

    console.log()



}








export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionSelected: null, //for the topics
      numMentees: 0 // for the number of mentees
    };
  }

//   handleChange = (selected) => {
    
//     const {name, value, type, checked} = selected.target;
//     this.setState(prevState => {
//         return {
//             ...prevState, 
//             name: value
//         }    
//     }
//     console.log(this.state);
//   };


  // {
    //   optionSelected: selected
    // });



  handleSubmit() { //this is going to be a POST request
    console.log(this.state)
    //expecting json of following format: {"capacity":INT, "topics:[INT,INT,...]"}
  }

  render() {

    return (
        <div>

        <InNav home={false} mymentor={false} mymentees={true} />

        <div>
        <h1 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">
             More Info
        </h1>
        <p className = "mt-4 text-sm text-center leading-5 text-gray-600">Select the topics you would like to teach and preferences so we can get to know more about you.</p>
        </div>

        <div className="flex justify-center mt-10">
           <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800">Topics</h1>
        </div>

        <div className="flex justify-center">
            <p className="mt-3 text-sm leading-5 text-gray-600">Pick a topic/topics that you have experience in and are interested in teaching from our selection</p>
        </div>

        <div className = "flex justify-center mt-4">
            <span
                className="d-inline-block w-1/2"
                data-toggle="popover"
                data-trigger="focus"
                data-content="Please selecet account(s)"
            >

            <ReactSelect
            options={colourOptions}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{
            Option
            }}
            onChange={this.handleChange}
            allowSelectAll={true}
            value={this.state.optionSelected}
            />
        </span>
        </div>

        <div className="mt-16 flex flex-col justify-start border-t border-gray-200">
            <h1 className="text-xl font-bold pr-2 leading-5 text-gray-800 text-center mt-16">Number Of Mentees</h1>
        </div>  

        <div className="text-center">
            <p className="text-sm leading-5 text-gray-600 mt-3">Specify the number of mentees that you are willing to undertake. <br/>
            Please ensure that you will always be able to dedicate time to this number of mentees. <br/>
            This number can be changed at any time.</p>
        </div>

       
        <form 
        className="flex justify-center mt-4"
        onSubmit={this.handleSubmit}>
            <select name="numMentees" id="numMentees" className="rounded-md w-1/1.5 px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3" required onChange={this.handleChange}>
                <option value="" disabled selected>Select Your Preferred Number</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option> 
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="4">6</option>
                <option value="5">7</option>
            </select>

            {/* <div className="flex justify-center">
              <button className="focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-lg font-bold  rounded text-white px-2 sm:px-10 border border-indigo-700 py-1 sm:py-4 text-sm">
                  Submit
              </button> 
            </div>  */}
        </form>
         <div className="flex justify-center">
              <button className="m-2 p-2 focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-md font-bold  rounded text-white border border-indigo-700">
                  Submit
               </button> 
        </div> 
      <Footer />
      </div>
    );
  }
}