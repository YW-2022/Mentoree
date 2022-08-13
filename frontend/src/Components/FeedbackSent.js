import React from "react";
import InNav from "./InNav";

export default function FeedbackSent() {
  return (
    <>
      <InNav />
      <section className="mx-auto container w-full py-36">
        <div className="flex flex-col justify-center items-center">
          <div className="md:text-5xl text-4xl font-black text-center text-indigo-500 leading-snug lg:w-3/4 mb-5 yixwang">
            Feedback Sent!
          </div>

          <div className="md:text-1xl text-2xl font-400 text-center text-idngo-800 leading-snug lg:w-3/4 my-2">
            Thank you so much for taking the time to
            review our product, we really appreciate
            your time and effort.😊
          </div>

          <div className="md:text-1xl text-2xl font-400 text-center text-idngo-800 leading-snug lg:w-3/4 my-2">
            One of our <strong>talented</strong>{" "}
            developers will read through your comments
            and endeavour to implement your ideas!
          </div>
        </div>
      </section>
    </>
  );
}
