from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator

User._meta.get_field("email")._unique = False

# Create your models here.


class BusinessArea(models.Model):
    """defines the BusinessArea model that holds the names of all business areas"""

    business_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        """str method so these objects appear as their business_name in text

        Returns:
            String: self.business_name
        """
        return self.business_name


class Topic(models.Model):
    """defines the Topic model that holds the names of all topics"""

    topic_name = models.CharField(max_length=100)

    def __str__(self):
        """str method so these objects appear as their topic_name in text

        Returns:
            String: self.business_name
        """
        return self.topic_name


class Profile(models.Model):
    """
    defines the Profile model that holds:
        reference to the user who is linked to this profile (1 to 1).
        businessArea which this profile is in
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    businessArea = models.ForeignKey(
        BusinessArea, on_delete=models.SET_NULL, blank=True, null=True
    )

    def __str__(self):
        """str method so these objects appear as their users first and last name in text

        Returns:
            String: users first name and last name
        """
        return f"{self.user.first_name} {self.user.last_name}"


class Mentor(models.Model):
    """
    defines the Mentor model that holds:
        reference to the profile who is linked to this mentor (1 to 1).
        topics which the mentor is willing to teach (many to many).
        introvert score for mentor.
        extrovert score for mentor.
        spontaneous score for mentor.
        planning score for mentor.
        motivated score for mentor.
        material_delivery score for mentor.
        The capacity of the mentor
    """

    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    topics = models.ManyToManyField(Topic, related_name="mentors")
    introvert = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    extrovert = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    spontaneous = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    planning = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    motivated = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    material_delivery = models.FloatField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    mentee_capacity = models.IntegerField(validators=[MinValueValidator(0)], default=3)

    def __str__(self):
        """str method so these objects appear as their users first and last name in text

        Returns:
            String: profile string
        """
        return str(self.profile)


class Mentee(models.Model):
    """
    defines the Mentor model that holds:
        reference to the profile who is linked to this mentor (1 to 1).
        topics which the mentee wants to learn (many to many).
        mentor for the mentee (Foreign key)
        introvert_rank for the mentee.
        extrovert_rank for the mentee.
        spontaneous_rank for the mentee.
        planning_rank for the mentee.
        motivated_rank for the mentee.
        material_delivery_rank for the mentee.
    """

    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    topics = models.ManyToManyField(Topic, related_name="mentees")
    mentor = models.ForeignKey(
        Mentor, on_delete=models.SET_NULL, default=None, null=True, blank=True
    )
    introvert_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=1
    )
    extrovert_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=2
    )
    spontaneous_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=3
    )
    planning_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=4
    )
    motivated_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=5
    )
    material_delivery_rank = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)], default=6
    )

    def __str__(self):
        """str method so these objects appear as their users first and last name in text

        Returns:
            String: profile string
        """
        return str(self.profile)


class Goal(models.Model):
    """
    defines the Goal model that holds:
        reference to the mentee who is linked to this goal (Foreign key).
        goal is the text based goal
        completed is a boolean referenceing whether the goal is completed or not.
    """

    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE)
    goal = models.CharField(max_length=400)
    completed = models.BooleanField(default=False)

    def __str__(self):
        """str method so these objects appear as their mentee followed by the goal

        Returns:
            String: mentee: goal
        """
        toReturn = str(self.mentee)
        if len(self.goal) > 22:
            return toReturn + ": " + self.goal[:22]
        return toReturn + ": " + self.goal


class Meeting(models.Model):
    """
    defines the Meeting model that holds:
        reference to the mentee who is linked to this Meeting (Foreign key).
        reference to the mentor who is linked to this Meeting (Foreign key).
        time the meeting starts
        time the meeting finishes
        notes for the meeting
        is_accepted boolean field referenceing whether the meeting has been accepted or not.
    """

    time = models.DateTimeField()
    finish = models.DateTimeField()
    mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE)
    mentee = models.ForeignKey(Mentee, on_delete=models.CASCADE)
    notes = models.CharField(max_length=400, default="")
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        """str method so these objects appear as the mentor mentee pairing followed by the start time

        Returns:
            String: mentor/mentee : start time
        """
        return str(self.mentor) + "/" + str(self.mentee) + ": " + str(self.time)


class Workshop(models.Model):
    """
    defines the Workshop model that holds:
        reference to the mentees who are attending this Workshop (Foreign key).
        reference to the mentor who is linked to this Workshop (Foreign key).
        time the Workshop starts
        time the Workshop finishes
        topic being taught at the workshop
    """

    time = models.DateTimeField()
    finish = models.DateTimeField()
    mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE)
    mentees = models.ManyToManyField(Mentee, related_name="workshops", blank=True)
    topic = models.ForeignKey(
        Topic, related_name="topic", on_delete=models.CASCADE, default=None, null=True
    )

    def __str__(self):
        """str method so these objects appear as the mentor followed by the start time

        Returns:
            String: mentor : start time
        """
        return str(self.mentor) + ": " + str(self.time)


class MenteeToMentorFeedback(models.Model):
    """
    defines the MenteeToMentorFeedback model that holds:
        reference to the meeting the feedback is for (Foreign Key).
        introvert score for the mentor at this meeting.
        extrovert score for the mentor at this meeting.
        spontaneous score for the mentor at this meeting.
        planning score for the mentor at this meeting.
        motivated score for the mentor at this meeting.
        material_delivery score for the mentor at this meeting.
    """

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    introvert = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    extrovert = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    spontaneous = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    planning = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    motivated = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )
    material_delivery = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], default=3
    )

    def __str__(self):
        """str method so these objects appear as the meeting

        Returns:
            String: meeting
        """
        return str(self.meeting)


class MentorToMenteeFeedback(models.Model):
    """
    defines the MentorToMenteeFeedback model that holds:
        reference to the meeting the feedback is for (Foreign Key).
        feedback for the mentee
    """

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    feedback = models.CharField(max_length=2000)

    def __str__(self):
        """str method so these objects appear as the meeting

        Returns:
            String: meeting
        """
        return str(self.meeting)


class Notification(models.Model):
    """
    defines the Notification model that holds:
        reference to the profile who the notification is for (Foreign Key).
        notification for the mentee
    """

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    message = models.CharField(max_length=400)

    def __str__(self):
        """str method so these objects appear as the profile following by the notificaiton

        Returns:
            String: profile: notification
        """
        toReturn = str(self.profile)
        if len(self.message) > 16:
            return toReturn + ": " + self.message[:16]
        return toReturn + ": " + self.message
