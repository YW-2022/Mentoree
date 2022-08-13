import { LockClosedIcon } from "@heroicons/react/solid";
import OutNav from "./OutNav";
import { Link, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../constants/constants";
import loginUser from "../Utilities/loginUser";

async function getDepartments(setDepartments) {
  return fetch(`${API_URL}register/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json()) //returns a promise
    .then((data) => {
      //console.log(data);
      setDepartments(data.businesses)
      return data.businesses
    }) //return the list of department OBJECTS
    .catch((err) => console.log(err));


    // const response = await fetch(`${API_URL}register/`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })

    // const departments = await response.json();
    // setDepartments(departments.businesses);

    // return data;


}

//you only need await when you don't use .then()

// "Authorization": "Bearer " +

//check the status of the response to check if the user is already registered
async function registerUser(credentials) {
  return fetch(`${API_URL}register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

// .then((data) => data.json()) //also returns a promise

export default function Signup({ setToken }) {
  const [departments, setDepartments] = useState([]);
  const [registerError, setRegisterError] = useState(false);

  //console.log(departments);

  const deptOptions = departments.map(dept => {
    return <option name={dept.name} value={dept.name} key={dept.id}>{dept.name}</option>
  })

  const history = useHistory();

  const [userDetails, setUserDetails] = useState({
    username: "",
    first_name: "",
    last_name: "",
    businessArea: "",
    password: "",
  });

  //run once when the component is rendered to get all the departments
  useEffect(async () => {
    const depts = await getDepartments(setDepartments);   
    //console.log(depts);
    //getDepartments(setDepartments)
    // setDepartments(depts)

  }, []);

  // converts the department name into its id
  function getNumericValue(departmentName){
    for (let i=0; i<departments.length; i++){
      if (departments[i].name == departmentName){
        return departments[i].id;
      }
    }
    return "";
  }


  //make the form a controlled component - look at the Scrimba tutorial
  function handleChange(event) {
    setUserDetails(prevUserDetails => {

        // console.log(prevUserDetails);
        const {name, value, type} = event.target
        
         return {
            ...prevUserDetails,
            [name]: value
        }
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    //this actually returns the object - we need to isolate the token
    //const copyOfBusinessArea = userDetails.businessArea
    // const copyUserDetails = {...userDetails, businessArea: getNumericValue(copyOfBusinessArea)}

    //rewriting the business area attribute to the numeric value (instead of a string)
    const copyOfUserDetails = {...userDetails}

    //console.log(userDetails.businessArea)

    copyOfUserDetails.businessArea = getNumericValue(userDetails.businessArea)
    const registrationSucess = await registerUser(copyOfUserDetails);

    //type === "select-one" ? getNumericValue(value)

    if (registrationSucess) {
      const token = await loginUser({ username: userDetails.username, password: userDetails.password });

      if (token) {
        //redirecting the user the home page after loggin them in (after registration)
        setToken(token);

        //localStorage.setItem("token", token);

        history.push("/home");
        console.log(token);
      } else {
        console.log("This should not be printed out - user has registered successfully but cannot login?!");
        setRegisterError(true)
      }
    } else if (!registrationSucess) {
      setRegisterError(true);
    }
  };

  return (
    <div>
      <OutNav signin={false} signup={true} />
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">Create an Account</h2>
          </div>

          {registerError && <p className="text-center text-rose-600 font-semibold">A problem has occured while registering; try again.</p>}

          <form className="mt-8 space-y-3" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="first-name" className="sr-only">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="first_name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  placeholder="First Name"
                  value={userDetails.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  placeholder="Last Name"
                  value={userDetails.last_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="username"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  placeholder="Email address"
                  value={userDetails.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="department" className="sr-only">
                  Department
                </label>

                <select
                  name="businessArea"
                  id="department"
                  className="rounded-md relative block w-full px-2 py-2 border border-gray-300 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  required
                  // defaultValue={'DEFAULT'}
                  value={userDetails.businessArea}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    -- Select your department --
                  </option>

                  {deptOptions}

                </select>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-7"
                  placeholder="Password"
                  value={userDetails.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                </span>
                Sign up
              </button>
            </div>

            <div className="text-sm flex justify-center">
              <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in instead!
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
