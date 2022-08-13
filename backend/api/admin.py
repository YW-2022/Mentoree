from django.contrib import admin
from .models import (
    BusinessArea,
    Profile,
    Mentee,
    Mentor,
    Meeting,
    Workshop,
    Topic,
    Goal,
    MenteeToMentorFeedback,
    MentorToMenteeFeedback,
    Notification,
)

# Register your models here.

admin.site.register(BusinessArea)
admin.site.register(Profile)
admin.site.register(Mentor)
admin.site.register(Mentee)
admin.site.register(Meeting)
admin.site.register(Workshop)
admin.site.register(Topic)
admin.site.register(Goal)
admin.site.register(MenteeToMentorFeedback)
admin.site.register(MentorToMenteeFeedback)
admin.site.register(Notification)
