from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Job, Application, FreelancerProfile, RecruiterProfile, Message, Notification, Wishlist
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    JobSerializer,
    ApplicationSerializer,
    FreelancerProfileSerializer,
    RecruiterProfileSerializer,
    MessageSerializer,
    NotificationSerializer,
    WishlistSerializer,
)
import traceback
import logging
from django.http import FileResponse, Http404
import os

logger = logging.getLogger(__name__)


# ---------------- TEST AUTH ----------------
class TestAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "Authentication successful",
            "user": request.user.username,
            "authenticated": True
        })


# ---------------- REGISTER ----------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role
            })
        return Response({"error": "Invalid credentials"}, status=400)


# ---------------- PROFILE ----------------
class ProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# ---------------- FREELANCER PROFILE ----------------
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class FreelancerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        try:
            profile = FreelancerProfile.objects.get(user=request.user)
            serializer = FreelancerProfileSerializer(profile)
            return Response(serializer.data)
        except FreelancerProfile.DoesNotExist:
            return Response({})
        except Exception as e:
            logger.error(f"Error fetching profile: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            logger.info(f"POST freelancer/profile/ - User: {request.user.username}")
            logger.info(f"Request data: {request.data}")
            
            profile, created = FreelancerProfile.objects.get_or_create(user=request.user)
            logger.info(f"Profile {'created' if created else 'retrieved'}")
            
            serializer = FreelancerProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                logger.info("Serializer is valid")
                serializer.save()
                logger.info("Profile saved successfully")
                return Response(serializer.data, status=201 if created else 200)
            else:
                logger.error(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=400)
                
        except Exception as e:
            logger.error(f"Exception in POST: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)

    def put(self, request):
        try:
            profile = FreelancerProfile.objects.get(user=request.user)
            serializer = FreelancerProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=400)
        except FreelancerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ---------------- CREATE JOB (Recruiter) ----------------
class JobCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobSerializer

    def perform_create(self, serializer):
        # only recruiters should be able to post jobs
        if self.request.user.role != 'recruiter':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only recruiters can create jobs")
        serializer.save(recruiter=self.request.user)


# ---------------- LIST JOBS (Freelancer) ----------------
class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # recruiters should only see the jobs they created; freelancers see everything
        user = self.request.user
        if getattr(user, 'role', None) == 'recruiter':
            return Job.objects.filter(recruiter=user)
        return Job.objects.all()


# ---------------- APPLY TO JOB ----------------
class ApplyJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            # Check if freelancer profile exists
            profile = FreelancerProfile.objects.filter(user=request.user).first()
            if not profile:
                return Response({"error": "Create profile first"}, status=400)

            # Get job
            job = Job.objects.get(id=job_id)

            # Prevent duplicate application
            application, created = Application.objects.get_or_create(
                job=job,
                freelancer=request.user
            )

            if not created:
                return Response({"message": "Already applied"}, status=200)

            # notify the recruiter about new application
            try:
                Notification.objects.create(
                    user=job.recruiter,
                    notif_type='new_application',
                    data={'applicant': request.user.username, 'job_id': job.id, 'job_title': job.title}
                )
            except Exception:
                logger.exception('Failed to create notification for recruiter')

            return Response({"message": "Application submitted"}, status=201)

        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ---------------- FREELANCER: VIEW OWN APPLICATIONS ----------------
class MyApplicationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        apps = Application.objects.filter(freelancer=request.user)
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)


# ---------------- FREELANCER: STATS ----------------
class FreelancerStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            total = Application.objects.filter(freelancer=request.user).count()
            accepted = Application.objects.filter(freelancer=request.user, status='hired').count()
            rejected = Application.objects.filter(freelancer=request.user, status='rejected').count()
            pending = Application.objects.filter(freelancer=request.user, status='pending').count()

            # profile completion (bio, education, skills, experience, resume)
            profile = FreelancerProfile.objects.filter(user=request.user).first()
            fields = ['bio', 'education', 'skills', 'experience', 'resume']
            filled = 0
            if profile:
                for f in fields:
                    val = getattr(profile, f, None)
                    if val:
                        filled += 1
            completion = int((filled / len(fields)) * 100) if len(fields) else 0

            return Response({
                'total_applications': total,
                'accepted': accepted,
                'rejected': rejected,
                'pending': pending,
                'profile_completion': completion,
            })
        except Exception as e:
            logger.exception('Error fetching stats')
            return Response({'error': str(e)}, status=500)


# ---------------- MESSAGES ----------------
class MessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        msgs = Message.objects.filter(recipient=request.user)
        serializer = MessageSerializer(msgs, many=True)
        return Response(serializer.data)

    def post(self, request):
        # allow marking a message read or sending simple message
        action = request.data.get('action')
        if action == 'mark_read':
            mid = request.data.get('id')
            try:
                m = Message.objects.get(id=mid, recipient=request.user)
                m.is_read = True
                m.save()
                return Response({'message': 'marked'})
            except Message.DoesNotExist:
                return Response({'error': 'Message not found'}, status=404)
        return Response({'error': 'Invalid action'}, status=400)


