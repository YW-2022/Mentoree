import React, { useState } from "react";
import OutNav from "./OutNav";

function LandingPage() {
  // const [show, setShow] = useState(false);
  return (
    <div
      className="bg-white pb-12 overflow-y-hidden"
      style={{ minHeight: 700 }}
    >
      {/* Code block starts */}
      <OutNav signin={true} signup={false} />
      <dh-component>
        <div className="bg-white">
          <div className="container mx-auto flex flex-col items-center py-12 sm:py-24">
            <div className="w-11/12 sm:w-2/3 lg:flex justify-center items-center flex-col  mb-5 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center text-gray-800 font-black leading-7 md:leading-10">
                <div className="text-indigo-700 lg:text-8xl font-pacifico mb-4 text-7xl">
                  Mentoree
                </div>
                <span className="lg:text-5xl sm:text-4xl text-gray-700">
                  Want to ⚡
                  <span className="text-red-700">
                    supercharge
                  </span>
                  ⚡ your professional development?
                </span>
              </h1>
              <p className="mt-5 sm:mt-10 lg:w-10/12 text-gray-400 font-semibold text-center text-sm sm:text-lg">
                Discover dozens of different topics
                taught by hands-on mentors. Or fancy
                teaching? Become one of our leading
                experts on the site! Maybe even both.
              </p>
            </div>
            <div className="flex justify-center items-center">
              <a href="/signup">
                <button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 bg-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 lg:text-xl font-bold  rounded text-white px-4 sm:px-10 border border-indigo-700 py-2 sm:py-4 text-sm">
                  Get Started
                </button>
              </a>
            </div>
            <p className="mt-5 sm:mt-10 lg:w-10/12 text-teal-400 font-bold text-center text-sm sm:text-lg">
              Made with ❤️ by Group 5!
            </p>
          </div>
        </div>
      </dh-component>
      {/* Code block ends */}
    </div>
  );
}

export default LandingPage;
