from datetime import datetime
from heapq import nlargest
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import IntegrityError
from numpy import average
import pytz
from rest_framework.views import APIView
from django.http import Http404
from .models import (
    MenteeToMentorFeedback,
    MentorToMenteeFeedback,
    Profile,
    BusinessArea,
    Mentor,
    Mentee,
    Meeting,
    Workshop,
    Topic,
    Goal,
    Notification,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from .authentication import (
    ExpiringTokenAuthentication,  # ExpiresIn <--- also import if testing API Expiry
)
from .serializers import (
    MeetingSerializer,
    UserSerializer,
    ProfileSerializer,
    WorkshopSerializer,
    MenteeToMentorFeedbackSerializer,
)


class RegisterView(APIView):
    """View for allowing users to sign up to the website"""

    def post(self, request):
        """Post request to create a new user

        :Args:
            request (Request): 'username', 'first_name', 'last_name', 'password' for new user

        :Returns:
            Response: Error msg, if registration fails, username if registration succeeds
        """
        if User.objects.filter(username=request.data["username"]):
            return Response(
                {"error": "user with that email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user_data = {
            key: value for key, value in request.data.items() if key != "businessArea"
        }
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid():
            user = serializer.save()
            profileData = {
                "user": user.id,
                "businessArea": request.data["businessArea"],
            }
            serializer = ProfileSerializer(data=profileData)
            if serializer.is_valid():
                serializer.save()
                finalData = {"username": user.username}
                return Response(finalData, status=status.HTTP_201_CREATED)
            else:
                user.delete()
        return Response(
            {"error": "Failed to register user. Invalid information provided"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def get(self, _):
        """GET request to get all business areas

        Args:
            _ (Request): Empty body

        Returns:
            Response: All business areas in JSON format
        """
        buss = BusinessArea.objects.all().iterator()

        toReturn = {"businesses": []}
        for bus in buss:
            toReturn["businesses"].append({"name": bus.business_name, "id": bus.id})

        return Response(toReturn, content_type="application/json")


class LogOut(APIView):
    """A view that handles logging out a user."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        """Upon getting a POST request, the current user's token is destroyed, effectively destroying their state and logging them out.

        Args:
            request (Request): Empty body

        Returns:
            Response: A Response containing a success message, and a 200 OK status object.
        """
        request.user.auth_token.delete()
        return Response(
            {"logout": f"{request.user} was succesfully logged out"},
            status=status.HTTP_200_OK,
        )  # Redirect after


class ProfileUpdate(APIView):
    """
    Retrieve, update or delete a user instance.
    """

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get_object(self, pk):
        """Uses a PK to get a Profile object.

        Args:
            pk (int): Primary key for a int

        Raises:
            Http404: DOES_NOT_EXIST

        Returns:
            Profile: An instance of Profile.
        """
        try:
            return Profile.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get_topics(self, queryset):
        """Gets every topic and puts it in a dictionary using a queryset.

        Args:
            queryset (Queryset): Queryset containing a list of Topics models.

        Returns:
            dict: A dictionary where each key points to a Topic.
        """
        mydict = []
        for i, obj in enumerate(queryset.iterator()):
            mydict.append({"id": obj.id, "topic": obj.topic_name})

        return mydict

    def get(self, request, format=None):
        """Gets all information associated with a profile.

        Args:
            request (Request): empty body
            format (_type_, optional): _description_. Defaults to None.

        Returns:
            Response: A JSON containing the user ID, username, business area, mentor data (all fields), and mentee data (all fields).
        """
        profile = Profile.objects.get(user=request.user.id)
        pk = profile.id
        profile = self.get_object(pk)
        userData = User.objects.get(pk=profile.user.id)
        if profile.businessArea is not None:
            businessData = BusinessArea.objects.get(
                pk=profile.businessArea.id
            ).business_name
        else:
            businessData = None
        try:
            mentorDetails = Mentor.objects.get(profile=profile.id)
            topics = mentorDetails.topics.all()
            mentorTopics = self.get_topics(topics)
            introvert = mentorDetails.introvert
            extrovert = mentorDetails.extrovert
            spontaneous = mentorDetails.spontaneous
            motivated = mentorDetails.motivated
            material_delivery = mentorDetails.material_delivery
            mentorStatus = {
                "mentorTopics": mentorTopics,
                "introvert": introvert,
                "extrovert": extrovert,
                "spontaneous": spontaneous,
                "motivated": motivated,
                "material_delivery": material_delivery,
            }
        except Mentor.DoesNotExist:
            mentorStatus = False
        try:
            menteeDetails = Mentee.objects.get(profile=profile.id)
            topics = menteeDetails.topics.all()
            menteeTopics = self.get_topics(topics)
            menteeStatus = {
                "menteeTopics": menteeTopics,
                "int": menteeDetails.introvert_rank,
                "ext": menteeDetails.extrovert_rank,
                "spon": menteeDetails.spontaneous_rank,
                "plan": menteeDetails.planning_rank,
                "mot": menteeDetails.motivated_rank,
                "matD": menteeDetails.material_delivery_rank,
                "mentor": str(menteeDetails.mentor),
            }
        except Mentee.DoesNotExist:
            menteeStatus = False
            topics = None
        to_return = {
            "id": profile.id,
            "username": userData.username,
            "businessArea": businessData,
            "mentor": mentorStatus,
            "mentee": menteeStatus,
        }
        return Response(to_return)


class Timetable(APIView):
    """View for getting informations for the timetable endpoint"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """GET request to get all meetings/workshops for the timetable.
           As well as the next four meetings/workshops.

        Args:
            request (Request): empty body

        Returns:
            Response: All meetings/workshops, as well as the next 4 meetings.workshops based on the current time
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        timetable = []
        isMentor = list(Mentor.objects.filter(profile=profile).iterator())
        if isMentor:
            mentor = Mentor.objects.get(profile=profile)
            meetings = list(
                Meeting.objects.filter(mentor=mentor, is_accepted=True).iterator()
            )
            workshops = list(Workshop.objects.filter(mentor=mentor).iterator())
            timetable += meetings
            timetable += workshops
        isMentee = list(Mentee.objects.filter(profile=profile).iterator())
        if isMentee:
            mentee = Mentee.objects.get(profile=profile)
            meetings = list(
                Meeting.objects.filter(mentee=mentee, is_accepted=True).iterator()
            )
            workshops = list(Workshop.objects.filter(mentees__id=mentee.id).iterator())
            timetable += meetings
            timetable += workshops

        timetable = sorted(timetable, key=lambda x: x.time)

        next4 = list(filter(lambda x: x.finish > timezone.now(), timetable))
        next4 = next4[:4] if len(next4) > 4 else next4

        next4 = list(
            map(
                lambda x: {
                    "id": x.id,
                    "time": x.time,
                    "finish": x.finish,
                    "mentor": x.mentor.profile.user.first_name
                    + " "
                    + x.mentor.profile.user.last_name,
                    "type": "workshop" if isinstance(x, Workshop) else "meeting",
                    "notes": x.notes if isinstance(x, Meeting) else None,
                    "topic": x.topic.topic_name if isinstance(x, Workshop) else None,
                },
                next4,
            )
        )
        timetable = list(
            map(
                lambda x: {
                    "id": x.id,
                    "time": x.time,
                    "finish": x.finish,
                    "mentor": x.mentor.profile.user.first_name
                    + " "
                    + x.mentor.profile.user.last_name,
                    "type": "workshop" if isinstance(x, Workshop) else "meeting",
                    "notes": x.notes if isinstance(x, Meeting) else None,
                    "topic": x.topic.topic_name if isinstance(x, Workshop) else None,
                },
                timetable,
            )
        )
        return Response(
            {"timetable": timetable, "nextFour": next4},
            content_type="application/json",
            status=status.HTTP_200_OK,
        )


class UserView(APIView):
    """View for handling getting a users names"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """GET request to get the users first and last name

        Args:
            request (Request): Empty body

        Returns:
            Response: Users first and last names
        """
        user_json = {
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        }
        return Response(user_json, status=status.HTTP_200_OK)


# Overrides function here: https://github.com/encode/django-rest-framework/blob/master/rest_framework/authtoken/views.py
class Login(ObtainAuthToken):
    """A view that authenticates a user via username and password credentials."""

    def post(self, request):
        """POST view that authenticates username and password sent.
        A token is created if successful, reprsenting state, and is to be used to access any restricted API endpoints.

        Args:
            request (Request): The request data, including 'username', 'last_name', 'first_name', and 'password'.

        Returns:
            Response: A Response containing the user's id and now created token.
        """
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {
                "user_id": user.pk,
                "token": token.key,
            }
        )


class Settings(APIView):
    """A view that allows users to directly change certain attributes or relations in the database."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Gets a list of all available business area. Mainly so the frontend has a way of showing users other possible choices.

        Args:
            request (Request): Empty body

        Returns:
            Response: A Response containing a JSON listing all business areas.
        """
        business_area_list = BusinessArea.objects.all()
        business_area_json = [
            {"business_name": ba.business_name, "business_id": ba.id}
            for ba in business_area_list
        ]
        return Response(business_area_json, content_type="application/json")

    def put(self, request):
        """Allows for either the username, password or business area to be updated, depending on the contents of the PUT request.
        NOTE: Passwords can only be updated if the 'password_old' sent matches the one currently in the database.

        Args:
            request (Request): The request body containing information that the user wants to change to.

        Returns:
            Response: A Response containing a message indicating success, with a 202 ACCEPTED status code object.

        Raises:
            HTTP_400 - BAD REQUEST
        """
        pk = request.user.id
        data = request.data

        response = ""
        return_status = status.HTTP_200_OK

        if data["username"] != "":
            user = User.objects.get(pk=pk)
            user.username = data["username"]
            user.save()
            response += "email updated  "

        if data["password_old"] != "" and data["password_new"] != "":
            user = User.objects.get(pk=pk)
            if user.check_password(data["password_old"]) is True:
                user.set_password(data["password_new"])
                user.save()
                response += "password updated  "
            else:
                return_status = status.HTTP_401_UNAUTHORIZED
                response += "old password was incorrect  "

        if data["businessArea"] != "":
            profile = Profile.objects.get(user=pk)
            newArea = BusinessArea.objects.get(pk=data["businessArea"])
            profile.businessArea = newArea
            profile.save()
            try:
                mentor = Mentor.objects.get(profile=profile)
                mentees = list(Mentee.objects.filter(mentor=mentor).iterator())
                invalid_mentees = list(
                    filter(
                        lambda x: x.profile.businessArea.business_name
                        == newArea.business_name,
                        mentees,
                    )
                )
                for mentee in invalid_mentees:
                    mentee.mentor = None
                    mentee.save()
                    new_notif = Notification(
                        profile=mentee.profile,
                        message=f"Your relationship with {str(mentor)} has ended because they are now in your business area",
                    )
                    new_notif.save()
                    new_notif = Notification(
                        profile=mentor.profile,
                        message=f"Your relationship with {str(mentee)} has ended because they are now in your business area",
                    )
                    new_notif.save()
            except Mentor.DoesNotExist:
                print("Not a mentor")

            try:
                mentee = Mentee.objects.get(profile=profile)
                mentor = mentee.mentor
                if (
                    mentor.profile.businessArea.business_name
                    == mentee.profile.businessArea.business_name
                ):
                    mentee.mentor = None
                    mentee.save()
                    new_notif = Notification(
                        profile=mentor.profile,
                        message=f"Your relationship with {str(mentee)} has ended because they are now in your business area",
                    )
                    new_notif.save()
                    new_notif = Notification(
                        profile=mentee.profile,
                        message=f"Your relationship with {str(mentor)} has ended because they are now in your business area",
                    )
                    new_notif.save()
            except Mentee.DoesNotExist:
                print("Not a mentee")

            response += "Business area updated  "

        return Response({"msg": response}, status=return_status)


class MenteeSelectTopics(APIView):
    """A view used after registering an account that picked Mentee.
    Allows for the selection of topics and mentor trait preferences, which is ultimately stored in the Mentee model
    """

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Gets a list of all available topics. Mainly so the frontend can display all possible topics to the user during selection.

        Args:
            request (Request): Empty body

        Returns:
            Response: A Response containing the topic list in JSON format.
        """
        topic_list = Topic.objects.all()
        topic_json = [
            {"id": topic.id, "topic": topic.topic_name} for topic in topic_list
        ]
        return Response(topic_json, content_type="application/json")

    def post(self, request):
        """Creates a mentee when given all topic preferences and trait rankings.

        Args:
            request (Request): The request data, which should contain a list of topics chosen as well as all ranking numbers.

        Returns:
            Response: A Response containing a message and a 201 CREATED status.
        """
        data = request.data
        profile = Profile.objects.get(user=request.user)

        try:
            new_mentee = Mentee(
                profile=profile,
                introvert_rank=data["introvert_rank"],
                extrovert_rank=data["extrovert_rank"],
                spontaneous_rank=data["spontaneous_rank"],
                planning_rank=data["planning_rank"],
                motivated_rank=data["motivated_rank"],
                material_delivery_rank=data["material_delivery_rank"],
            )

            new_mentee.save()
        except IntegrityError:
            new_mentee = Mentee.objects.get(profile=profile)

        new_mentee.topics.add(*dict(data)["topics"])
        new_mentee.save()
        return Response(
            {"msg": "Mentee successfully created!"}, status=status.HTTP_201_CREATED
        )


class GoalsView(APIView):
    """A view that handles the creation and maintenance of goals associated with a mentee."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Gets the list of goals associated with a mentee.

        Args:
            request (Request): Empty body

        Returns:
            Response: A Response containing a JSON with every goal retrieved.
        """
        profile = Profile.objects.get(user=request.user)
        mentee = Mentee.objects.get(profile=profile)
        goals = Goal.objects.filter(mentee=mentee)
        goals_json = [{"id": goal.id, "goal": goal.goal} for goal in goals]
        return Response(goals_json, content_type="application/json")

    def put(self, request):
        """Updates a mentee's goal according to PUT data sent in.

        Args:
            request (Request): The request data, containing the goal string to update to.

        Returns:
            Response: A Response containing a JSON containing a message, as well as a 200 OK status code object.
        """
        data = request.data
        profile = Profile.objects.get(user=request.user.id)
        mentee = Mentee.objects.get(profile=profile)
        current_goal = Goal.objects.get(pk=data["goal"], mentee=mentee)
        current_goal.goal = data["new_goal"]
        current_goal.save()
        return Response({"msg": "goal succesfully updated"}, status=status.HTTP_200_OK)

    def post(self, request):
        """Creates a goal by a mentee.

        Args:
            request (Request): The request data, which should contain data with the key 'goal' to indicate the goal string being added.

        Returns:
            Response: A Response containing a success message and a 201 CREATED status code object.
        """
        data = request.data
        profile = Profile.objects.get(user=request.user.id)
        mentee = Mentee.objects.get(profile=profile)
        new_goal = Goal(mentee=mentee, goal=data["goal"])
        new_goal.save()
        return Response(
            {"msg": "goal succesfully added"}, status=status.HTTP_201_CREATED
        )

    def delete(self, request):
        """Deletes a goal by a goal's ID.

        Args:
            request (Request): id of the 'goal' being deleted

        Returns:
            Response: A Response containing a message and a 204 NO CONTENT status code.
        """
        data = request.data
        goal = Goal.objects.get(pk=data["goal"])
        goal.delete()
        return Response({"msg": "goal deleted"}, status=status.HTTP_204_NO_CONTENT)


class MyMentorView(APIView):
    """View for handling the myMentor endpoint"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def has_feedback(self, meeting):
        try:
            _ = MenteeToMentorFeedback.objects.get(meeting=meeting)
            return True
        except MenteeToMentorFeedback.DoesNotExist:
            return False

    def get(self, request):
        """Get request for getting the data needed for the myMentor page

        Args:
            request (Request): Empty body

        Returns:
            Response: contains the mentees mentor, upcoming meetings, goals, and topics
        """
        profile = Profile.objects.get(user=request.user)
        try:
            mentee = Mentee.objects.get(profile=profile)
        except Mentee.DoesNotExist:
            return Response(
                {"msg": "Not registered as a mentee"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if mentee.mentor is not None:
            mentees_mentor = mentee.mentor
            mentees_mentor_json = {
                "email": mentees_mentor.profile.user.username,
                "mentor": str(mentees_mentor),
                "id": mentees_mentor.id,
            }
            timezone = pytz.timezone("Europe/London")
            meetings = Meeting.objects.filter(
                mentor=mentees_mentor,
                mentee=mentee,
                finish__range=[
                    timezone.localize(datetime(year=2000, month=1, day=1)),
                    timezone.localize(datetime.now()),
                ],
            )
            meetings_json = [
                {
                    "id": m.id,
                    "start": str(m.time),
                    "finish": str(m.finish),
                    "notes": m.notes,
                    "feedback": self.has_feedback(m),
                }
                for m in meetings
            ]
            topics_json = [
                {"topic": str(topic)}
                for topic in set(mentee.topics.all()).intersection(
                    mentees_mentor.topics.all()
                )
            ]
            goals = Goal.objects.filter(mentee=mentee)
            goals_json = {
                "completed": [{"goal": goal.goal} for goal in goals if goal.completed],
                "not_completed": [
                    {"goal": goal.goal} for goal in goals if not goal.completed
                ],
            }

            resp_json = {
                "mentor": mentees_mentor_json,
                "meetings": meetings_json,
                "topics": topics_json,
                "goals": goals_json,
            }
            return Response(resp_json, content_type="application/json")
        else:
            return Response(
                {"msg": "You don't have a mentor"},
                content_type="application/json",
                status=status.HTTP_403_FORBIDDEN,
            )

    def put(self, request):
        """End mentee mentor relationship

        Args:
            request (Request): Empty body

        Returns:
            Response: Message informing user the mentee mentor relationship has ended
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        mentee = Mentee.objects.get(profile=profile)
        mentor = Mentor.objects.get(id=mentee.mentor.id)
        mentee.mentor = None
        mentee.save()

        notification = Notification(
            profile=mentor.profile,
            message=f"Your relationship with {user.first_name} {user.last_name} has been ended",
        )
        notification.save()

        return Response(
            {"msg": "Mentee Mentor relationship ended"},
            content_type="application/json",
            status=status.HTTP_200_OK,
        )


class MentorFeedbackView(APIView):
    """A view that handles feedback from the mentor's perspective (Mentor -> Mentee)."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        """Creates a new MentorToMenteeFeedback object from the given POST data and stores it in the database.

        Args:
            request (Request): The request data.

        Returns:
            Response: A Response containing a 201 CREATED status object.
        """
        data = request.data
        meeting = Meeting.objects.get(pk=data["meeting"])
        new_feedback = MentorToMenteeFeedback(
            meeting=meeting, feedback=data["feedback"]
        )
        new_feedback.save()
        return Response(status=status.HTTP_201_CREATED)


class MenteeFeedbackView(APIView):
    """A view that handles feedback from the Mentee's perspective (Mentee -> Mentor)"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        """Creates a new MenteeToMentorFeedback object from the given POST data and stores it in the database.
        Based on the ratings provided, this subsequently updates the mentioned mentor's current ratings in the database.

        Args:
            request (Request): The request data.

        Returns:
            Response: A Response containing a success message and a 201 CREATED status object.

        Raises:
            HTTP_400: BAD REQUEST
        """
        print(request.data)
        data = request.data
        meeting = Meeting.objects.get(pk=data["meeting"])
        new_feedback = MenteeToMentorFeedbackSerializer(data=data)
        print(new_feedback.is_valid())
        if not new_feedback.is_valid():
            return Response(
                {"msg": "Invalid feedback provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if MenteeToMentorFeedback.objects.filter(meeting=data["meeting"]).count() != 0:
            return Response(
                {"msg": "Feedback has already provided for this meeting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_feedback.save()

        # Update mentor's ratings
        mentor = meeting.mentor
        # Take ratings from last 5 meetings with this mentor that have associated MenteetoMentorFeedback
        feedback = list(
            MenteeToMentorFeedback.objects.filter(meeting__mentor=mentor)
            .order_by("-meeting__time")
            .iterator()
        )[:5]
        traits = {
            "introvert": 0.0,
            "extrovert": 0.0,
            "spontaneous": 0.0,
            "planning": 0.0,
            "motivated": 0.0,
            "material_delivery": 0.0,
        }

        for f in feedback:
            traits["introvert"] += f.introvert
            traits["extrovert"] += f.extrovert
            traits["spontaneous"] += f.spontaneous
            traits["planning"] += f.planning
            traits["motivated"] += f.motivated
            traits["material_delivery"] += f.material_delivery

        mentor.introvert = traits["introvert"] / len(feedback)
        mentor.extrovert = traits["extrovert"] / len(feedback)
        mentor.spontaneous = traits["spontaneous"] / len(feedback)
        mentor.planning = traits["planning"] / len(feedback)
        mentor.motivated = traits["motivated"] / len(feedback)
        mentor.material_delivery = traits["material_delivery"] / len(feedback)
        mentor.save()

        return Response({"msg": "added feedback"}, status=status.HTTP_201_CREATED)


class NotificationView(APIView):
    """View to handle notifications"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Gets all of the users notifications

        Args:
            request (Request): Empty body

        Returns:
            Response: List of all notifications [msg]
        """
        profile = Profile.objects.get(user=request.user)
        notifications = list(
            Notification.objects.filter(profile=profile).order_by("pk").iterator()
        )
        notifications_json = [{"msg": notif.message} for notif in notifications]
        return Response(notifications_json, status=status.HTTP_200_OK)


class WorkshopView(APIView):
    """A view for handling the creation and maintenance of workshops."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def put(self, request):
        """Books a mentee into a workshop after checking this would have no conflicts with their timetable.

        Args:
            request (request): The request data, containing the ID of the workshop to be booked.

        Returns:
            Response: A Response containing a 200 OK status object.

        Raises:
            HTTP_400: BAD REQUEST when trying to book a conflicting workshop. Also returns an error message.
        """
        data = request.data
        workshop = Workshop.objects.get(pk=data["workshop"])
        user = request.user
        profile = Profile.objects.get(user=user)
        timetable = []
        mentee = Mentee.objects.get(profile=profile)
        meetings = list(
            Meeting.objects.filter(mentee=mentee, is_accepted=True).iterator()
        )
        workshops = list(Workshop.objects.filter(mentees__id=mentee.id).iterator())
        timetable += meetings
        timetable += workshops
        for event in timetable:
            time = (event.time, event.finish)
            workshop_time = (workshop.time, workshop.finish)
            if check_overlap(time, workshop_time):
                return Response(
                    {"msg": "Overbooked"}, status=status.HTTP_400_BAD_REQUEST
                )
        workshop.mentees.add(Mentee.objects.get(pk=mentee.id))
        workshop.save()
        return Response(status=status.HTTP_200_OK)

    def get(self, request):
        """Gets current workshops whose topics intersect with the requesting user's topics.

        Args:
            request (Request): The request data.

        Returns:
            Response: A Response containing a JSON list of workshops recommended by the system to the user.
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        workshops = list(Workshop.objects.all().iterator())
        suggested_workshops = []
        for workshop in workshops:
            workshop_topic = workshop.topic
            mentee = Mentee.objects.get(profile=profile)
            mentee_topics = list(mentee.topics.iterator())
            if (
                workshop_topic in mentee_topics
                and mentee not in workshop.mentees.all()
                and workshop.mentor.profile.user != user
            ):
                suggested_workshops.append(workshop)
        suggested_workshop_json = [
            {
                "start": work.time,
                "finish": work.finish,
                "topic": str(work.topic),
                "mentor": str(work.mentor),
                "id": work.pk,
            }
            for work in suggested_workshops
        ]
        return Response(suggested_workshop_json)

    def post(self, request):
        """Creates a brand new workshop lead by a requesting mentor after checking there is no conflicts in their timetable.

        Args:
            request (Request): The request data, containing the data required to create the workshop such as its time and topics.

        Returns:
            Response: A Response containing a 201 CREATED status object.

        Raises:
            HTTP_400: BAD REQUEST when trying to create a conflicitng workshop. Also returns an error message.
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        mentor = Mentor.objects.get(profile=profile)
        workshop_data = {key: value for key, value in request.data.items()}
        workshop_data["topic"] = Topic.objects.get(topic_name=workshop_data["topic"]).id
        workshop_data["mentor"] = mentor.id
        new_workshop = WorkshopSerializer(data=workshop_data)
        if new_workshop.is_valid():
            new_workshop = new_workshop.save()
            timetable = []
            meetings = list(
                Meeting.objects.filter(mentor=mentor, is_accepted=True).iterator()
            )
            workshops = list(Workshop.objects.filter(mentor__id=mentor.id).iterator())
            timetable += meetings
            timetable += workshops
            timetable.remove(new_workshop)
            for event in timetable:
                time = (event.time, event.finish)
                workshop_time = (new_workshop.time, new_workshop.finish)
                if check_overlap(time, workshop_time):
                    new_workshop.delete()
                    return Response(
                        {"msg": "Overbooked"}, status=status.HTTP_400_BAD_REQUEST
                    )
            return Response(status=status.HTTP_201_CREATED)
        return Response({"msg": "Invalid workshop"}, status=status.HTTP_400_BAD_REQUEST)


class MeetingView(APIView):
    """View to deal with the mentor accepting/rejected meetings."""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        """Post request to request a meeting

        Args:
            request (Request): Meeting 'start' time,
                               Meeting 'finish' time,
                               Meeting 'notes'

        Returns:
            Response: A message informing the user whether the meeting has been requested succesfully
        """

    def put(self, request):
        """Update meeting based on whether a mentor accepts or not.

        Args:
            request (Request): 'meeting' id and whether the meeting was 'accepted' or not.
                                If the meeting was not accepted a 'message' is sent to the mentee

        Returns:
            Response: Msg informing the user whether the meeting was accepted or rejected
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        isMentor = list(Mentor.objects.filter(profile=profile).iterator())

        if isMentor:
            data = request.data
            meeting = Meeting.objects.get(pk=data["meeting"])
            if data["accepted"] and not check_mentor_timetable(
                Mentor.objects.get(profile=profile), (meeting.time, meeting.finish)
            ):
                meeting.is_accepted = True
                meeting.save()
                return Response({"msg": "Meeting accepted"}, status=status.HTTP_200_OK)

            elif data["accepted"] and check_mentor_timetable(
                Mentor.objects.get(profile=profile), (meeting.time, meeting.finish)
            ):
                return Response(
                    {"msg": "Overbooked"}, status=status.HTTP_400_BAD_REQUEST
                )
            else:
                mentee = meeting.mentee
                meeting.delete()
                new_notification = Notification(
                    profile=mentee.profile, message=data["message"]
                )
                new_notification.save()
                return Response(
                    {"msg": "Meeting rejected; notification sent"},
                    status=status.HTTP_200_OK,
                )
        return Response({"Bad request"}, status=status.HTTP_400_BAD_REQUEST)


class MenteeStatus(APIView):
    """View to determine users mentee status"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Get request to determine the status of a users mentee journey

        Args:
            request (Request): Empty body

        Returns:
            Response: 2 if a User is a mentee and has a mentor,
                      1 if a user is a mentee and does not have a mentor,
                      0 if user is not a mentee
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        try:
            mentee = Mentee.objects.get(profile=profile)
            menteeStatus = 1
            if mentee.mentor is not None:
                menteeStatus = 2
        except Mentee.DoesNotExist:
            menteeStatus = 0

        return Response({"status": menteeStatus}, content_type="application/json")


class MentorStatus(APIView):
    """View to determine whether a user is a mentor or not"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Returns whether the user is a mentor or not

        Args:
            request (Request): empty boyd

        Returns:
            Response: 1 if user is a mentor, 0 otherwise
        """
        user = request.user
        profile = Profile.objects.get(user=user)
        try:
            Mentor.objects.get(profile=profile)
            mentor_status = 1
        except Mentor.DoesNotExist:
            mentor_status = 0

        return Response({"status": mentor_status}, content_type="application/json")


class MyMentees(APIView):
    """"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """GET THERE MENTEES, SUGGESTED WORKSHOPS TO CREATE, MEETING REQUESTS"""
        profile = Profile.objects.get(user=request.user)
        mentor = Mentor.objects.get(profile=profile)
        mentor_mentees = list(Mentee.objects.filter(mentor=mentor).iterator())
        mentor_mentees_json = [
            {
                "id": mentee.id,
                "mentee": str(mentee),
                "email": mentee.profile.user.username,
                "business": str(mentee.profile.businessArea),
            }
            for mentee in mentor_mentees
        ]
        meeting_requests = list(
            Meeting.objects.filter(mentor=mentor, is_accepted=False).iterator()
        )
        meeting_requests_json = [
            {
                "id": meeting.id,
                "mentee": str(meeting.mentee),
                "time": meeting.time,
                "finish": meeting.finish,
                "notes": meeting.notes,
            }
            for meeting in meeting_requests
        ]
        topics = list(mentor.topics.all().iterator())
        suggested_topics = []
        for topic in topics:
            # Checks mentor's topics against every other mentee and mentor, and keeps count of who has that topic.
            # For each topic, if the ratio of mentor:mentee who has the topic is 4:3, that topic is considered "high demand".
            # A Notification therefore is sent suggesting the mentor to create a workshop for that topic.
            mentee_count = 0
            mentor_count = 0

            all_mentees = list(Mentee.objects.all().iterator())
            all_mentors = list(Mentor.objects.all().iterator())
            for mentee in all_mentees:
                if topic in mentee.topics.iterator():
                    mentee_count += 1
            for m in all_mentors:
                if topic in m.topics.iterator():
                    mentor_count += 1

            if (mentor_count / (mentee_count + 0.1)) < (4 / 3) and not list(
                Workshop.objects.filter(mentor=mentor, topic=topic).iterator()
            ):
                suggested_topics.append(topic)
        suggested_topics_json = [
            {"id": topic.id, "topic_name": topic.topic_name}
            for topic in suggested_topics
        ]
        full_json = {
            "meeting_requests": meeting_requests_json,
            "mentees": mentor_mentees_json,
            "suggested_topics": suggested_topics_json,
        }
        return Response(full_json, content_type="application/json")

    def put(self, request):
        """change capacity"""
        data = request.data
        cap = data["new_capacity"]
        profile = Profile.objects.get(user=request.user)
        mentor = Mentor.objects.get(profile=profile)
        mentor.mentee_capacity = cap
        mentor.save()
        return Response(
            {"msg": f"capacity updated to {cap}"}, status=status.HTTP_200_OK
        )


class MyMentee(APIView):
    def has_feedback(self, meeting):
        try:
            _ = MentorToMenteeFeedback.objects.get(meeting=meeting)
            return True
        except MentorToMenteeFeedback.DoesNotExist:
            return False

    def get(self, request):
        """Get request for getting the data needed for the myMentor page

        Args:
            request (Request): Empty body

        Returns:
            Response: contains the mentees mentor, upcoming meetings, goals, and topics
        """
        profile = Profile.objects.get(user=request.user)
        try:
            mentor = Mentor.objects.get(profile=profile)
        except Mentor.DoesNotExist:
            return Response(
                {"msg": "Not registered as a mentor"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            mentors_mentee = Mentee.objects.get(id=request.GET.get("mentee"))
            if mentors_mentee.mentor != mentor:
                return Response(
                    {"msg": "This is not your mentee"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except Mentee.DoesNotExist:
            return Response(
                {"msg": "invalid Mentee"}, status=status.HTTP_400_BAD_REQUEST
            )

        mentors_mentee_json = {
            "mentee": str(mentors_mentee),
            "email": mentors_mentee.profile.user.username,
            "id": mentors_mentee.id,
        }
        timezone = pytz.timezone("Europe/London")
        meetings = Meeting.objects.filter(
            mentor=mentor,
            mentee=mentors_mentee,
            finish__range=[
                timezone.localize(datetime(year=2000, month=1, day=1)),
                timezone.localize(datetime.now()),
            ],
        )
        meetings_json = [
            {
                "id": m.id,
                "start": m.time,
                "finish": m.finish,
                "notes": m.notes,
                "feedback": self.has_feedback(m),
            }
            for m in meetings
        ]  # check for whether feedback has been given
        topics_json = [
            {"topic": str(topic)}
            for topic in set(mentors_mentee.topics.all()).intersection(
                set(mentor.topics.all())
            )
        ]
        goals = Goal.objects.filter(mentee=mentors_mentee)
        goals_json = {
            "completed": [{"goal": goal.goal} for goal in goals if goal.completed],
            "not_completed": [
                {"goal": goal.goal} for goal in goals if not goal.completed
            ],
        }

        resp_json = {
            "mentor": mentors_mentee_json,
            "meetings": meetings_json,
            "topics": topics_json,
            "goals": goals_json,
        }
        return Response(resp_json, content_type="application/json")

    def put(self, request):
        """End mentee mentor relationship

        Args:
            request (Request): Empty body

        Returns:
            Response: Message informing user the mentee mentor relationship has ended
        """
        user = request.user
        mentee = Mentee.objects.get(id=request.data["mentee"])
        mentee.mentor = None
        mentee.save()

        notification = Notification(
            profile=mentee.profile,
            message=f"Your relationship with {user.first_name} {user.last_name} has been ended",
        )
        notification.save()

        return Response(
            {"msg": "Mentee Mentor relationship ended"},
            content_type="application/json",
            status=status.HTTP_200_OK,
        )


class MentorSelectTopics(APIView):
    """View to allow for creating Mentors"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        """Gets all topics available on the system

        Args:
            request (Request): Empty body

        Returns:
            Response: All topics available
        """
        topic_list = Topic.objects.all()
        topic_json = [{"id": topic.id, "topic": str(topic)} for topic in topic_list]
        return Response(topic_json, content_type="application/json")

    def post(self, request):
        """Post request to create a mentor

        Args:
            request (Request): the 'topics' the mentor wants to teach and the 'capacity' of mentees
            they are willing to teach

        Returns:
            Response: Message informing that a mentor has been created
        """
        data = request.data
        profile = Profile.objects.get(user=request.user)
        new_mentor = Mentor(profile=profile, mentee_capacity=data["capacity"])

        new_mentor.save()
        new_mentor.topics.set(data["topics"])
        new_mentor.topics.update()
        return Response(
            {"msg": "Mentor successfully created!"}, status=status.HTTP_201_CREATED
        )


class MentorSelection(APIView):
    """"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):  # return a dictionary of 3 suggested mentors
        """gets 3 recommended mentors for the user who sent the request

        Args:
            request (Request): Empty body

        Returns:
            Response: 3 recommended mentors
        """
        profile = Profile.objects.get(user=request.user)
        mentee = Mentee.objects.get(profile=profile)
        suggestions = self.generate_suggestions(mentee)
        suggestions_json = [
            {
                "id": mentor.id,
                "mentor": str(mentor),
                "email": mentor.profile.user.username,
                "department": str(mentor.profile.businessArea),
                "rating": round(
                    average(
                        [
                            mentor.introvert,
                            mentor.extrovert,
                            mentor.spontaneous,
                            mentor.planning,
                            mentor.motivated,
                            mentor.material_delivery,
                        ]
                    ),
                    1,
                ),
            }
            for mentor in suggestions
        ]
        return Response(suggestions_json, content_type="application/json")

    def post(self, request):  # pairs mentee with selected mentor.
        """post request to select which mentor the mentee wants

        Args:
            request (Request): The 'mentor' being selected by the mentee

        Returns:
            Response: whether the mentor was added succesfully
        """
        mentor_id = request.data["mentor"]
        mentor = Mentor.objects.get(id=mentor_id)
        profile = Profile.objects.get(user=request.user)
        mentee = Mentee.objects.get(profile=profile)
        mentee.mentor = mentor
        mentee.save()
        return Response({"msg": "Mentor successfully added"}, status=status.HTTP_200_OK)

    def generate_suggestions(self, mentee):
        """generates the suggested mentors for the mentee

        Args:
            mentee (Mentee): The mentee we are generating suggestions for

        Returns:
            [Mentor]: list of suggested mentors (No larger than 3)
        """
        mentee_business_area = mentee.profile.businessArea
        mentors = list(
            Mentor.objects.exclude(
                profile__businessArea=mentee_business_area
            ).iterator()
        )
        available_mentors = []
        for mentor in mentors:
            mentee_count = Mentee.objects.filter(mentor=mentor).count()
            if mentee_count < mentor.mentee_capacity:
                available_mentors.append(mentor)
        toReturn = nlargest(3, available_mentors, key=lambda x: mentor_score(x, mentee))
        toReturn = list(
            filter(
                lambda x: set(x.topics.all()).intersection(mentee.topics.all()),
                toReturn,
            )
        )
        return toReturn


class MeetingBookingView(APIView):
    """View to allow for booking meetings"""

    authentication_classes = [ExpiringTokenAuthentication]
    permission_classes = [
        IsAuthenticated,
    ]

    def post(self, request):
        """Post request to book a meeting as a mentee. If the meeting is valid and does
        not overlap with any other bookings the mentee has, the meeting is requested.

        Args:
            request (Request): 'start' time of meeting, 'finish' time of meeting, 'notes' for meeting

        Returns:
            Response: API Response informing the user whether the meeting was created succesfully or not
        """
        start = request.data["start"]
        finish = request.data["finish"]
        notes = request.data["notes"]
        user = request.user
        profile = Profile.objects.get(user=user)
        mentee = Mentee.objects.get(profile=profile)
        mentor = mentee.mentor

        meeting = MeetingSerializer(
            data={
                "time": start,
                "finish": finish,
                "mentor": mentor.id,
                "mentee": mentee.id,
                "notes": notes,
            }
        )
        if meeting.is_valid():
            m = meeting.save()
            start = m.time
            finish = m.finish
            m.delete()
            if check_mentee_timetable(mentee, (start, finish)):
                return Response(
                    {"msg": "Overbooked"}, status=status.HTTP_400_BAD_REQUEST
                )
            meeting = meeting.save()
            return Response(
                {"msg": "Meeting has been requested"}, status=status.HTTP_201_CREATED
            )
        return Response({"msg": meeting.errors}, status=status.HTTP_400_BAD_REQUEST)


def mentor_score(mentor, mentee):
    """Calculates the "score" at which we order mentors to generate suggestions

    Args:
        mentor (Mentor): Mentor we are calculating a score for
        mentee (Mentee): The mentee whose ranks we are using to generate the score

    Returns:
        (Int, Float): Number of matching topics, and The score for the mentor
    """
    weights = {
        "introvert": weight(mentee.introvert_rank),
        "extrovert": weight(mentee.extrovert_rank),
        "spontaneous": weight(mentee.spontaneous_rank),
        "planning": weight(mentee.planning_rank),
        "motivated": weight(mentee.motivated_rank),
        "material_delivery": weight(mentee.material_delivery_rank),
    }
    matching_topics = mentee.topics.all().intersection(mentor.topics.all())
    preference_score = mentor.introvert * weights["introvert"]
    preference_score += mentor.extrovert * weights["extrovert"]
    preference_score += mentor.spontaneous * weights["spontaneous"]
    preference_score += mentor.planning * weights["planning"]
    preference_score += mentor.motivated * weights["motivated"]
    preference_score += mentor.material_delivery * weights["material_delivery"]
    return (matching_topics.count(), preference_score)


def weight(rank):
    """calculates the weighting according to the rank

    Args:
        rank (Int): the rank

    Returns:
        Float: (rank-6)/24
    """
    return (7 - rank) / 24


def check_mentee_timetable(mentee, attempted_booking):
    """checks whether the attempted booking overlaps with any other bookings the mentee has

    Args:
        mentee (Mentee): the mentee attempting to book
        attempted_booking (Workshop/Meeting): the meeting/workshop the mentee is attempting to book

    Returns:
        Bool: True if there is a conflict, False otherwise
    """
    timetable = []
    meetings = list(Meeting.objects.filter(mentee=mentee).iterator())
    workshops = list(Workshop.objects.filter(mentees__id=mentee.id).iterator())
    timetable += meetings
    timetable += workshops
    for event in timetable:
        time = (event.time, event.finish)
        if check_overlap(time, attempted_booking):
            return True
    return False


def check_mentor_timetable(mentor, attempted_booking):
    """checks whether the attempted booking overlaps with any other bookings the mentee has

    Args:
        mentee (Mentee): the mentee attempting to book
        attempted_booking (Workshop/Meeting): the meeting/workshop the mentee is attempting to book

    Returns:
        Bool: True if there is a conflict, False otherwise
    """
    timetable = []
    meetings = list(Meeting.objects.filter(mentor=mentor, is_accepted=True).iterator())
    workshops = list(Workshop.objects.filter(mentor__id=mentor.id).iterator())
    timetable += meetings
    timetable += workshops
    for event in timetable:
        time = (event.time, event.finish)
        if check_overlap(time, attempted_booking):
            return True
    return False


def check_overlap(time1, time2):
    """
    finds whether time1=(start1, end1) overlaps with time2=(start2, end2)
    returns true if there is no overlap

    Args:
        time1 ((DateTime, DateTime)): a time
        time2 ((DateTime, DateTime)): another time

    Returns:
        Bool: True if theses times overlap, False otherwise
    """
    earliest = min(time1, time2)
    latest = max(time1, time2)
    return earliest[1] > latest[0]
