import Popup from "reactjs-popup";
import "../css/request.css";
import React from "react";

export default function EndRelationshipPopup() {
  return (
    <div>
      <Popup
        trigger={
          <button
            type="submit"
            className="mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {" "}
            End Relationship{" "}
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

            <div className="content1 text-4xl font-bold text-center mt-9 mb-9 mr-2 ml-2">
              <br></br>
              Are You Sure <br></br>
              You Want to End This <br></br>
              Relationship? <br></br>
              <br></br>
              <button
                type="submit"
                className="group relative w-1/3 mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {" "}
                Yes{" "}
              </button>
              <button className="group relative w-1/5"> </button>
              <button
                type="submit"
                className="group relative w-1/3 mt-3 justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-black bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grey-500"
              >
                {" "}
                No{" "}
              </button>
              <br></br>
              <br></br>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}
