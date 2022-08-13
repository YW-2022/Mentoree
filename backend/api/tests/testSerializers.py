from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from ..serializers import (
    UserSerializer,
    ProfileSerializer,
    TopicSerializer,
    BusinessAreaSerializer,
    MenteeSerializer,
    MentorSerializer,
    GoalSerializer,
    MeetingSerializer,
    WorkshopSerializer,
    NotificationSerializer,
    MentorToMenteeFeedbackSerializer,
    MenteeToMentorFeedbackSerializer,
)
from ..models import (
    BusinessArea,
    Profile,
    Topic,
    Mentee,
    Mentor,
    Goal,
    Meeting,
    Workshop,
    Notification,
    MenteeToMentorFeedback,
    MentorToMenteeFeedback,
)


class UserCreation:
    def create_user(name):
        try:
            u = User.objects.get(username=name + "@" + name + ".com")
        except User.DoesNotExist:
            u = User(
                username=name + "@" + name + ".com", first_name=name, last_name=name
            )
            u.set_password("test")
            u.save()
        return u


class BusinessAreaCreation:
    def create_ba(name):
        try:
            ba = BusinessArea.objects.get(business_name=name)
        except BusinessArea.DoesNotExist:
            ba = BusinessArea(business_name=name)
            ba.save()
        return ba


class ProfileCreation:
    def create_profile(name, business_area):
        user = UserCreation.create_user(name)
        ba = BusinessAreaCreation.create_ba(business_area)
        p = Profile(user=user, businessArea=ba)
        p.save()
        return p


class TopicCreation:
    def create_topic(name):
        try:
            topic = Topic.objects.get(topic_name=name)
        except Topic.DoesNotExist:
            topic = Topic(topic_name=name)
            topic.save()

        return topic


class MentorCreation:
    def create_mentor(name, business_area, topics, cap):
        profile = ProfileCreation.create_profile(name, business_area)
        topics = list(map(TopicCreation.create_topic, topics))
        mentor = Mentor(profile=profile, mentee_capacity=cap)
        mentor.save()
        mentor.topics.add(*topics)
        mentor.save()
        return mentor


class MenteeCreation:
    def create_mentee(name, business_area, topics):
        profile = ProfileCreation.create_profile(name, business_area)
        topics = list(map(TopicCreation.create_topic, topics))
        mentee = Mentee(profile=profile)
        mentee.save()
        mentee.topics.add(*topics)
        mentee.save()
        return mentee


class GoalCreation:
    def create_goal(goal, mentee):
        g = Goal(mentee=mentee, goal=goal)
        g.save()
        return g


class MeetingCreation:
    def create_meeting(mentee, mentor, notes, days, acc):
        meeting = Meeting(
            mentee=mentee,
            mentor=mentor,
            notes=notes,
            time=timezone.now() + timedelta(days=days),
            finish=timezone.now() + timedelta(hours=1) + timedelta(days=days),
            is_accepted=acc,
        )
        meeting.save()
        return meeting


class TokenCreation:
    def create_token(user):
        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/login/",
            data={"username": user + "@" + user + ".com", "password": "test"},
        )
        token = response.json()["token"]
        return token


