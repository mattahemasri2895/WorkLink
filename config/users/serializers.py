from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FreelancerProfile, Job, Application, RecruiterProfile, Message, Notification, Wishlist

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
    salary = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'requirements', 'salary', 'job_type', 'duration', 'recruiter_username', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['status'] = getattr(instance, 'status', 'open')
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    freelancer_username = serializers.CharField(source='freelancer.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_details', 'freelancer', 'freelancer_username', 'status', 'applied_at', 'resume_snapshot']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get('applied_at'):
            data['applied_at'] = instance.job.created_at if hasattr(instance, 'job') else None
        # Add offer fields if they exist
        if hasattr(instance, 'offer_letter'):
            data['offer_letter'] = instance.offer_letter.url if instance.offer_letter else None
        if hasattr(instance, 'offer_message'):
            data['offer_message'] = instance.offer_message
        return data


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



class WishlistSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'job', 'job_details', 'created_at']
