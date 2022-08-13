from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
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


class ModelCreationTests(TestCase):
    """Test case to ensure all models are created to work as intended"""

    def create_user(self, email):
        """Create a user with the given email and first/last name 'test'/'test'"""
        new_user = User(username=email, first_name="test", last_name="test")
        new_user.set_password("test")
        new_user.save()
        return new_user

    def create_bus(self, name):
        """Create a business area with the given name"""
        new_bus_area = BusinessArea(business_name=name)
        new_bus_area.save()
        return new_bus_area

    def create_profile(self, email, bus):
        """Create a profile with the given email and business area (bus)."""
        new_user = self.create_user(email)
        new_bus_area = self.create_bus(bus)
        new_profile = Profile(user=new_user, businessArea=new_bus_area)
        new_profile.save()
        return new_profile

    def create_topic(self, topic_name):
        """create topic with name topic_name"""
        new_topic = Topic(topic_name=topic_name)
        new_topic.save()
        return new_topic

    def create_mentor(self, topics):
        """
        create a mentor with email "mentorman@m.com" who works in Business Area
        stonks. give mentor a set of topics and assign a mentee capacity of 5
        """
        new_profile = self.create_profile("mentorman@m.com", "stonks")
        cap = 5
        new_mentor = Mentor(profile=new_profile, mentee_capacity=cap)
        new_mentor.save()
        for t in topics:
            new_mentor.topics.add(t)
        new_mentor.save()
        return new_mentor

    def create_mentee(self, topics, email, bus):
        """
        create a mentee with the given email who works in the given business area (bus).
        give mentee a set of topics.
        """
        new_profile = self.create_profile(email, bus)
        new_mentee = Mentee(
            profile=new_profile,
            introvert_rank=1,
            extrovert_rank=2,
            spontaneous_rank=3,
            planning_rank=4,
            motivated_rank=5,
            material_delivery_rank=6,
        )
        new_mentee.save()
        for t in topics:
            new_mentee.topics.add(t)
        new_mentee.save()
        return new_mentee

    def test_user(self):
        """tests that when a user is created it is accessible from the ORM"""
        email = "test@test.com"
        self.create_user(email)

        retrieved_user = User.objects.get(username=email)
        self.assertEqual(email, retrieved_user.username)
        self.assertEqual("test", retrieved_user.first_name)
        self.assertEqual("test", retrieved_user.last_name)
        self.assertNotEqual("test", retrieved_user.password)

    def test_business_area(self):
        """tests that when a business area is created it is accessible from the ORM"""
        new_bus_area = self.create_bus("stonks")

        retrieved_bus_area = BusinessArea.objects.get(business_name="stonks")
        self.assertEqual(new_bus_area, retrieved_bus_area)

    def test_profile(self):
        """tests that when a profile is created it is accessible from the ORM"""
        new_profile = self.create_profile("test", "test")
        self.assertIn(new_profile, Profile.objects.all().iterator())

    def test_topic(self):
        """tests that when a topic is created it is accessible from the ORM"""
        new_topic = self.create_topic("stonks")
        self.assertIn(new_topic, Topic.objects.all().iterator())

    def test_mentor(self):
        """
        tests that when a mentor is created it is accessible from the ORM and their
        topics/traits are correct.
        """
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        new_mentor = self.create_mentor(topics[:2])
        self.assertIn(new_mentor, Mentor.objects.all().iterator())
        self.assertIn(topics[0], new_mentor.topics.all().iterator())
        self.assertIn(topics[1], new_mentor.topics.all().iterator())
        self.assertNotIn(topics[2], new_mentor.topics.all().iterator())
        self.assertEqual(3, new_mentor.extrovert)
        self.assertEqual(3, new_mentor.spontaneous)
        self.assertEqual(3, new_mentor.planning)
        self.assertEqual(3, new_mentor.motivated)
        self.assertEqual(3, new_mentor.material_delivery)

    def test_mentee(self):
        """
        tests that when a mentee is created it is accessible from the ORM and their
        fields are correct
        """
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        new_mentee = self.create_mentee(topics[:2], "menteeman", "bus1")
        mentor = self.create_mentor(topics)
        new_mentee.mentor = mentor  # THIS LINE MAY BE WRONG
        self.assertIn(new_mentee, Mentee.objects.all().iterator())
        self.assertIn(topics[0], new_mentee.topics.all().iterator())
        self.assertIn(topics[1], new_mentee.topics.all().iterator())
        self.assertNotIn(topics[2], new_mentee.topics.all().iterator())

    def test_goal(self):
        """tests that when a goal is created it is accessible from the ORM"""
        new_mentee = self.create_mentee([self.create_topic("css")], "mentee", "bus1")
        goal1 = Goal(mentee=new_mentee, goal="to win the lottery", completed=False)
        goal2 = Goal(mentee=new_mentee, goal="to get a 1st in cs261", completed=False)
        goal1.save()
        goal2.save()
        self.assertIn(goal1, Goal.objects.all().iterator())
        self.assertIn(goal2, Goal.objects.all().iterator())
        self.assertEqual(goal1.mentee, new_mentee)
        self.assertEqual(goal2.mentee, new_mentee)

    def test_meeting(self):
        """tests that when a meeting is created it is accessible from the ORM"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))

        mentor = self.create_mentor(topics)
        mentee = self.create_mentee(topics, "test@test.com", "bus1")
        meeting = Meeting(
            time=timezone.now(),
            finish=timezone.now() + timedelta(hours=1),
            mentor=mentor,
            mentee=mentee,
            notes="my note for this meeting",
            is_accepted=True,
        )
        meeting.save()
        self.assertIn(meeting, Meeting.objects.all().iterator())
        self.assertEqual(Meeting.objects.get(id=1).notes, "my note for this meeting")

    def test_workshop(self):
        """tests that when a workshop is created it is accessible from the ORM"""
        topic_list = ["css", "django", "react"]
        topics = list(map(self.create_topic, topic_list))
        mentee1 = self.create_mentee(topics[:2], "1", "bus1")
        mentee2 = self.create_mentee(topics[1:3], "2", "bus2")
        mentee3 = self.create_mentee(topics[:3], "3", "bus3")
        mentor = self.create_mentor(topics)

        new_workshop = Workshop(
            time=timezone.now(),
            finish=timezone.now() + timedelta(hours=1),
            mentor=mentor,
            topic=topics[0],
        )
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
        """tests that when a mentor to mentee feedback form is created it is accessible from the ORM"""
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

        new_feedback = MentorToMenteeFeedback(  # noqa: F821
            meeting=meeting, feedback="You did good, I guess"
        )
        new_feedback.save()

        self.assertIn(
            new_feedback, MentorToMenteeFeedback.objects.all().iterator()  # noqa: F821
        )

    def test_mentee_to_mentor_feedback(self):
        """tests that when a mentor to mentee feedback form is created it is accessible from the ORM"""
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

        new_feedback = MenteeToMentorFeedback(  # noqa: F821
            meeting=meeting,
            introvert=1,
            extrovert=4,
            spontaneous=2,
            planning=5,
            motivated=5,
            material_delivery=3,
        )  # noqa: F841, F821
        new_feedback.save()

        self.assertIn(
            new_feedback, MenteeToMentorFeedback.objects.all().iterator()  # noqa: F821
        )

    def test_notifications(self):
        """need to create test for notifications model"""
        profile = self.create_profile("test@test.com", "bus1")
        new_notif = Notification(  # noqa: F821
            profile=profile, message="This is your new notification"
        )
        new_notif.save()

        self.assertIn(new_notif, Notification.objects.all().iterator())  # noqa: F821
