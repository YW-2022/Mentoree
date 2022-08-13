import { Fragment } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import {
  Disclosure,
  Menu,
  Transition,
} from "@headlessui/react";
import {
  BellIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/outline";

const navigation = [
  { name: "Sign In", href: "/signin", current: true },
  { name: "Sign Up", href: "/signup", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function OutNav(props) {
  if (props.signin && !props.signup) {
    navigation[0].current = true; // this is sign in
    navigation[1].current = false; // this is sign up
  } else if (!props.signin && props.signup) {
    navigation[0].current = false; // this is sign in
    navigation[1].current = true; // this is sign up
  }

  return (
    <Disclosure
      as="nav"
      className="bg-gradient-to-r from-sky-500 to-indigo-500"
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">
                    Open main menu
                  </span>
                  {open ? (
                    <XIcon
                      className="block h-6 w-6"
                      aria-hidden="true"
                    />
                  ) : (
                    <MenuIcon
                      className="block h-6 w-6"
                      aria-hidden="true"
                    />
                  )}
                </Disclosure.Button>
              </div>

              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  {"\u00A0"}
                  {"\u00A0"}
                  {"\u00A0"}
                  <span className="text-white text-2xl font-bold font-pacifico">
                    <Link to="/">Mentoree</Link>
                  </span>
                </div>

                <div className="hidden sm:block sm:ml-6 absolute right-0">
                  <div className="flex space-x-4 yixwang">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-indigo-700 text-white"
                            : "text-gray-300 hover:bg-indigo-600 hover:text-white",
                          "px-3 py-2 rounded-md text-medium font-bold"
                        )}
                        aria-current={
                          item.current
                            ? "page"
                            : undefined
                        }
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
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
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={
                    item.current ? "page" : undefined
                  }
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
