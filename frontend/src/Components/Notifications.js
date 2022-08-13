import { IconButton, Menu, MenuItem } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import React, { Children, useEffect, useContext, useState } from "react";
import { Notification } from "./Notification";
import { TokenContext } from "../Context/TokenContext";
import { API_URL } from "../constants/constants";

// async function getNotifs(userToken) {
//     return (
//       fetch(`${API_URL}notifications/`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Token ${userToken}`, //put the token here
//         },
//       })
//         //we need to check if the user doesn't actually have an account
//         .then((response) => {
//           if (response.status === 400) {
//             //bad response - means an error has occurred
//             throw new Error("There's been a error with submitting this request");
//           }
//           return response.json()
//         })
//         .then((actualData) => {
//             console.log(actualData)
//             setAllNotifs(actualData)
//         })
//         .catch((err) => {
//           console.log(err);
//           return false; //login failure - token is set to a falsy value
//         })
//     );
//   }

export function Notifications(props) {
  const [allNotifs, setAllNotifs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [rerender, setRerender] = useState(false);

  const open = Boolean(anchorEl);

  const userToken = useContext(TokenContext);

  const getNotifs = (userToken) => {
    return (
      fetch(`${API_URL}notifications/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${userToken}`, //put the token here
        },
      })
        //we need to check if the user doesn't actually have an account
        .then((response) => {
          if (response.status === 400) {
            //bad response - means an error has occurred
            throw new Error("There's been a error with submitting this request");
          }
          return response.json();
        })
        .then((actualData) => {
          setAllNotifs(actualData);
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false; //login failure - token is set to a falsy value
        })
    );
  };

  const handleClick = (event) => {
    getNotifs(userToken);
    setRerender(!rerender);
    console.log(typeof allNotifs);
    // setAllNotifs(newnotifs)
    // console.log(newnotifs)
    setAnchorEl(event.currentTarget);
    setRerender(!rerender);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //console.log(allNotifs);

  return (
    <div>
      <IconButton
        id="notificationsButton"
        aria-controls={open ? "notificationsMenu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <NotificationsIcon />
      </IconButton>

      <Menu
        id="notificationsMenu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <div>
          {allNotifs.map((noti) => {
            return (
              <MenuItem key={noti.id}>
                <Notification message={noti["msg"]} />
              </MenuItem>
            );
          })}
        </div>
      </Menu>
    </div>
  );
}
