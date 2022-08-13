from django.test import TestCase, Client
from rest_framework import status
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from ..models import (
    BusinessArea,
    MentorToMenteeFeedback,
    Profile,
    Topic,
    Mentee,
    Mentor,
    Goal,
    Meeting,
    Workshop,
    Notification,
    MenteeToMentorFeedback,
    # MentorToMenteeFeedback,
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


class NotificationCreation:
    def create_notification(msg, profile):
        notification = Notification(profile=profile, message=msg)
        notification.save()
        return notification


class WorkshopCreation:
    def create_workshop(mentor, mentees, days, topic):
        workshop = Workshop(
            time=timezone.now() + timedelta(days=days),
            finish=timezone.now() + timedelta(hours=1) + timedelta(days=days),
            mentor=mentor,
            topic=topic,
        )
        workshop.save()
        workshop.mentees.add(*mentees)
        workshop.save()
        return workshop


class TokenCreation:
    def create_token(user):
        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/login/",
            data={"username": user + "@" + user + ".com", "password": "test"},
        )
        token = response.json()["token"]
        return token


class RegisterUser(TestCase):
    """This test class ensures that the process of registering a user works as intended"""

    link = "http://127.0.0.1:8000/api/register/"

    def test_get(self):
        """Tests that business areas are succesfully retrieved on a get request"""
        businesses = ["b1", "b2", "b3"]
        businesses = list(map(BusinessAreaCreation.create_ba, businesses))

        client = Client()
        response = client.get(self.link)
        data = response.json()

        self.assertIn(
            businesses[0].business_name,
            list(map(lambda x: x["name"], data["businesses"])),
        )
        self.assertIn(
            businesses[1].business_name,
            list(map(lambda x: x["name"], data["businesses"])),
        )
        self.assertIn(
            businesses[2].business_name,
            list(map(lambda x: x["name"], data["businesses"])),
        )
        self.assertIn(
            businesses[0].id, list(map(lambda x: x["id"], data["businesses"]))
        )
        self.assertIn(
            businesses[1].id, list(map(lambda x: x["id"], data["businesses"]))
        )
        self.assertIn(
            businesses[2].id, list(map(lambda x: x["id"], data["businesses"]))
        )

    def test_register(self):
        """Tests that registering a user works"""
        BusinessAreaCreation.create_ba("b1")
        user = {
            "username": "test@test.com",
            "first_name": "test",
            "last_name": "test",
            "password": "test",
            "businessArea": 1,
        }
        result = {"username": "test@test.com"}

        client = Client()
        response = client.post(self.link, data=user)

        # assert Profile is created.
        self.assertEqual(response.status_code, 201)
        res = response.json()
        self.assertEqual(res, result)
        userObj = User.objects.get(pk=1)
        profile = Profile.objects.get(user=userObj)
        self.assertEqual(userObj.username, "test@test.com")
        self.assertEqual(userObj.last_name, "test")
        self.assertEqual(userObj.first_name, "test")
        self.assertNotEqual(userObj.password, "test")
        self.assertEqual(profile.businessArea.id, 1)