class SerializerTest(TestCase):
    """Test case to ensure all serializers create and save objects correctly"""

    def create_user(self, name):
        """
        creates a user with username:name@name.com, first_name:name, last_name:name and password:name.
        attempts to use a serializer to create the user
        """
        user = {
            "username": name + "@" + name + ".com",
            "first_name": name,
            "last_name": name,
            "password": name,
        }
        serializer = UserSerializer(data=user)
        serializer.is_valid(raise_exception=True)
        new_user = serializer.save()
        return new_user

    def create_bus(self, name):
        """
        creates a user with business_name:name.
        attempts to use a serializer to create the business area.
        """
        bus_area = {"business_name": name}
        serializer = BusinessAreaSerializer(data=bus_area)
        serializer.is_valid(raise_exception=True)
        new_bus_area = serializer.save()
        return new_bus_area

    def create_profile(self, name, bus):
        """
        creates a profile using a user.id and businessarea.id.
        attempts to use a serializer to create the profile.
        """
        new_user = self.create_user(name)
        new_bus_area = self.create_bus(bus)
        serializer = ProfileSerializer(
            data={"user": new_user.id, "businessArea": new_bus_area.id}
        )
        serializer.is_valid(raise_exception=True)
        new_profile = serializer.save()
        return new_profile

    def create_topic(self, topic_name):
        """
        creates a topic using a topic name.
        attempts to use a serializer to create the topic.
        """
        topic = {"topic_name": topic_name}
        serializer = TopicSerializer(data=topic)
        serializer.is_valid(raise_exception=True)
        new_topic = serializer.save()
        return new_topic

    def create_mentor(self, topics):
        """
        creates a mentor using a profile.id and a list of topic ids and a capacity of 5.
        attempts to use a serializer to create the mentor.
        """
        topics = list(map(lambda x: x.id, topics))
        new_profile = self.create_profile("mentorman", "stonks")
        serializer = MentorSerializer(
            data={"profile": new_profile.id, "topics": [*topics], "mentee_capacity": 5}
        )
        serializer.is_valid(raise_exception=True)
        new_mentor = serializer.save()
        return new_mentor

    def create_mentee(self, topics, name, bus):
        """
        creates a mentee using a profile.id and a list of topic ids.
        attempts to use a serializer to create the mentee.
        """
        topics = list(map(lambda x: x.id, topics))
        new_profile = self.create_profile(name, bus)
        serializer = MenteeSerializer(
            data={
                "profile": new_profile.id,
                "topics": [*topics],
                "introvert_rank": 1,
                "extrovert_rank": 2,
                "spontaneous_rank": 3,
                "planning_rank": 4,
                "motivated_rank": 5,
                "material_delivery_rank": 6,
            }
        )
        serializer.is_valid(raise_exception=True)
        new_mentee = serializer.save()
        return new_mentee

    def test_user(self):
        """tests the user created using the serializer is saved correctly"""
        saved_user = self.create_user("test")
        self.assertEqual("test@test.com", saved_user.username)
        self.assertEqual("test", saved_user.first_name)
        self.assertEqual("test", saved_user.last_name)
        self.assertNotEqual("test", saved_user.password)
        self.assertIn(saved_user, User.objects.all().iterator())

    def test_business_area(self):
        """tests the business area created using the serializer is saved correctly"""
        new_bus_area = self.create_bus("stonks")

        retrieved_bus_area = BusinessArea.objects.get(business_name="stonks")
        self.assertEqual(new_bus_area, retrieved_bus_area)

    def test_profile(self):
        """tests the profile created using the serializer is saved correctly"""
        new_profile = self.create_profile("test", "test")
        self.assertIn(new_profile, Profile.objects.all().iterator())

    def test_topic(self):
        """tests the topic created using the serializer is saved correctly"""
        new_topic = self.create_topic("stonks")
        self.assertIn(new_topic, Topic.objects.all().iterator())

    def test_mentor(self):
        """tests the mentor created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        new_mentor = self.create_mentor(topics[:2])
        self.assertIn(new_mentor, Mentor.objects.all().iterator())
        self.assertIn(topics[0], new_mentor.topics.all().iterator())
        self.assertIn(topics[1], new_mentor.topics.all().iterator())
        self.assertNotIn(topics[2], new_mentor.topics.all().iterator())
        self.assertEqual(5, new_mentor.mentee_capacity)
        self.assertEqual(3, new_mentor.extrovert)
        self.assertEqual(3, new_mentor.spontaneous)
        self.assertEqual(3, new_mentor.planning)
        self.assertEqual(3, new_mentor.motivated)
        self.assertEqual(3, new_mentor.material_delivery)

    def test_mentee(self):
        """tests the mentee created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        new_mentee = self.create_mentee(topics[:2], "menteeman", "bus1")
        self.assertIn(new_mentee, Mentee.objects.all().iterator())
        self.assertIn(topics[0], new_mentee.topics.all().iterator())
        self.assertIn(topics[1], new_mentee.topics.all().iterator())
        self.assertNotIn(topics[2], new_mentee.topics.all().iterator())

    def test_goal(self):
        """tests the goal created using the serializer is saved correctly"""
        new_mentee = self.create_mentee([self.create_topic("css")], "mentee", "bus1")

        serializer = GoalSerializer(
            data={
                "mentee": new_mentee.id,
                "goal": "to win the lottery",
                "completed": False,
            }
        )
        serializer.is_valid(raise_exception=True)
        goal1 = serializer.save()
        serializer = GoalSerializer(
            data={
                "mentee": new_mentee.id,
                "goal": "to get a 1st in cs261",
                "completed": False,
            }
        )
        serializer.is_valid(raise_exception=True)
        goal2 = serializer.save()
        self.assertIn(goal1, Goal.objects.all().iterator())
        self.assertIn(goal2, Goal.objects.all().iterator())
        self.assertEqual(goal1.mentee, new_mentee)
        self.assertEqual(goal2.mentee, new_mentee)

    def test_meeting(self):
        """tests the meeting created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        mentee = self.create_mentee(topics, "1", "bus1")
        mentor = self.create_mentor(topics)
        serializer = MeetingSerializer(
            data={
                "time": timezone.now(),
                "finish": timezone.now() + timedelta(hours=1),
                "mentee": mentee.id,
                "mentor": mentor.id,
                "is_accepted": True,
                "notes": "my notes on meeting",
            }
        )
        serializer.is_valid(raise_exception=True)
        meeting = serializer.save()
        self.assertIn(meeting, Meeting.objects.all().iterator())

    def test_workshop(self):
        """tests the workshop created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))
        mentee1 = self.create_mentee(topics[:2], "1", "bus1")
        mentee2 = self.create_mentee(topics[1:3], "2", "bus2")
        mentee3 = self.create_mentee(topics[:3], "3", "bus3")
        mentor = self.create_mentor(topics)

        serializer = WorkshopSerializer(
            data={
                "time": timezone.now(),
                "finish": timezone.now() + timedelta(hours=1),
                "mentor": mentor.id,
                "topic": topics[0].id,
            }
        )
        serializer.is_valid(raise_exception=True)
        new_workshop = serializer.save()
        # test workshop has empty mentees array

        new_workshop.save()
        new_workshop.mentees.add(mentee1)
        new_workshop.mentees.add(mentee2)
        new_workshop.mentees.add(mentee3)
        new_workshop.save()

        self.assertIn(new_workshop, Workshop.objects.all().iterator())
        self.assertIn(new_workshop, mentee1.workshops.all().iterator())
        self.assertIn(new_workshop, mentee2.workshops.all().iterator())
        self.assertIn(new_workshop, mentee3.workshops.all().iterator())

    def test_mentor_to_mentee_feedback(self):
        """tests the mentor to mentee feedback created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))
        mentee = self.create_mentee(topics, "1", "bus1")
        mentor = self.create_mentor(topics)
        meeting = Meeting(
            time=timezone.now(),
            finish=timezone.now() + timedelta(hours=1),
            mentor=mentor,
            mentee=mentee,
            notes="my note for this meeting",
            is_accepted=True,
        )
        meeting.save()

        new_feedback = MentorToMenteeFeedbackSerializer(  # noqa: F821
            data={"meeting": meeting.id, "feedback": "You did good, I guess"}
        )
        new_feedback.is_valid(raise_exception=True)
        feedback_obj = new_feedback.save()
        self.assertEquals(
            MentorToMenteeFeedback.objects.get(pk=meeting.id),
            feedback_obj,  # noqa: F821
        )

    def test_mentee_to_mentor_feedback(self):
        """tests the mentee to mentor feedback created using the serializer is saved correctly"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))
        mentee = self.create_mentee(topics, "1", "bus1")  # noqa: F841
        mentor = self.create_mentor(topics)  # noqa: F841
        meeting = Meeting(
            time=timezone.now(),
            finish=timezone.now() + timedelta(hours=1),
            mentor=mentor,
            mentee=mentee,
            notes="my note for this meeting",
            is_accepted=True,
        )
        meeting.save()

        new_feedback = MenteeToMentorFeedbackSerializer(  # noqa: F821
            data={
                "meeting": meeting.id,
                "introvert": 1,
                "extrovert": 4,
                "spontaneous": 2,
                "planning": 5,
                "motivated": 5,
                "material_delivery": 3,
            }
        )
        new_feedback.is_valid(raise_exception=True)
        feedback_obj = new_feedback.save()

        self.assertEqual(
            feedback_obj,
            MenteeToMentorFeedback.objects.get(pk=meeting.id),  # noqa: F821
        )
        self.assertEqual(
            MenteeToMentorFeedback.objects.get(id=1).meeting.notes,
            "my note for this meeting",
        )

    def test_notifications(self):
        """tests the notification created using the serializer is saved correctly"""
        profile = self.create_profile("test@test.com", "bus1")
        new_notif = NotificationSerializer(  # noqa: F821
            data={"profile": profile.id, "message": "This is your new notification"}
        )
        new_notif.is_valid(raise_exception=True)
        notif = new_notif.save()

        self.assertIn(notif, Notification.objects.all().iterator())  # noqa: F821
