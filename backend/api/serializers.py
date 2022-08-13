from rest_framework import serializers
from .models import (
    Notification,
    Profile,
    BusinessArea,
    Topic,
    Mentee,
    Mentor,
    Goal,
    Meeting,
    Workshop,
    MenteeToMentorFeedback,
    MentorToMenteeFeedback,
)
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Converts User querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = User
        fields = ["username", "password", "first_name", "last_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """A method that creates a  User instance and saves it to the database.

        Args:
            validated_data (dict of str): A profile containing a username, first name, last name and password.

        Returns:
            User: An instance of the User class.
        """
        user = User(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class BusinessAreaSerializer(serializers.ModelSerializer):
    """Converts Business querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = BusinessArea
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):
    """Converts Profile querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Profile
        fields = ["user", "businessArea"]


class TopicSerializer(serializers.ModelSerializer):
    """Converts Topic querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Topic
        fields = "__all__"


class MenteeSerializer(serializers.ModelSerializer):
    """Converts Mentee querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Mentee
        fields = "__all__"

    def create(self, validated_data):
        """A method that creates a Mentee instance and saves it to the database.

        Args:
            validated_data (dict of str): A dictionary containing a profile instance and topics list.

        Returns:
            Mentee: An instance of the Mentee class.
        """
        mentee = Mentee(profile=validated_data["profile"])
        mentee.save()
        mentee.topics.set(validated_data["topics"])
        mentee.topics.update()
        return mentee


class MentorSerializer(serializers.ModelSerializer):
    """Converts Mentor querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Mentor
        fields = "__all__"

    def create(self, validated_data):
        """A method that creates a Mentor instance and saves it to the database.

        Args:
            validated_data (dict of str): A profile containing a profile instance, mentee capacity and list of topics.

        Returns:
            Mentor: An instance of the Mentor class.
        """
        mentor = Mentor(
            profile=validated_data["profile"],
            mentee_capacity=validated_data["mentee_capacity"],
        )
        mentor.save()
        mentor.topics.set(validated_data["topics"])
        mentor.topics.update()
        return mentor


class GoalSerializer(serializers.ModelSerializer):
    """Converts Goal querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Goal
        fields = "__all__"


class MeetingSerializer(serializers.ModelSerializer):
    """Converts Meeting querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Meeting
        fields = "__all__"


class WorkshopSerializer(serializers.ModelSerializer):
    """Converts Workshop querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Workshop
        fields = "__all__"

    def create(self, validated_data):
        """A method that creates a Mentor instance and saves it to the database.

        Args:
            validated_data (dict of str): A profile containing a time, finish time, mentor instance and topic instance.

        Returns:
            Workshop: An instance of the Workshop class.
        """
        workshop = Workshop(
            time=validated_data["time"],
            finish=validated_data["finish"],
            mentor=validated_data["mentor"],
            topic=validated_data["topic"],
        )
        workshop.save()
        if "mentees" in validated_data:
            workshop.mentees.set(validated_data["mentees"])
            workshop.mentees.update()
        return workshop


class NotificationSerializer(serializers.ModelSerializer):
    """Converts Notification querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = Notification
        fields = "__all__"


class MentorToMenteeFeedbackSerializer(serializers.ModelSerializer):
    """Converts MentorToMentee querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = MentorToMenteeFeedback
        fields = "__all__"


class MenteeToMentorFeedbackSerializer(serializers.ModelSerializer):
    """Converts MenteeToMentor querysets into native Python types for JSON rendering"""

    class Meta:
        """Tells the serializer the model to use and fields to serialize."""

        model = MenteeToMentorFeedback
        fields = "__all__"
