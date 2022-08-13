import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export function Notification(props) {
  //   const replyInvite = (accept) => {
  //     //let endpoint = '';
  //     // let d;

  //     if (props.invite.inviteType === 'meeting') {
  //       d = { meetingID: props.invite.eventID };
  //       endpoint = accept ? 'api/acceptMeetingInvite' : 'api/rejectMeetingInvite'; //
  //     }

  //     else {
  //       d = { workshopID: props.invite.eventID };//
  //       endpoint = accept
  //         ? 'api/acceptWorkshopInvite'//
  //         : 'api/rejectWorkshopInvite';//
  //     }

  //     // axios({
  //     //   method: 'post',
  //     //   url: endpoint,
  //     //   headers: { 'Content-Type': 'application/json' },
  //     //   data: d,
  //     // });
  //   };

  return (
    <Card>
      <CardContent>{props.message}</CardContent>
    </Card>
  );
}
