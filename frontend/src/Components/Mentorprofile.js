import React, { Children, useEffect, useContext, useState } from "react";
import ProfileCard from "./ProfileCard";
import InNav from "./InNav";
import Footer from "./Footer";
import { TokenContext } from "../Context/TokenContext";
import { API_URL } from "../constants/constants";

function Mentorprofile(item) {
  const [mentors, setMentors] = useState([])
  const [errorSubmitting, setErrorSubmitting] = useState("")

  const userToken = useContext(TokenContext)


  useEffect(() => {
    fetch(`${API_URL}menteeMentorSelection/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${userToken}`, //put the token here
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`This is an HTTP error: The status is ${response.status}`);
      }
      return response.json();
    })
    .then((actualData) => {
      console.log(actualData)
      setMentors(actualData);
    })
    .catch((err) => {
      console.log(err.message);
    });
  }, [])

  const cards = mentors.map((item) => {
    return (
      <ProfileCard
        id = {item.id}
        name={item.mentor}
        email={item.email}
        //img={item.coverImg}
        department={item.department}
        //topic={item.topic}
        rating={item.rating}
        //reviewCount={item.stats.reviewCount}
      />
    );
  });


  return (
    <div>
      <InNav home={false} mymentor={true} mymentee={false}/>
      <div className="container flex justify-center mx-auto pt-10">
        <div>
          <h1 className="xl:text-6xl text-6xl text-center font-extrabold pb-3 mx-auto text-indigo-500">
            Choose a Mentor
          </h1>
          <p className="text-gray-500 lg:text-lg text-center font-semibold pb-3">
            Choose a mentor to be matched with from our
            suggestions that are tailor picked to suit
            your needs!
          </p>
        </div>
      </div>
      <section className="cards-list1">
        {cards}
      </section>
      <Footer />
    </div>
  );
}

export default Mentorprofile;