class Login(TestCase):
    """Test cases for logging in a user"""

    def test_login(self):
        """Tests that logging in a user works and a token is returned"""
        UserCreation.create_user("j@j.com")
        token = TokenCreation.create_token("j@j.com")

        self.assertNotEqual(token, None)

    def test_using_token(self):
        """Tests the token can be used to access information on the user"""
        ProfileCreation.create_profile("j", "b1")
        token = TokenCreation.create_token("j")

        client = Client()

        response = client.get(
            f"http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = client.get(
            f"http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token NotAToken"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# class Timetable(TestCase):
#     def create_test_case(self):
#         users = [("a@a.com", "a", "a"), ("b@b.com", "b", "b"), ("c@c.com", "c", "c")]
#         users = list(
#             map(lambda x: User(username=x[0], first_name=x[1], last_name=x[2]), users)
#         )
#         businessAreas = ["Stonks", "Soft Eng", "Trading"]
#         businessAreas = list(
#             map(lambda x: BusinessArea(business_name=x), businessAreas)
#         )
#         topics = ["cs261", "Agile Programming"]
#         topics = list(map(lambda x: Topic(topic_name=x), topics))
#         for ba in businessAreas:
#             ba.save()
#         for t in topics:
#             t.save()

#         profiles = []
#         for i, user in enumerate(users):
#             user.set_password("password")
#             user.save()
#             p = Profile(user=user, businessArea=businessAreas[i])
#             p.save()
#             profiles.append(p)
#         mentee1 = Mentee(
#             profile=profiles[0],
#             introvert_rank=1,
#             extrovert_rank=2,
#             spontaneous_rank=3,
#             planning_rank=4,
#             motivated_rank=5,
#             material_delivery_rank=6,
#         )
#         mentee1.save()
#         mentee1.topics.add(topics[0])
#         mentee1.save()
#         mentee2 = Mentee(
#             profile=profiles[1],
#             introvert_rank=1,
#             extrovert_rank=2,
#             spontaneous_rank=3,
#             planning_rank=4,
#             motivated_rank=5,
#             material_delivery_rank=6,
#         )
#         mentee2.save()
#         mentee2.topics.add(topics[0])
#         mentee2.save()
#         mentor = Mentor(profile=profiles[2])
#         mentor.save()
#         mentor.topics.add(*topics)
#         mentor.save()

#         workshop1 = Workshop(
#             mentor=mentor,
#             time=timezone.now(),
#             finish=timezone.now() + timedelta(hours=1),
#             topic=topics[0],
#         )
#         meeting1 = Meeting(
#             notes="m1",
#             is_accepted=True,
#             mentor=mentor,
#             mentee=mentee1,
#             time=timezone.now() + timedelta(days=1),
#             finish=timezone.now() + timedelta(hours=1) + timedelta(days=1),
#         )
#         meeting1.save()
#         meeting2 = Meeting(
#             notes="m2",
#             is_accepted=False,
#             mentor=mentor,
#             mentee=mentee1,
#             time=timezone.now() + timedelta(hours=2),
#             finish=timezone.now() + timedelta(hours=1) + timedelta(days=2),
#         )
#         meeting2.save()
#         workshop2 = Workshop(
#             mentor=mentor,
#             time=timezone.now() + timedelta(days=3),
#             finish=timezone.now() + timedelta(hours=1) + timedelta(days=3),
#             topic=topics[1],
#         )

#         workshop1.save()
#         workshop1.mentees.add(mentee1)
#         workshop1.mentees.add(mentee2)
#         workshop1.save()
#         workshop2.save()
#         workshop2.mentees.add(mentee1)
#         workshop2.mentees.add(mentee2)
#         workshop2.save()

#         client = Client()

#         tokens = []
#         for u in users:
#             response = client.post(
#                 "http://127.0.0.1:8000/api/login/",
#                 data={"username": u.username, "password": "password"},
#             )
#             tokens.append(response.json()["token"])

#         return [
#             (users[0], profiles[0], mentee1, tokens[0]),
#             (users[1], profiles[1], mentee2, tokens[1]),
#             (users[2], profiles[2], mentor, tokens[2]),
#         ], [meeting1, meeting2, workshop1, workshop2]

#     def test_conflicting_workshop(self):
#         users, meetings = self.create_test_case()
#         topic = Topic(topic_name="cs261")
#         topic.save()
#         client = Client()
#         userTuple = users[2]
#         mentor = userTuple[2]
#         response = client.post(
#             "http://127.0.0.1/api/workshops/",
#             data={
#                 "time": timezone.now(),
#                 "finish": timezone.now() + timedelta(hours=1),
#                 "mentor": mentor.id,
#                 "topic": topic.id,
#             },
#             **{"HTTP_AUTHORIZATION": f"Token {userTuple[3]}"},
#         )
#         self.assertEqual(response.json()["msg"], "OVERBOOKED")

#     def test_conflicting_workshop_put(self):
#         users, meetings = self.create_test_case()
#         topic = Topic(topic_name="cs261")
#         topic.save()
#         client = Client()
#         userTuple = users[0]
#         response = client.put(
#             "http://127.0.0.1/api/workshops/",
#             data={"workshop": meetings[3].id},
#             content_type="application/json",
#             **{"HTTP_AUTHORIZATION": f"Token {userTuple[3]}"},
#         )
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(response.json()["msg"], "OVERBOOKED")

#     def test_authorization(self):
#         users, _ = self.create_test_case()

#         client = Client()

#         response = client.get(
#             f"http://127.0.0.1:8000/api/timetable/",
#             **{"HTTP_AUTHORIZATION": f"Token NotAToken"},
#         )

#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

#     def test_timetable_accuracy(self):
#         """BROKEN TEST CASE"""
#         users, meetings = self.create_test_case()
#         tt_lengths = [2, 1, 2]

#         client = Client()
#         for i, user in enumerate(users):
#             response = client.get(
#                 f"http://127.0.0.1:8000/api/timetable/",
#                 data={"time": timezone.now().date() - timedelta(days=4)},
#                 **{"HTTP_AUTHORIZATION": f"Token {user[3]}"},
#             )
#             # res = {"timetable":[meetings|workshops], "nextFour":[meetings|workshops]}
#             res = response.json()
#             timetable = res["timetable"]
#             nextFour = res["nextFour"]

#             self.assertEqual(response.status_code, status.HTTP_200_OK)
#             self.assertEqual(len(timetable), tt_lengths[i])
#             self.assertEqual(len(nextFour), tt_lengths[i] + 1)


class Logout(TestCase):
    def test_logout(self):
        ProfileCreation.create_profile("j", "b1")
        token = TokenCreation.create_token("j")
        client = Client()
        # Check token works
        response = client.get(
            "http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Logout
        client.post(
            "http://127.0.0.1:8000/api/logout/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check token no longer works
        response = client.get(
            "http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class Settings(TestCase):
    """ensure settings information is retrieved and update correctly"""

    def test_put_email(self):
        profile = ProfileCreation.create_profile("j", "b1")
        token = TokenCreation.create_token("j")
        client = Client()

        put_data = {
            "username": "new@new.com",
            "password_old": "",
            "password_new": "",
            "businessArea": "",
        }
        response = client.put(
            "http://127.0.0.1:8000/api/settings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(pk=profile.user.id).username, "new@new.com")

    def test_put_password(self):
        profile = ProfileCreation.create_profile("j", "b1")
        token = TokenCreation.create_token("j")
        client = Client()

        put_data = {
            "username": "",
            "password_old": "wrong",
            "password_new": "new",
            "businessArea": "",
        }
        response = client.put(
            "http://127.0.0.1:8000/api/settings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        put_data = {
            "username": "",
            "password_old": "test",
            "password_new": "new",
            "businessArea": "",
        }
        old_password = profile.user.password
        response = client.put(
            "http://127.0.0.1:8000/api/settings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(User.objects.get(pk=profile.user.id).password, old_password)

    def test_put_businessArea(self):
        profile = ProfileCreation.create_profile("j", "b1")
        token = TokenCreation.create_token("j")
        client = Client()

        bus = BusinessAreaCreation.create_ba("newBus")

        put_data = {
            "username": "",
            "password_old": "",
            "password_new": "",
            "businessArea": 2,
        }
        response = client.put(
            "http://127.0.0.1:8000/api/settings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Profile.objects.get(id=profile.id).businessArea, bus)


class MeetingBooking(TestCase):
    def test_request(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["django", "css"], 4)
        mentee = MenteeCreation.create_mentee("e", "b2", ["django"])
        mentee.mentor = mentor
        mentee.save()

        token = TokenCreation.create_token("e")

        meeting_data = {
            "start": "2022-12-31 12:00:00",
            "finish": "2022-12-31 13:00:00",
            "notes": "test meeting",
        }

        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/bookMeeting/",
            meeting_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual("test meeting", Meeting.objects.get(id=2).notes)

    def test_overbook(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["django", "css"], 4)
        mentee = MenteeCreation.create_mentee("e", "b2", ["django"])
        mentee.mentor = mentor
        mentee.save()

        token = TokenCreation.create_token("e")

        conflict = MeetingCreation.create_meeting(mentee, mentor, "aaa", 3, True)
        meeting_data = {
            "start": conflict.time,
            "finish": conflict.finish,
            "notes": "test conflict",
        }

        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/bookMeeting/",
            meeting_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["msg"], "Overbooked")

        with self.assertRaises(Meeting.DoesNotExist):
            Meeting.objects.get(notes="test conflict")


class Timetable(TestCase):
    def test_get(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["css", "django"], 5)
        mentee1 = MenteeCreation.create_mentee("e", "b2", ["css", "django"])
        mentee2 = MenteeCreation.create_mentee("e2", "b2", ["django"])
        mentee1.mentor = mentor
        mentee1.save()
        mentee2.mentor = mentor
        mentee2.save()

        for i in range(5):
            MeetingCreation.create_meeting(mentee1, mentor, "meeting {i}", i, True)

        for i in range(5, 8):
            MeetingCreation.create_meeting(mentee2, mentor, "meeting {i}", i, True)

        client = Client()

        mentorToken = TokenCreation.create_token("o")

        response = client.get(
            "http://127.0.0.1:8000/api/timetable/",
            **{"HTTP_AUTHORIZATION": f"Token {mentorToken}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["timetable"]), 8)
        self.assertEqual(len(response.data["nextFour"]), 4)

        menteeToken = TokenCreation.create_token("e")

        response = client.get(
            "http://127.0.0.1:8000/api/timetable/",
            **{"HTTP_AUTHORIZATION": f"Token {menteeToken}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["timetable"]), 5)
        self.assertEqual(len(response.data["nextFour"]), 4)

        mentee2Token = TokenCreation.create_token("e2")

        response = client.get(
            "http://127.0.0.1:8000/api/timetable/",
            **{"HTTP_AUTHORIZATION": f"Token {mentee2Token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["timetable"]), 3)
        self.assertEqual(len(response.data["nextFour"]), 3)


class MenteeSelectTopics(TestCase):
    def test_get(self):
        topics = [f"{i}" for i in range(5)]
        list(map(TopicCreation.create_topic, topics))

        _ = ProfileCreation.create_profile("p", "b1")

        token = TokenCreation.create_token("p")

        client = Client()

        response = client.get(
            "http://127.0.0.1:8000/api/menteeTopicSetup/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)

    def test_post(self):
        _ = list(map(TopicCreation.create_topic, [f"{i}" for i in range(5)]))
        profile = ProfileCreation.create_profile("p", "b1")
        token = TokenCreation.create_token("p")

        client = Client()

        post_data = {
            "topics": [1, 2],
            "introvert_rank": 1,
            "extrovert_rank": 2,
            "spontaneous_rank": 3,
            "planning_rank": 4,
            "motivated_rank": 5,
            "material_delivery_rank": 6,
        }

        response = client.post(
            "http://127.0.0.1:8000/api/menteeTopicSetup/",
            post_data,
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mentee = Mentee.objects.get(profile=profile)
        self.assertEqual(len(mentee.topics.all()), 2)


class MyMentees(TestCase):
    def test_get(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["css", "django", "React"], 3)
        mentee1 = MenteeCreation.create_mentee("e1", "b2", ["css"])
        mentee1.mentor = mentor
        mentee1.save()
        mentee2 = MenteeCreation.create_mentee("e2", "b2", ["css"])
        mentee2.mentor = mentor
        mentee2.save()
        mentee3 = MenteeCreation.create_mentee("e3", "b2", ["React"])
        mentee3.mentor = mentor
        mentee3.save()

        MeetingCreation.create_meeting(mentee1, mentor, "1st meeting", 1, False)
        MeetingCreation.create_meeting(mentee1, mentor, "2st meeting", 2, True)

        token = TokenCreation.create_token("o")

        client = Client()

        response = client.get(
            "http://127.0.0.1:8000/api/myMentees/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["meeting_requests"]), 1)
        self.assertEqual(len(response.data["suggested_topics"]), 2)
        self.assertEqual(len(response.data["mentees"]), 3)

        WorkshopCreation.create_workshop(
            mentor, [mentee1], 3, Topic.objects.get(topic_name="css")
        )

        response = client.get(
            "http://127.0.0.1:8000/api/myMentees/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["meeting_requests"]), 1)
        self.assertEqual(len(response.data["suggested_topics"]), 1)
        self.assertEqual(len(response.data["mentees"]), 3)

    def test_put(self):
        _ = MentorCreation.create_mentor("o", "b1", ["css", "django", "React"], 3)

        token = TokenCreation.create_token("o")

        put_data = {"new_capacity": 5}

        client = Client()
        response = client.put(
            "http://127.0.0.1:8000/api/myMentees/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        mentor = Mentor.objects.get(id=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mentor.mentee_capacity, 5)


class MentorSelection(TestCase):
    def make_case(self):
        valid1 = MentorCreation.create_mentor("m1", "b1", ["css", "django"], 2)
        (
            valid1.introvert,
            valid1.extrovert,
            valid1.spontaneous,
            valid1.planning,
            valid1.motivated,
            valid1.material_delivery,
        ) = (5, 5, 5, 5, 5, 5)
        valid1.save()
        valid2 = MentorCreation.create_mentor("m2", "b1", ["css", "django"], 2)
        (
            valid2.introvert,
            valid2.extrovert,
            valid2.spontaneous,
            valid2.planning,
            valid2.motivated,
            valid2.material_delivery,
        ) = (5, 5, 5, 5, 5, 5)
        valid2.save()
        valid3 = MentorCreation.create_mentor("m3", "b1", ["css", "django"], 2)
        (
            valid3.introvert,
            valid3.extrovert,
            valid3.spontaneous,
            valid3.planning,
            valid3.motivated,
            valid3.material_delivery,
        ) = (5, 5, 5, 5, 5, 5)
        valid3.save()
        valid4 = MentorCreation.create_mentor("m4", "b1", ["css", "django"], 0)
        (
            valid4.introvert,
            valid4.extrovert,
            valid4.spontaneous,
            valid4.planning,
            valid4.motivated,
            valid4.material_delivery,
        ) = (1, 1, 1, 1, 1, 1)
        valid4.save()
        invalid1 = MentorCreation.create_mentor("m5", "b1", ["css"], 2)
        (
            invalid1.introvert,
            invalid1.extrovert,
            invalid1.spontaneous,
            invalid1.planning,
            invalid1.motivated,
            invalid1.material_delivery,
        ) = (5, 5, 5, 5, 5, 5)
        invalid1.save()
        invalid2 = MentorCreation.create_mentor("m6", "b2", ["css", "django"], 2)
        (
            invalid2.introvert,
            invalid2.extrovert,
            invalid2.spontaneous,
            invalid2.planning,
            invalid2.motivated,
            invalid2.material_delivery,
        ) = (5, 5, 5, 5, 5, 5)
        invalid2.save()

        MenteeCreation.create_mentee("mentee", "b2", ["django"])
        return valid1, valid2, valid3

    def test_get(self):
        valid1, valid2, valid3 = self.make_case()

        token = TokenCreation.create_token("mentee")

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/menteeMentorSelection/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [
                {"id": mentor["id"], "mentor": mentor["mentor"]}
                for mentor in response.data
            ],
            [
                {"id": valid1.id, "mentor": str(valid1)},
                {"id": valid2.id, "mentor": str(valid2)},
                {"id": valid3.id, "mentor": str(valid3)},
            ],
        )

    def test_post(self):
        valid1, _, _ = self.make_case()

        token = TokenCreation.create_token("mentee")

        post_data = {"mentor": 1}
        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/menteeMentorSelection/",
            post_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        mentee = Mentee.objects.get(id=1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(valid1, mentee.mentor)


class MyMentor(TestCase):
    def test_get(self):
        ename = "e1"
        oname = "o1"

        new_mentee = MenteeCreation.create_mentee(ename, "b1", ["css", "django"])
        new_mentor = MentorCreation.create_mentor(oname, "b1", ["css"], 5)
        new_mentee.mentor = new_mentor
        new_mentee.save()
        new_meeting = MeetingCreation.create_meeting(
            new_mentee, new_mentor, "yoyo", -5, True
        )
        new_goal = GoalCreation.create_goal("pass cs261", new_mentee)
        GoalCreation.create_goal("fail cs261", new_mentee)
        token = TokenCreation.create_token(ename)

        client = Client()

        response = client.get(
            "http://127.0.0.1:8000/api/myMentor/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
            content_type="application/json",
        )
        response_json = response.json()
        self.assertEqual(
            {"email": "o1@o1.com", "mentor": "o1 o1", "id": 1}, response_json["mentor"]
        )
        self.assertEqual(
            [
                {
                    "id": new_meeting.id,
                    "start": str(new_meeting.time),
                    "finish": str(new_meeting.finish),
                    "notes": new_meeting.notes,
                    "feedback": False,
                }
            ],
            response_json["meetings"],
        )
        self.assertEqual([{"topic": "css"}], response_json["topics"])
        self.assertEqual(
            {
                "completed": [],
                "not_completed": [{"goal": "pass cs261"}, {"goal": "fail cs261"}],
            },
            response_json["goals"],
        )

        # Test marking goal as completed
        new_goal.completed = True
        new_goal.save()
        response = client.get(
            "http://127.0.0.1:8000/api/myMentor/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
            content_type="application/json",
        )
        response_json = response.json()
        self.assertEqual(
            {
                "completed": [{"goal": "pass cs261"}],
                "not_completed": [{"goal": "fail cs261"}],
            },
            response_json["goals"],
        )

        # Test giving feedback to meeting
        feedback = MenteeToMentorFeedback(  # noqa: F821
            meeting=new_meeting,
            introvert=1,
            extrovert=4,
            spontaneous=2,
            planning=6,
            motivated=5,
            material_delivery=3,
        )
        feedback.save()
        response = client.get(
            "http://127.0.0.1:8000/api/myMentor/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
            content_type="application/json",
        )

        response_json = response.json()

        self.assertEqual(
            [
                {
                    "id": new_meeting.id,
                    "start": str(new_meeting.time),
                    "finish": str(new_meeting.finish),
                    "notes": new_meeting.notes,
                    "feedback": True,
                }
            ],
            response_json["meetings"],
        )

    def test_put(self):
        ename = "e1"
        oname = "o1"
        mentee = MenteeCreation.create_mentee(ename, "b1", ["css", "django"])
        new_mentor = MentorCreation.create_mentor(oname, "b1", ["css"], 5)
        mentee.mentor = new_mentor
        mentee.save()
        token = TokenCreation.create_token(ename)
        client = Client()

        response = client.put(
            "http://127.0.0.1:8000/api/myMentor/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
            content_type="application/json",
        )

        self.assertEqual("Mentee Mentor relationship ended", response.json()["msg"])
        self.assertEqual(Mentee.objects.get(pk=mentee.id).mentor, None)


class MeetingView(TestCase):
    def test_put(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["css", "django"], 2)
        mentee = MenteeCreation.create_mentee("e", "b2", ["css"])
        mentee.mentor = mentor
        mentee.save()

        MeetingCreation.create_meeting(mentee, mentor, "first meeting", 1, False)
        MeetingCreation.create_meeting(mentee, mentor, "second meeting", 2, False)

        token = TokenCreation.create_token("o")
        client = Client()

        put_data = {"meeting": 1, "accepted": True}

        response = client.put(
            "http://127.0.0.1:8000/api/meetings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        meeting = Meeting.objects.get(id=1)
        self.assertEqual(meeting.is_accepted, True)

        put_data = {
            "meeting": 2,
            "accepted": False,
            "message": "Can you rearrange the meeting for Friday, 5PM",
        }

        response = client.put(
            "http://127.0.0.1:8000/api/meetings/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.get(id=1).message, put_data["message"])
        self.assertEqual(Notification.objects.get(id=1).profile, mentee.profile)
        try:
            Meeting.objects.get(id=2)
            self.assert_(False, "Meeting was not deleted")
        except Meeting.DoesNotExist:
            self.assert_(True)


class WorkshopView(TestCase):
    def test_get(self):
        MenteeCreation.create_mentee("a", "b1", ["css", "django"])
        mentor1 = MentorCreation.create_mentor("d", "b2", ["css", "react"], 2)
        mentor2 = MentorCreation.create_mentor("e", "b2", ["react", "django"], 2)

        mentee_list = []
        WorkshopCreation.create_workshop(
            mentor1, mentee_list, 2, Topic.objects.get(topic_name="css")
        )
        WorkshopCreation.create_workshop(
            mentor1, mentee_list, 10, Topic.objects.get(topic_name="react")
        )
        WorkshopCreation.create_workshop(
            mentor2, mentee_list, 14, Topic.objects.get(topic_name="django")
        )
        token = TokenCreation.create_token("a")

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/workshops/",
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(2, len(response.json()))
        self.assertEqual("css", response.json()[0]["topic"])
        self.assertEqual("django", response.json()[1]["topic"])

    def test_post(self):
        mentee1 = MenteeCreation.create_mentee("a", "b1", ["css", "django"])
        mentee2 = MenteeCreation.create_mentee("b", "b1", ["css"])
        mentor = MentorCreation.create_mentor("c", "b2", ["css", "react"], 2)
        mentee_list = [mentee1, mentee2]
        post_data = {
            "time": timezone.now() + timedelta(days=4),
            "finish": timezone.now() + timedelta(hours=1) + timedelta(days=4),
            "mentor": mentor.id,
            "mentees": [mentee.id for mentee in mentee_list],
            "topic": "css",
        }

        token = TokenCreation.create_token("c")
        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/workshops/",
            post_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual("css", Workshop.objects.get(pk=1).topic.topic_name)

    def test_post_conflict(self):
        mentee1 = MenteeCreation.create_mentee("a", "b1", ["css", "django"])
        mentee2 = MenteeCreation.create_mentee("b", "b1", ["css"])
        mentor = MentorCreation.create_mentor("c", "b2", ["css", "react"], 2)
        mentee1.mentor = mentor
        MeetingCreation.create_meeting(mentee1, mentor, "test conflict", 4, True)
        mentee_list = [mentee1, mentee2]
        post_data = {
            "time": timezone.now() + timedelta(days=4),
            "finish": timezone.now() + timedelta(hours=1) + timedelta(days=4),
            "mentor": mentor.id,
            "mentees": [mentee.id for mentee in mentee_list],
            "topic": "css",
        }

        token = TokenCreation.create_token("c")
        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/workshops/",
            post_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["msg"], "Overbooked")

        with self.assertRaises(Workshop.DoesNotExist):
            Workshop.objects.get(mentor=mentor)

    def test_put(self):
        mentee1 = MenteeCreation.create_mentee("a", "b1", ["css", "django"])
        mentee2 = MenteeCreation.create_mentee("b", "b1", ["css"])
        mentor = MentorCreation.create_mentor("c", "b2", ["css", "react"], 2)
        mentee_list = [mentee2]
        workshop = WorkshopCreation.create_workshop(
            mentor, mentee_list, 2, Topic.objects.get(topic_name="css")
        )
        put_data = {"workshop": workshop.id}

        token = TokenCreation.create_token("a")
        client = Client()
        response = client.put(
            "http://127.0.0.1:8000/api/workshops/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            list(Workshop.objects.get(mentor=mentor).mentees.iterator()),
            [mentee1, mentee2],
        )

    def test_put_conflict(self):
        mentee1 = MenteeCreation.create_mentee("a", "b1", ["css", "django"])
        mentee2 = MenteeCreation.create_mentee("b", "b1", ["css"])
        mentor = MentorCreation.create_mentor("c", "b2", ["css", "react"], 2)
        mentee_list = [mentee2]
        MeetingCreation.create_meeting(mentee1, mentor, "test conflict", 2, True)
        workshop = WorkshopCreation.create_workshop(
            mentor, mentee_list, 2, Topic.objects.get(topic_name="css")
        )
        put_data = {"workshop": workshop.id}

        token = TokenCreation.create_token("a")
        client = Client()
        response = client.put(
            "http://127.0.0.1:8000/api/workshops/",
            put_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["msg"], "Overbooked")
        self.assertNotEqual(
            list(Workshop.objects.get(mentor=mentor).mentees.iterator()),
            [mentee1, mentee2],
        )


class NotificationView(TestCase):
    def test_get(self):
        p1 = ProfileCreation.create_profile("p", "b1")
        notifs = [
            NotificationCreation.create_notification(n, p1)
            for n in [str(i) for i in range(5)]
        ]

        token = TokenCreation.create_token("p")

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/notifications/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{"msg": notif.message} for notif in notifs])


class MentorFeedback(TestCase):
    def test_post(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["css", "django"], 2)
        mentee = MenteeCreation.create_mentee("e", "b2", ["css"])
        mentee.mentor = mentor
        mentee.save()

        meeting = MeetingCreation.create_meeting(
            mentee, mentor, "first meeting", -1, True
        )

        token = TokenCreation.create_token("o")

        post_data = {"meeting": 1, "feedback": "You did good!"}

        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/MentorFeedback/",
            post_data,
            content_type="application/json",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            MentorToMenteeFeedback.objects.get(meeting=meeting).feedback,
            post_data["feedback"],
        )


class UserView(TestCase):
    def test_get(self):
        UserCreation.create_user("a")
        UserCreation.create_user("b")

        token = TokenCreation.create_token("a")

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "a")
        self.assertEqual(response.data["last_name"], "a")

        token = TokenCreation.create_token("b")

        response = client.get(
            "http://127.0.0.1:8000/api/user/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "b")
        self.assertEqual(response.data["last_name"], "b")


class MyMentee(TestCase):
    def test_get(self):
        mentor = MentorCreation.create_mentor("o", "b1", ["css", "django"], 1)
        mentee = MenteeCreation.create_mentee("e1", "b2", ["css"])
        _ = MenteeCreation.create_mentee("e2", "b1", ["django"])
        mentee.mentor = mentor
        mentee.save()

        token = TokenCreation.create_token("o")

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/myMentee/?mentee=1",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "mentor": {
                    "email": mentee.profile.user.username,
                    "mentee": str(mentee),
                    "id": mentee.id,
                },
                "meetings": [],
                "topics": [
                    {"topic": t.topic_name}
                    for t in set(mentor.topics.all()).intersection(mentee.topics.all())
                ],
                "goals": {
                    "completed": [],
                    "not_completed": [],
                },
            },
        )

        response = client.get(
            "http://127.0.0.1:8000/api/myMentee/?mentee=2",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data, {"msg": "This is not your mentee"})

    def test_put(self):
        ename = "e1"
        oname = "o1"
        mentee = MenteeCreation.create_mentee(ename, "b1", ["css", "django"])
        new_mentor = MentorCreation.create_mentor(oname, "b1", ["css"], 5)
        mentee.mentor = new_mentor
        mentee.save()
        token = TokenCreation.create_token(oname)
        client = Client()
        put_data = {"mentee": mentee.id}
        response = client.put(
            "http://127.0.0.1:8000/api/myMentee/",
            put_data,
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
            content_type="application/json",
        )

        self.assertEqual("Mentee Mentor relationship ended", response.json()["msg"])
        self.assertEqual(
            "Your relationship with o1 o1 has been ended",
            Notification.objects.get(pk=1).message,
        )
        self.assertEqual(Mentee.objects.get(pk=mentee.id).mentor, None)


class StatusTest(TestCase):
    def test_mentor_status(self):
        mname = "m1"
        pname = "p1"
        MentorCreation.create_mentor(mname, "b1", ["css", "django"], 5)
        ProfileCreation.create_profile(pname, "b1")

        token = TokenCreation.create_token(pname)

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/mentorStatus/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(0, response.json()["status"])

        token = TokenCreation.create_token(mname)

        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/mentorStatus/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(1, response.json()["status"])

    def test_mentee_status(self):
        names = ["me1", "me2", "p1"]
        mentor = MentorCreation.create_mentor("mentor", "b3", ["css", "django"], 5)
        ProfileCreation.create_profile(names[0], "b2")
        MenteeCreation.create_mentee(names[1], "b2", ["django"])
        mentee = MenteeCreation.create_mentee(names[2], "b2", ["css"])
        mentee.mentor = mentor
        mentee.save()

        for i, name in enumerate(names):
            token = TokenCreation.create_token(name)
            client = Client()
            response = client.get(
                "http://127.0.0.1:8000/api/menteeStatus/",
                **{"HTTP_AUTHORIZATION": f"Token {token}"},
            )
            self.assertEqual(i, response.json()["status"])


class GoalsViewTest(TestCase):
    def test_goal_creation(self):
        name = "mentee"
        mentee = MenteeCreation.create_mentee(name, "b1", ["CSS", "Django"])
        token = TokenCreation.create_token(name)

        goal = "To get a first in CS261"

        client = Client()
        response = client.post(
            "http://127.0.0.1:8000/api/goals/",
            data={"goal": goal},
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(
            goal,
            list(map(lambda x: x.goal, Goal.objects.filter(mentee=mentee).iterator())),
        )

    def test_goal_fetch(self):
        name = "mentee"
        mentee = MenteeCreation.create_mentee(name, "b1", ["CSS", "Django"])
        goal1 = Goal(mentee=mentee, goal="goal1")
        goal2 = Goal(mentee=mentee, goal="goal2")
        goal1.save()
        goal2.save()
        token = TokenCreation.create_token(name)
        client = Client()
        response = client.get(
            "http://127.0.0.1:8000/api/goals/",
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        self.assertIn("goal1", list(map(lambda x: x["goal"], response.json())))
        self.assertIn("goal2", list(map(lambda x: x["goal"], response.json())))
        self.assertIn(1, list(map(lambda x: x["id"], response.json())))
        self.assertIn(2, list(map(lambda x: x["id"], response.json())))


class MenteeFeedbackViewTest(TestCase):
    def test_post(self):
        name1 = "mentee"
        name2 = "mentee2"
        mentee1 = MenteeCreation.create_mentee(name1, "b1", ["CSS", "Django"])
        mentee2 = MenteeCreation.create_mentee(name2, "b3", ["CSS", "Django"])
        mentor = MentorCreation.create_mentor("mentor", "b2", ["CSS", "Django"], 5)
        meeting1 = MeetingCreation.create_meeting(
            mentee1, mentor, "Some meeting notes", 1, True
        )
        meeting2 = MeetingCreation.create_meeting(
            mentee2, mentor, "Some other meeting notes", 2, True
        )

        client = Client()
        token = TokenCreation.create_token(name1)
        _ = client.post(
            "http://127.0.0.1:8000/api/MenteeFeedback/",
            data={
                "meeting": meeting1.id,
                "introvert": 2,
                "extrovert": 2,
                "spontaneous": 2,
                "planning": 2,
                "motivated": 2,
                "material_delivery": 2,
            },
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )
        token = TokenCreation.create_token(name2)
        _ = client.post(
            "http://127.0.0.1:8000/api/MenteeFeedback/",
            data={
                "meeting": meeting2.id,
                "introvert": 3,
                "extrovert": 3,
                "spontaneous": 3,
                "planning": 3,
                "motivated": 3,
                "material_delivery": 3,
            },
            **{"HTTP_AUTHORIZATION": f"Token {token}"},
        )

        mentor = list(Mentor.objects.filter(pk=mentor.id))[0]
        self.assertEqual(mentor.introvert, 2.5)
        self.assertEqual(mentor.extrovert, 2.5)
        self.assertEqual(mentor.spontaneous, 2.5)
        self.assertEqual(mentor.planning, 2.5)
        self.assertEqual(mentor.motivated, 2.5)
        self.assertEqual(mentor.material_delivery, 2.5)
