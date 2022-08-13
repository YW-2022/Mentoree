from django.urls import path
from .views import (
    MeetingBookingView,
    RegisterView,
    ProfileUpdate,
    LogOut,
    Login,
    Timetable,
    Settings,
    MenteeSelectTopics,
    MyMentees,
    MentorSelection,
    MentorSelectTopics,
    MyMentorView,
    MentorStatus,
    MenteeStatus,
    MeetingView,
    WorkshopView,
    NotificationView,
    GoalsView,
    MenteeFeedbackView,
    MentorFeedbackView,
    UserView,
    MyMentee,
)

# from rest_framework import routers
# from rest_framework.urlpatterns import format_suffix_patterns

# router = routers.DefaultRouter()
# # router.register("users", UserViewSet, "users")
# router.register("register", register_api, "register")

# urlpatterns = router.urls

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),  # COMPLETED
    path("profiles/", ProfileUpdate.as_view(), name="user"),  # NEEDS DISCUSSIONS
    path("timetable/", Timetable.as_view(), name="timetable"),  # COMPLETED
    path("logout/", LogOut.as_view(), name="logout"),  # COMPLETED
    path("login/", Login.as_view(), name="login"),  # COMPLETED
    path("settings/", Settings.as_view(), name="settings"),  # COMPLETED
    path(
        "menteeTopicSetup/", MenteeSelectTopics.as_view(), name="select_topics"
    ),  # COMPLETED
    path("menteeMentorSelection/", MentorSelection.as_view()),
    path("myMentor/", MyMentorView.as_view(), name="myMentor"),
    path("mentorTopicSetup/", MentorSelectTopics.as_view()),
    path("myMentees/", MyMentees.as_view(), name="myMentees"),
    path("myMentee/", MyMentee.as_view()),
    path("mentorStatus/", MentorStatus.as_view()),  # COMPLETED
    path("menteeStatus/", MenteeStatus.as_view()),  # COMPLETED
    path("meetings/", MeetingView.as_view()),
    path("workshops/", WorkshopView.as_view()),
    path("notifications/", NotificationView.as_view()),
    path("goals/", GoalsView.as_view()),  # COMPLETED
    path("MenteeFeedback/", MenteeFeedbackView.as_view()),
    path("MentorFeedback/", MentorFeedbackView.as_view()),
    path("bookMeeting/", MeetingBookingView.as_view()),
    path("user/", UserView.as_view()),
]
