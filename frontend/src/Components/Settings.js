import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import InNav from "./InNav";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";

async function getDepartments(setDepartments, userToken) {
    return fetch(`${API_URL}settings/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`,
      },
    })
      .then((response) => response.json()) //returns a promise
      .then((data) => {
        console.log(data);
        setDepartments(data)
        return data
      }) //return the list of department OBJECTS
      .catch((err) => console.log(err));
    }

async function updateDetails(credentials, userToken) {
    return fetch(`${API_URL}settings/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${userToken}`,
        },
        body: JSON.stringify(credentials),
    })
    .then((response) => {
        if (response.status == 400) {
              // there's been an error whilst Registering (i.e. user already exists)
              //setRegisterError(true);
            throw new Error("Registration for this user has been unsuccessful");
        } else if (response.status == 201) {
            return true; //registering has been successful
        }
    })
    .catch((err) => {
        console.log(err);
        return ""; // falsy value used to indicate that registration has failed
    });
}
export default function Settings() {
    const [departments, setDepartments] = useState([]);
    const userToken = useContext(TokenContext)


    const history = useHistory();

    const [putInformation, setUserDetails] = useState({
        username: "",
        password_old: "",
        password_new: "",
        businessArea: "",
    });
    useEffect(async () => {
        const depts = await getDepartments(setDepartments, userToken); 
    }, []);

    const deptOptions = departments.map(dept => {
        return <option name={dept.business_name} value={dept.business_name} key={dept.business_id}>{dept.business_name}</option>
    })

    function getNumericValue(departmentName){
        console.log(departments)
        for (let i=0; i<departments.length; i++){
          console.log(departments[i].business_name)
          console.log(departmentName)
          if (departments[i].business_name == departmentName){
            return departments[i].business_id;
          }
        }
        return "";
    }

    function handleChange(event) {
        console.log(event.target)
        setUserDetails(prevUserDetails => {
    
            // console.log(prevUserDetails);
            const {name, value, type} = event.target
            
            return {
                ...prevUserDetails,
                [name]: value
            }
        })
        console.log(putInformation)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        //this actually returns the object - we need to isolate the token
        //const copyOfBusinessArea = userDetails.businessArea
        // const copyUserDetails = {...userDetails, businessArea: getNumericValue(copyOfBusinessArea)}
    
        //rewriting the business area attribute to the numeric value (instead of a string)
        const copyOfPutInfo = {...putInformation}
    
        //console.log(userDetails.businessArea)
    
        copyOfPutInfo.businessArea = getNumericValue(putInformation.businessArea)
        console.log(copyOfPutInfo)
        const registrationSucess = await updateDetails(copyOfPutInfo, userToken);

        history.push("/home")
    
        //type === "select-one" ? getNumericValue(value)
    
        // if (registrationSucess) {
        //   const token = await loginUser({ username: userDetails.username, password: userDetails.password });
    
        //   if (token) {
        //     //redirecting the user the home page after loggin them in (after registration)
        //     setToken(token);
    
        //     //localStorage.setItem("token", token);
    
        //     history.push("/home");
        //     console.log(token);
        //   } else {
        //     console.log("This should not be printed out - user has registered successfully but cannot login?!");
        //     setRegisterError(true)
        //   }
        // } else if (!registrationSucess) {
        //   setRegisterError(true);
        // }
    };

    return (
        <> 
           <div>
           <InNav home={false} mymentor={false} mymentees={false}/>
            <h1 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">
                 Settings
               </h1>
            </div>
            <div className="flex items-center justify-items-center" >               
                <div class=" w-full px-8">                    
                    <div class="xl:px-24">
                        <div class="px-5 py-4 bg-gray-100 rounded-lg flex items-center justify-between mt-7">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19 9.99999H20C20.2652 9.99999 20.5196 10.1054 20.7071 10.2929C20.8946 10.4804 21 10.7348 21 11V21C21 21.2652 20.8946 21.5196 20.7071 21.7071C20.5196 21.8946 20.2652 22 20 22H4C3.73478 22 3.48043 21.8946 3.29289 21.7071C3.10536 21.5196 3 21.2652 3 21V11C3 10.7348 3.10536 10.4804 3.29289 10.2929C3.48043 10.1054 3.73478 9.99999 4 9.99999H5V8.99999C5 8.08074 5.18106 7.17049 5.53284 6.32121C5.88463 5.47193 6.40024 4.70026 7.05025 4.05025C7.70026 3.40023 8.47194 2.88462 9.32122 2.53284C10.1705 2.18105 11.0807 1.99999 12 1.99999C12.9193 1.99999 13.8295 2.18105 14.6788 2.53284C15.5281 2.88462 16.2997 3.40023 16.9497 4.05025C17.5998 4.70026 18.1154 5.47193 18.4672 6.32121C18.8189 7.17049 19 8.08074 19 8.99999V9.99999ZM17 9.99999V8.99999C17 7.67391 16.4732 6.40214 15.5355 5.46446C14.5979 4.52678 13.3261 3.99999 12 3.99999C10.6739 3.99999 9.40215 4.52678 8.46447 5.46446C7.52678 6.40214 7 7.67391 7 8.99999V9.99999H17ZM11 14V18H13V14H11Z"
                                            fill="#4B5563"
                                        />
                                    </svg>
                                </div>
                                <p class="text-sm text-gray-800 pl-3">We take privacy issues seriously. You can be sure that your personal data is securely protected.</p>
                            </div>
                            <button class="md:block hidden focus:outline-none focus:ring-2 focus:ring-gray-700 rounded">
                                <svg aria-label="Close this banner" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.8337 5.34166L14.6587 4.16666L10.0003 8.825L5.34199 4.16666L4.16699 5.34166L8.82533 10L4.16699 14.6583L5.34199 15.8333L10.0003 11.175L14.6587 15.8333L15.8337 14.6583L11.1753 10L15.8337 5.34166Z" fill="#79808F" />
                                </svg>
                            </button>
                        </div>                        
                        <div class=" mt-8 border-b border-gray-200 pb-6">
                            <div class = " flex flex-col mb-5">
                                
                                    <div class="flex items-center">
                                        <h1 class="text-xl font-bold pr-2 leading-5 text-gray-800">Change E-mail Address</h1>
                                    </div>
                                        <div class="flex items-center mt-7">
                                            <div class=" flex flex-col mb-6 w-3/4">
                                                <label class="text-sm leading-none text-gray-800" id="firstName" >New E-Mail Address</label>
                                                <input
                                                id="email-address"
                                                name="username"
                                                type="email"
                                                autoComplete="email"
                                                tabindex="0"
                                                class="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800"
                                                aria-labelledby="firstName"
                                                placeholder="John@gmail.com"
                                                value={putInformation.username}
                                                onChange={handleChange}/>
                                            </div>       
                                        </div>  
                            </div>
                        </div>
                        <div class="mt-8 border-b border-gray-200 pb-6">
                            <div class = " flex flex-col mb-6">
                                <div class="flex justify-start">
                                    <div class="flex items-center">
                                        <h1 class="text-xl font-bold pr-2 leading-5 text-gray-800">Change Password</h1>
                                    </div>
                                </div>
                                    <div class = "flex flex-col">
                                        <div class="flex items-center mt-7">
                                            <div class=" flex flex-col mb-6 w-3/4">
                                                <label class="text-sm leading-none text-gray-800" id="firstName" >Current Password</label>
                                                <input
                                                id="password_old"
                                                name="password_old"
                                                type="password"
                                                autoComplete="current-password"
                                                tabindex="0"
                                                class="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800"
                                                aria-labelledby="firstName"
                                                placeholder="Enter Your Current Password"
                                                value={putInformation.password_old}
                                                onChange={handleChange}/>
                                            </div>
                                        </div>
                                        <div class="flex items-center mt-8">
                                            <div class="flex flex-col mb-6 w-3/4">
                                                <label class="text-sm leading-none text-gray-800" id="emailAddress">New Password</label>
                                                <input
                                                id="password_new"
                                                name="password_new"
                                                type="password"
                                                autoComplete="current-password"
                                                tabindex="0"
                                                class="w-full p-3 mt-3 bg-gray-100 border rounded border-gray-200 focus:outline-none focus:border-gray-600 text-sm font-medium leading-none text-gray-800"
                                                aria-labelledby="emailAddress"
                                                placeholder="Enter Your New Password"
                                                value={putInformation.password_new}
                                                onChange={handleChange}/>
                                            </div>                                       
                                        </div>                           
                                    </div>
                            </div>
                        </div>
                        <div class="mt-8  pb-6">
                            <div class = " flex flex-col mb-6">
                                <div class="flex justify-start">
                                    <div class="flex items-center">
                                        <h1 class="text-xl font-bold pr-2 leading-5 text-gray-800">Change Department</h1>
                                    </div>
                                </div>
                            </div>
                                <div class=" flex flex-col mb-6">
                                        <label htmlFor="department" className="sr-only">Current Email address</label>
                                        <select
                                        name="businessArea"
                                        id="department"
                                        className="rounded-md relative block w-3/4 px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                                        required
                                        value={putInformation.businessArea}
                                        onChange={handleChange}>
                                            <option value="" disabled selected>Select Your Department</option>
                                            {deptOptions}
                                        </select>
                                    </div>
                        </div>
                        <div class="flex justify-center space-x-4 mb-10">
                            <button className="flex justify-end focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-pink-700 transition duration-150 ease-in-out hover:bg-indigo-600 font-bold rounded text-white px-4 sm:px-10 border border-indigo-700 py-2 sm:py-4 text-xl">
                                Delete Your Account
                            </button>
                            <button className="focus:outline-none focus:ring-2 focus:ring-offset-5 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-xl font-bold  rounded text-white px-4 sm:px-10 border border-indigo-700 py-2 sm:py-4 text-sm" onClick={handleSubmit}>
                                    Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}