# ---------------- NOTIFICATIONS ----------------
class NotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notes = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notes, many=True)
        unread = notes.filter(is_read=False).count()
        return Response({'unread': unread, 'notifications': serializer.data})

    def post(self, request):
        # mark notification as read
        action = request.data.get('action')
        if action == 'mark_read':
            nid = request.data.get('id')
            try:
                n = Notification.objects.get(id=nid, user=request.user)
                n.is_read = True
                n.save()
                return Response({'message': 'ok'})
            except Notification.DoesNotExist:
                return Response({'error': 'Notification not found'}, status=404)
        return Response({'error': 'Invalid action'}, status=400)


# ---------------- RECRUITER: VIEW APPLICANTS WITH BIO ----------------
class RecruiterApplicationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(recruiter=request.user)
        applications = Application.objects.filter(job__in=jobs)

        result = []
        for app in applications:
            profile = FreelancerProfile.objects.filter(user=app.freelancer).first()

            result.append({
                "id": app.id,
                "freelancer": app.freelancer.username,
                "job": app.job.title,
                "status": app.status,
                "bio": profile.bio if profile else "",
                "education": profile.education if profile else "",
                "skills": profile.skills if profile else "",
                "experience": profile.experience if profile else "",
            })

        return Response(result)


# ---------------- RECRUITER PROFILE ----------------
class RecruiterProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = RecruiterProfile.objects.get(user=request.user)
            serializer = RecruiterProfileSerializer(profile)
            return Response(serializer.data)
        except RecruiterProfile.DoesNotExist:
            return Response({})
        except Exception as e:
            logger.error(f"Error fetching recruiter profile: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            profile, created = RecruiterProfile.objects.get_or_create(user=request.user)
            serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201 if created else 200)
            else:
                return Response(serializer.errors, status=400)
        except Exception as e:
            logger.error(f"Error saving recruiter profile: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)

    def put(self, request):
        try:
            profile = RecruiterProfile.objects.get(user=request.user)
            serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=400)
        except RecruiterProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)
        except Exception as e:
            logger.error(f"Error updating recruiter profile: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)


# ---------------- RECRUITER: UPDATE STATUS ----------------
class UpdateApplicationStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id)
            status = request.data.get("status")

            if status not in ["pending", "hired", "rejected"]:
                return Response({"error": "Invalid status"}, status=400)

            application.status = status
            application.save()

            # notify freelancer about status change
            try:
                Notification.objects.create(
                    user=application.freelancer,
                    notif_type='application_status',
                    data={'job_title': application.job.title, 'status': status}
                )
            except Exception:
                logger.exception('Failed to create notification for freelancer')

            return Response({"message": "Status updated"})

        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=404)


# ---------------- RESUME UPLOAD / DOWNLOAD ----------------
class ResumeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # upload or update authenticated user's resume
        try:
            f = request.FILES.get('resume')
            if not f:
                return Response({'error': 'No file provided'}, status=400)

            profile, _ = FreelancerProfile.objects.get_or_create(user=request.user)
            profile.resume = f
            profile.save()

            serializer = FreelancerProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            logger.exception('Error uploading resume')
            return Response({'error': str(e)}, status=500)

    def get(self, request, freelancer_id=None):
        # download resume: if no freelancer_id -> own resume
        try:
            if freelancer_id:
                # only allow recruiter to download resumes of applicants to their jobs
                if request.user.role != 'recruiter':
                    return Response({'error': 'Permission denied'}, status=403)

                # verify that the freelancer applied to a job owned by this recruiter
                applied = Application.objects.filter(freelancer__id=freelancer_id, job__recruiter=request.user).exists()
                if not applied:
                    return Response({'error': 'No permission to access this resume'}, status=403)

                profile = FreelancerProfile.objects.filter(user__id=freelancer_id).first()
            else:
                profile = FreelancerProfile.objects.filter(user=request.user).first()

            if not profile or not profile.resume:
                return Response({'error': 'Resume not found'}, status=404)

            # serve file
            path = profile.resume.path
            if not os.path.exists(path):
                raise Http404
            return FileResponse(open(path, 'rb'), as_attachment=True, filename=os.path.basename(path))

        except Http404:
            return Response({'error': 'File not found'}, status=404)
        except Exception as e:
            logger.exception('Error serving resume')
            return Response({'error': str(e)}, status=500)



# ---------------- WISHLIST ----------------
class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlists = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlists, many=True)
        return Response(serializer.data)

    def post(self, request):
        job_id = request.data.get('job_id')
        try:
            job = Job.objects.get(id=job_id)
            wishlist, created = Wishlist.objects.get_or_create(user=request.user, job=job)
            if created:
                return Response({'message': 'Added to wishlist'}, status=201)
            return Response({'message': 'Already in wishlist'}, status=200)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def delete(self, request, job_id):
        try:
            wishlist = Wishlist.objects.get(user=request.user, job_id=job_id)
            wishlist.delete()
            return Response({'message': 'Removed from wishlist'}, status=200)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Not in wishlist'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# ---------------- RECRUITER STATS ----------------
class RecruiterStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            jobs = Job.objects.filter(recruiter=request.user)
            applications = Application.objects.filter(job__in=jobs)
            
            total_jobs = jobs.count()
            total_applications = applications.count()
            pending = applications.filter(status='pending').count()
            hired = applications.filter(status='hired').count()
            rejected = applications.filter(status='rejected').count()

            return Response({
                'total_jobs': total_jobs,
                'total_applications': total_applications,
                'pending': pending,
                'hired': hired,
                'rejected': rejected,
            })
        except Exception as e:
            logger.exception('Error fetching recruiter stats')
            return Response({'error': str(e)}, status=500)
