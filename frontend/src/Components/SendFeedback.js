import React from "react";
import InNav from "./InNav";
import { Link } from "react-router-dom";

function Index() {
  return (
    <>
      <InNav />
      <div className="container mx-auto pt-16 mb-8">
        <div className="lg:flex">
          <div className="xl:w-2/5 lg:w-2/5 bg-gradient-to-r from-sky-500 to-indigo-400 py-16 xl:rounded-bl rounded-tl rounded-tr xl:rounded-tr-none">
            <div className="xl:w-5/6 xl:px-0 px-8 mx-auto">
              <h1 className="xl:text-4xl text-3xl pb-4 text-white font-bold ">
                Send Feedback on our application
              </h1>
              <p className="text-xl text-white pb-8 leading-relaxed font-normal lg:pr-4">
                Have an idea to make our application
                even better? Or perhaps you spotted a
                bug that needs fixing? Are you
                interested in partnering with us? Have
                some suggestions or just want to say
                Hi? Just contact us. We would love to
                hear from you!
              </p>
              <div className="flex pb-4 items-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-phone-call"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      stroke="none"
                      d="M0 0h24v24H0z"
                    />
                    <path d="M4 4h5l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v5a1 1 0 0 1 -1 1a16 16 0 0 1 -16 -16a1 1 0 0 1 1 -1" />
                    <path d="M15 7a2 2 0 0 1 2 2" />
                    <path d="M15 3a6 6 0 0 1 6 6" />
                  </svg>
                </div>
                <p className="pl-4 text-white text-base">
                  +44 123456789
                </p>
              </div>
              <div className="flex items-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-mail"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#FFFFFF"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      stroke="none"
                      d="M0 0h24v24H0z"
                    />
                    <rect
                      x={3}
                      y={5}
                      width={18}
                      height={14}
                      rx={2}
                    />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </div>
                <p className="pl-4 text-white text-base">
                  feedback@group5software.com
                </p>
              </div>
              <p className="text-lg text-white pt-10 tracking-wide">
                123 Mentoree St <br />
                London, United Kingdom
              </p>
            </div>
          </div>
          <div className="xl:w-3/5 lg:w-3/5 bg-gray-200 h-full pt-5 pb-5 xl:pr-5 xl:pl-0 rounded-tr rounded-br">
            <form
              id="contact"
              className="bg-white py-4 px-8 rounded-tr rounded-br"
            >
              <h1 className="text-4xl text-zinc-600 font-extrabold mb-6">
                Enter Your Details
              </h1>

              <div className="block xl:flex w-full flex-wrap justify-start mb-6">
                <div className="w-2/4 max-w-xs mb-6 xl:mb-0">
                  <div className="flex flex-col">
                    <label
                      htmlFor="full_name"
                      className="text-gray-800 text-sm font-semibold leading-tight tracking-normal mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      required
                      id="full_name"
                      name="full_name"
                      type="text"
                      className="focus:outline-none focus:border focus:border-indigo-700 font-normal w-78 h-10 flex items-center mr-3 pl-3 text-sm border-gray-300 rounded border"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="w-2/4 max-w-xs xl:flex xl:justify-end">
                  <div className="flex flex-col">
                    <label
                      htmlFor="email"
                      className="text-gray-800 text-sm font-semibold leading-tight tracking-normal mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      required
                      id="email"
                      name="email"
                      type="email"
                      className="focus:outline-none focus:border focus:border-indigo-700 font-normal w-80 h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
                      placeholder="john.doe@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-wrap">
                <div className="w-2/4 max-w-xs">
                  <div className="flex flex-col">
                    <label
                      htmlFor="phone"
                      className="text-gray-800 text-sm font-semibold leading-tight tracking-normal mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      required
                      id="phone"
                      name="phone"
                      type="tel"
                      className="focus:outline-none focus:border focus:border-indigo-700 font-normal w-64 h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
                      placeholder="+1 234 384 193"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full mt-6">
                <div className="flex flex-col">
                  <label
                    className="text-sm font-semibold text-gray-800 mb-2"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    placeholder="I love your application, I don't think it can be improved!!! Thank you so much (or something along those lines)!"
                    name="message"
                    className="border-gray-300 border mb-4 rounded py-2 text-sm outline-none resize-none px-3 focus:border focus:border-indigo-700"
                    rows={8}
                    id="message"
                    defaultValue={""}
                  />
                </div>
                <div class="px-8 py-8">
                  <div class="grid gap-8 items-start justify-center">
                    <div class="relative group">
                      <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                      <button class="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600">
                        <span class="flex items-center space-x-5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 text-pink-600 -rotate-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                          {"\u00A0"}
                          {"\u00A0"}
                          {"\u00A0"}
                        </span>
                        <Link to="/feedbacksent" class="pl-6 text-indigo-400 group-hover:text-gray-100 transition duration-50 text-base font-semibold">
                            Send us your message!
                        </Link>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Index;
