from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ('freelancer', 'Freelancer'),
        ('recruiter', 'Recruiter'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)


class FreelancerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True, default="")
    education = models.TextField(blank=True, default="")
    skills = models.TextField(blank=True, default="")
    experience = models.TextField(blank=True, default="")
    # resume file stored for freelancers
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    def __str__(self):
        return self.user.username


class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('remote', 'Remote'),
        ('onsite', 'On-site'),
        ('hybrid', 'Hybrid'),
    )
    
    DURATION_CHOICES = (
        ('short', 'Short-term (< 1 month)'),
        ('medium', 'Medium-term (1-3 months)'),
        ('long', 'Long-term (3+ months)'),
    )
    
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
    )
    
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField(blank=True, default="")
    salary = models.CharField(max_length=100, blank=True, default="")
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='remote')
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']


class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interview_completed', 'Interview Completed'),
        ('interview_rejected', 'Interview Rejected'),
        ('selected', 'Selected'),
        ('offer_sent', 'Offer Sent'),
        ('offer_accepted', 'Offer Accepted'),
        ('hired', 'Hired'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(default=timezone.now)
    resume_snapshot = models.FileField(upload_to='application_resumes/', blank=True, null=True)
    offer_letter = models.FileField(upload_to='offer_letters/', blank=True, null=True)
    offer_message = models.TextField(blank=True, default="")


class InterviewSlot(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interview_slots')
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    meeting_link = models.CharField(max_length=500, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    is_completed = models.BooleanField(default=False)
    is_selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)


class ExamSlot(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='exam_slots')
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    exam_link = models.CharField(max_length=500, blank=True, default="")
    instructions = models.TextField(blank=True, default="")
    is_completed = models.BooleanField(default=False)
    score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-created_at']


class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=150, blank=True, default="")
    description = models.TextField(blank=True, default="")

    def __str__(self):
        return self.user.username


class Message(models.Model):
    # message from sender -> recipient
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    subject = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message {self.id} from {self.sender} to {self.recipient}"


class Notification(models.Model):
    user = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    notif_type = models.CharField(max_length=50)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification {self.id} to {self.user}"
