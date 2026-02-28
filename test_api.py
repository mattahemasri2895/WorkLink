#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, FreelancerProfile
from users.serializers import FreelancerProfileSerializer

# Get the first freelancer
user = User.objects.filter(role='freelancer').first()

if user:
    print(f"\n✓ Found freelancer: {user.username}")
    
    # Try to get or create profile
    profile, created = FreelancerProfile.objects.get_or_create(user=user)
    print(f"✓ Profile created: {created}")
    
    # Test serializer with data
    test_data = {
        'bio': 'Test bio',
        'education': 'Test education',
        'skills': 'Python, Django',
        'experience': 'Test experience'
    }
    
    serializer = FreelancerProfileSerializer(profile, data=test_data, partial=True)
    print(f"\n✓ Serializer valid: {serializer.is_valid()}")
    
    if serializer.is_valid():
        serializer.save()
        print(f"✓ Profile saved successfully")
        print(f"Saved data: {serializer.data}")
    else:
        print(f"✗ Serializer errors: {serializer.errors}")
        
else:
    print("No freelancer user found")

# additional quick sanity test for job posting
from users.models import Job

rec = User.objects.filter(role='recruiter').first()
if rec:
    print(f"\n✓ Found recruiter: {rec.username}")
    job = Job.objects.create(
        recruiter=rec,
        title="Test job from script",
        description="This is a test",
        salary="",
    )
    print(f"✓ Created job: {job.id} - {job.title}")
    print(f"Jobs for recruiter: {Job.objects.filter(recruiter=rec).count()}")
else:
    print("No recruiter user to test job creation")
