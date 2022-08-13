import { Link } from "react-router-dom";
import { Fragment, useContext } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import yellow from "../img/yellow.png";
import { API_URL } from "../constants/constants";
import { TokenContext } from "../Context/TokenContext";
import { Notifications } from "./Notifications";

const navigation = [
  { name: "Home", href: "/home", current: true },
  {
    name: "My Mentor",
    href: "/mymentorstatus",
    current: false,
  },
  {
    name: "My Mentees",
    href: "/mymenteesstatus",
    current: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function InNav(props) {
  const token = useContext(TokenContext);

  //const token = localStorage.getItem("token");

  if (props.home && !props.mymentor && !props.mymentees) {
    navigation[0].current = true; // this is home
    navigation[1].current = false; // this is my mentor
    navigation[2].current = false; // this is my mentees
  } else if (!props.home && props.mymentor && !props.mymentees) {
    navigation[0].current = false; // this is home
    navigation[1].current = true; // this is my mentor
    navigation[2].current = false; // this is my mentees
  } else if (!props.home && !props.mymentor && props.mymentees) {
    navigation[0].current = false; // this is home
    navigation[1].current = false; // this is my mentor
    navigation[2].current = true; // this is my mentees
  } else {
    // otherwise, they're all false
    navigation[0].current = false; // this is home
    navigation[1].current = false; // this is my mentor
    navigation[2].current = false; // this is my mentees
  }

  //make a function for logging out the user too
  async function logoutUser() {
    fetch(`${API_URL}logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`, //put the token here
      },
    })
      .then((response) => {
        if (response.status === 200) {
          //this means the user has been logged our successfully
          //props.setToken(null); //getting rid of the token on the FE - might replace with ""
          localStorage.removeItem("token");
        } else {
          console.log("logout failed");
        }
      })
      .catch((err) => console.log(err));

    //////////////////////////////////////////////////////////////////////
  }

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-sky-500 to-indigo-500">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-shrink-0 flex items-center">
                <span className="text-white text-2xl font-bold font-pacifico">
                  <Link to="/home">Mentoree</Link>
                </span>

                {"\u00A0"}
                {"\u00A0"}
                {"\u00A0"}

                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current ? "bg-indigo-600 text-white font-bold" : "text-white hover:bg-indigo-600 hover:text-white",
                          "px-3 py-2 rounded-md text-medium font-bold"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="bg-indigo-700 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">View notifications</span>
                  {/* <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
                  <Notifications />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="ml-3 relative">
                  <div>
                    <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src={yellow} alt="profile picture" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/sendfeedback"
                            className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}
                          >
                            Send Feedback
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link to="/settings" className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => {
                          logoutUser(); //deletes the token
                        }}
                      >
                        {({ active }) => (
                          <Link to="/" className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Sign out
                          </Link>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
