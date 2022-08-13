import { LockClosedIcon } from "@heroicons/react/solid";
import OutNav from "./OutNav";
import { Link, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";
import loginUser from "../Utilities/loginUser";

//I think .json() actually returns a promise - not a JavaScript object
export default function Signin({ setToken }) {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false); //false by default as there is no error if use is not signed in

  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();

    //this actually returns the object - we need to isolate the token
    const token = await loginUser({ username, password });

    if (!token) {
      // the user has entered their details incorrectly - no user exists with these credentials
      setLoginError(true);
      return; // authorisation failed
    }

    setToken(token);
    history.push("/home");
    //console.log(token);
  };

  return (
    <div>
      <OutNav signin={true} signup={false} />
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-5xl font-extrabold text-indigo-500">Login to Your Account</h2>
          </div>

          {loginError && (
            <p className="text-red-600 border-2 border-rose-500">That email/username and password combination didn't work. Try again.</p>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mb-3"
                  placeholder="Email address"
                  onChange={(e) => setUserName(e.target.value)}
                />
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
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
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
                Sign in
              </button>
            </div>
            <div className="text-sm flex justify-center">
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Don't have an account? Sign up here!
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Signin.propTypes = {
  setToken: PropTypes.func.isRequired,
};
