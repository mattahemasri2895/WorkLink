from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FreelancerProfile, Job, Application, RecruiterProfile, Message, Notification

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'role']


class FreelancerProfileSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = FreelancerProfile
        fields = ['bio', 'education', 'skills', 'experience', 'resume']


class JobSerializer(serializers.ModelSerializer):
    recruiter_username = serializers.CharField(source='recruiter.username', read_only=True)
    # allow salary to be blank so API won't reject empty salary strings
    salary = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'requirements', 'salary', 'job_type', 'duration', 'recruiter_username', 'created_at', 'updated_at']


class ApplicationSerializer(serializers.ModelSerializer):
    freelancer_username = serializers.CharField(source='freelancer.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'freelancer', 'freelancer_username', 'status']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['company', 'description']


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'recipient', 'recipient_username', 'subject', 'body', 'is_read', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notif_type', 'data', 'is_read', 'created_at']
