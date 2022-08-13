/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import Calendar from "./Calendar";
import Footer from "./Footer";
import InNav from "./InNav";

export default function Home(props) {
  return (
    <div>
      <InNav {...props} />
      <Calendar />
      <Footer />
    </div>
  );
}
