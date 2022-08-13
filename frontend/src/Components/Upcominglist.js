import defaultProfileImage from "../img/defaultProfileimage.jpg";

const people = [
  {
    name: "Meeting with Jane Cooper",
    time: "01/03/2022",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },

  {
    name: "Corporate Finance Workshop",
    time: "05/03/2022",
    image: "https://cdn.tuk.dev/assets/photo-1530577197743-7adf14294584.jfif",
  },

  {
    name: "Meeting with Dean Jones",
    time: "09/03/2022",
    image: "https://cdn.tuk.dev/assets/blond-man-happy-expression_1194-2873.jpg",
  },

  {
    name: "Meeting with Andres Berlin",
    time: "11/03/2022",
    image: "https://cdn.tuk.dev/assets/photo-1564061170517-d3907caa96ea.jfif",
  },
];

export default function Upcominglist({ upcomingFour }) {
  // const [meetings, setMeetings]

  // function dateAndTime(when){ //when is the string that is returned from the endpoint
  //   //const date = new Date(when.substring(0,10));

  //   const year = when.substring(0,4);
  //   const month = when.substring(5,7);
  //   const day = when.substring(8,10);
  //   const hour = when.substring(11,13);
  //   const minute = when.substring(14,16);

  //   //7 numbers specify year, month, day, hour, minute, second, and millisecond (in that order):
  //   // 2022-03-16T17:00:00Z

  //   const date = new Date(year, month, day, hour, minute, 0, 0);
  //   return date.toLocaleString("en-GB");
  // }

  function dateAndTime(when) {
    //when is the string that is returned from the endpoint

    //7 numbers specify year, month, day, hour, minute, second, and millisecond (in that order):
    // 2022-03-16T17:00:00Z

    const dd = new Date(when);

    //const dd = new Date(parseInt(year), parseInt(month + 1), parseInt(day), parseInt(hour), parseInt(minute), 0, 0);

    console.log(dd);
    return dd.toLocaleString("en-GB");
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-auto border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    When?
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingFour &&
                  upcomingFour.map((meeting) => (
                    <tr key={meeting.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={defaultProfileImage} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm text-gray-900 font-bold">
                              {meeting.type == "meeting" ? `Meeting with ${meeting.mentor}` : `Workshop for ${meeting.topic}`}
                            </div>
                            <div className="text-xs font-medium text-gray-600">{meeting.notes}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-teal-600 font-bold">{dateAndTime(meeting.time)}</div>
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
