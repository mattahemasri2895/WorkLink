from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import User, Job

class JobPostingTests(TestCase):
    def setUp(self):
        self.freelancer = User.objects.create_user(username="freel", password="pass", role="freelancer")
        self.recruiter = User.objects.create_user(username="rec", password="pass", role="recruiter")
        self.client = APIClient()

    def test_recruiter_can_create_job_without_salary(self):
        self.client.force_authenticate(self.recruiter)
        data = {"title": "Test job", "description": "Desc"}
        resp = self.client.post(reverse('job-list') if False else '/api/auth/jobs/create/', data)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Job.objects.filter(recruiter=self.recruiter).count(), 1)
        job = Job.objects.get(recruiter=self.recruiter)
        self.assertEqual(job.salary, "")

    def test_freelancer_cannot_create_job(self):
        self.client.force_authenticate(self.freelancer)
        resp = self.client.post('/api/auth/jobs/create/', {"title": "x", "description": "y"})
        self.assertEqual(resp.status_code, 403)

    def test_recruiter_list_only_own_jobs(self):
        Job.objects.create(recruiter=self.recruiter, title="A", description="A")
        Job.objects.create(recruiter=self.freelancer, title="B", description="B")
        self.client.force_authenticate(self.recruiter)
        resp = self.client.get('/api/auth/jobs/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "A")

    def test_freelancer_list_all_jobs(self):
        Job.objects.create(recruiter=self.recruiter, title="C", description="C")
        self.client.force_authenticate(self.freelancer)
        resp = self.client.get('/api/auth/jobs/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.json()), 1)

    def test_recruiter_profile_endpoints(self):
        self.client.force_authenticate(self.recruiter)
        # GET initial should return empty dict
        resp = self.client.get('/api/auth/recruiter/profile/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json(), {})
        # POST new data
        resp = self.client.post('/api/auth/recruiter/profile/', {"company":"Acme","description":"We hire"}, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['company'], "Acme")
        # GET now returns data
        resp = self.client.get('/api/auth/recruiter/profile/')
        self.assertEqual(resp.json()['company'], "Acme")

    def test_application_status_persistence(self):
        j = Job.objects.create(recruiter=self.recruiter, title="Z", description="Z")
        from .models import Application
        app = Application.objects.create(job=j, freelancer=self.freelancer)
        self.client.force_authenticate(self.recruiter)
        resp = self.client.post(f'/api/auth/recruiter/update/{app.id}/', {"status":"hired"}, format='json')
        self.assertEqual(resp.status_code, 200)
        app.refresh_from_db()
        self.assertEqual(app.status, "hired")

    def test_resume_and_stats_and_notifications(self):
        # upload resume and check stats emptiness
        self.client.force_authenticate(self.freelancer)
        # stats initially should be zero
        resp = self.client.get('/api/auth/freelancer/stats/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['total_applications'], 0)
        self.assertEqual(data['profile_completion'], 0)

        # upload resume file
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test.pdf", b"dummy content", content_type="application/pdf")
        resp = self.client.post('/api/auth/freelancer/profile/', {'resume': file})
        self.assertIn(resp.status_code, (200,201))
        # after upload stats should show completion >0
        resp = self.client.get('/api/auth/freelancer/stats/')
        data = resp.json()
        self.assertGreater(data['profile_completion'], 0)

        # create a job and apply to generate notifications
        self.client.force_authenticate(self.recruiter)
        job = Job.objects.create(recruiter=self.recruiter, title="NotifJob", description="Desc")
        # freelancer applies
        self.client.force_authenticate(self.freelancer)
        resp = self.client.post(f'/api/auth/jobs/apply/{job.id}/', {})
        self.assertEqual(resp.status_code, 201)
        # recruiter should see notification
        self.client.force_authenticate(self.recruiter)
        resp = self.client.get('/api/auth/recruiter/notifications/')
        # route doesn't exist for recruiter, notifications use generic endpoint
        resp = self.client.get('/api/auth/notifications/')
        self.assertEqual(resp.status_code, 200)
        notes = resp.json()['notifications']
        self.assertTrue(any(n['notif_type']=='new_application' for n in notes))

    def test_messages_endpoint(self):
        self.client.force_authenticate(self.freelancer)
        # send a message from recruiter to freelancer
        self.client.force_authenticate(self.recruiter)
        resp = self.client.post('/api/auth/freelancer/messages/', {'action':'invalid'})
        self.assertEqual(resp.status_code, 400)
        # create message directly
        from .models import Message
        Message.objects.create(sender=self.recruiter, recipient=self.freelancer, body="Hello")
        self.client.force_authenticate(self.freelancer)
        resp = self.client.get('/api/auth/freelancer/messages/')
        self.assertEqual(resp.status_code, 200)
        msgs = resp.json()
        self.assertTrue(len(msgs) >= 1)
        # mark first as read
        mid = msgs[0]['id']
        resp = self.client.post('/api/auth/freelancer/messages/', {'action':'mark_read', 'id': mid}, format='json')
        self.assertEqual(resp.status_code, 200)
        # verify changed
        msg = Message.objects.get(id=mid)
        self.assertTrue(msg.is_read)
