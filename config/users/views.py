from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Job, Application, FreelancerProfile, RecruiterProfile, Message, Notification, Wishlist, InterviewSlot
from django.db.models import Q
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
        user = self.request.user
        if getattr(user, 'role', None) == 'recruiter':
            return Job.objects.filter(recruiter=user)
        # Freelancers see only open jobs
        return Job.objects.filter(status='open')


# ---------------- APPLY TO JOB ----------------
class ApplyJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            profile = FreelancerProfile.objects.filter(user=request.user).first()
            if not profile:
                return Response({"error": "Create profile first"}, status=400)

            job = Job.objects.get(id=job_id)

            application, created = Application.objects.get_or_create(
                job=job,
                freelancer=request.user
            )

            if not created:
                return Response({"message": "Already applied"}, status=200)

            # Copy resume to application
            if profile.resume:
                try:
                    from django.core.files.base import ContentFile
                    resume_content = profile.resume.read()
                    resume_name = os.path.basename(profile.resume.name)
                    application.resume_snapshot.save(resume_name, ContentFile(resume_content), save=True)
                except Exception as e:
                    logger.error(f"Failed to copy resume: {str(e)}")

            # Notify recruiter
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
            logger.exception('Error applying to job')
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


# ---------------- MESSAGES (Live Chat) ----------------
class MessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Return list of unique conversation partners
        sent = Message.objects.filter(sender=request.user).values_list('recipient_id', flat=True)
        received = Message.objects.filter(recipient=request.user).values_list('sender_id', flat=True)
        partner_ids = set(list(sent) + list(received))
        partner_ids.discard(request.user.id)

        conversations = []
        for pid in partner_ids:
            try:
                partner = User.objects.get(id=pid)
                last_msg = Message.objects.filter(
                    Q(sender=request.user, recipient=partner) | Q(sender=partner, recipient=request.user)
                ).order_by('-created_at').first()
                unread = Message.objects.filter(sender=partner, recipient=request.user, is_read=False).count()
                conversations.append({
                    'partner_id': pid,
                    'partner_username': partner.username,
                    'partner_role': partner.role,
                    'last_message': last_msg.body if last_msg else '',
                    'last_message_time': last_msg.created_at if last_msg else None,
                    'unread_count': unread,
                })
            except User.DoesNotExist:
                continue
        conversations.sort(key=lambda x: x['last_message_time'] or '', reverse=True)
        return Response(conversations)

    def post(self, request):
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
        if action == 'send':
            recipient_id = request.data.get('recipient_id')
            body = request.data.get('body', '').strip()
            if not body:
                return Response({'error': 'Message body required'}, status=400)
            try:
                recipient = User.objects.get(id=recipient_id)
                msg = Message.objects.create(
                    sender=request.user,
                    recipient=recipient,
                    subject='',
                    body=body
                )
                return Response({
                    'id': msg.id,
                    'sender': request.user.id,
                    'sender_username': request.user.username,
                    'recipient': recipient.id,
                    'body': msg.body,
                    'created_at': msg.created_at,
                    'is_read': msg.is_read,
                }, status=201)
            except User.DoesNotExist:
                return Response({'error': 'Recipient not found'}, status=404)
        return Response({'error': 'Invalid action'}, status=400)


# ---------------- CHAT THREAD ----------------
class ChatThreadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, partner_id):
        try:
            partner = User.objects.get(id=partner_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        msgs = Message.objects.filter(
            Q(sender=request.user, recipient=partner) | Q(sender=partner, recipient=request.user)
        ).order_by('created_at')
        # Mark received messages as read
        msgs.filter(recipient=request.user, is_read=False).update(is_read=True)
        result = [{
            'id': m.id,
            'sender': m.sender.id,
            'sender_username': m.sender.username,
            'body': m.body,
            'created_at': m.created_at,
            'is_mine': m.sender == request.user,
        } for m in msgs]
        return Response(result)


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
                "freelancer_id": app.freelancer.id,
                "job": app.job.title,
                "status": app.status,
                "bio": profile.bio if profile else "",
                "education": profile.education if profile else "",
                "skills": profile.skills if profile else "",
                "experience": profile.experience if profile else "",
                "resume": profile.resume.url if profile and profile.resume else None,
                "resume_snapshot": app.resume_snapshot.url if app.resume_snapshot else None,
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
            action = request.data.get("action", "")

            valid_statuses = ["pending", "accepted", "rejected", "interview_scheduled", 
                            "interview_completed", "interview_rejected", "selected", 
                            "offer_sent", "offer_accepted", "hired"]
            
            if status not in valid_statuses:
                return Response({"error": "Invalid status"}, status=400)

            application.status = status
            application.save()

            # Create notification and message based on action
            message_text = ""
            if action == "accept":
                message_text = f"Congratulations! Your application for {application.job.title} has been accepted. You will receive interview details soon."
            elif action == "reject":
                message_text = f"Thank you for your interest in {application.job.title}. Unfortunately, your application was not selected at this time."
            elif action == "interview_reject":
                message_text = f"Thank you for attending the interview for {application.job.title}. We have decided to move forward with other candidates."
            elif action == "select":
                message_text = f"Congratulations! You have been selected for {application.job.title}. An offer letter will be shared soon."
            elif action == "send_offer":
                message_text = f"Congratulations! Please review and accept the offer letter for {application.job.title}."
            
            if message_text:
                try:
                    Message.objects.create(
                        sender=application.job.recruiter,
                        recipient=application.freelancer,
                        subject=f"Application Update: {application.job.title}",
                        body=message_text
                    )
                    Notification.objects.create(
                        user=application.freelancer,
                        notif_type='application_status',
                        data={'job_title': application.job.title, 'status': status, 'action': action}
                    )
                except Exception:
                    logger.exception('Failed to create notification')

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



# ---------------- JOB MANAGEMENT (RECRUITER) ----------------
class JobManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, recruiter=request.user)
            serializer = JobSerializer(job, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

    def delete(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, recruiter=request.user)
            job.delete()
            return Response({'message': 'Job deleted'}, status=200)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

    def patch(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, recruiter=request.user)
            new_status = request.data.get('status', 'open')
            if new_status not in ['open', 'closed']:
                return Response({'error': 'Invalid status'}, status=400)
            job.status = new_status
            job.save()
            return Response({'message': f'Job {new_status}', 'status': new_status})
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)



# ---------------- SCHEDULE INTERVIEW ----------------
class ScheduleInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, job__recruiter=request.user)
            slots = request.data.get('slots', [])
            if not slots:
                return Response({'error': 'No slots provided'}, status=400)

            # Delete old unselected slots and create new ones
            InterviewSlot.objects.filter(application=application, is_selected=False).delete()

            from django.utils.dateparse import parse_datetime
            created_slots = []
            for slot in slots:
                date_val = slot.get('scheduled_date', '')
                if not date_val:
                    continue
                parsed_date = parse_datetime(date_val)
                if not parsed_date:
                    continue
                s = InterviewSlot.objects.create(
                    application=application,
                    scheduled_date=parsed_date,
                    duration_minutes=int(slot.get('duration_minutes', 30)),
                    meeting_link=slot.get('meeting_link', ''),
                    notes=slot.get('notes', ''),
                )
                created_slots.append(s)

            if not created_slots:
                return Response({'error': 'No valid slots provided'}, status=400)

            application.status = 'accepted'
            application.save()

            slots_text = "I've sent you interview slots. Please select your preferred time from My Applications."
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.freelancer,
                    subject=f"Interview Invitation: {application.job.title}",
                    body=f"Congratulations! You have been shortlisted for {application.job.title}. {slots_text}"
                )
                Notification.objects.create(
                    user=application.freelancer,
                    notif_type='interview_slots_available',
                    data={'job_title': application.job.title, 'application_id': application.id}
                )
            except Exception:
                logger.exception('Failed to send message')

            return Response({'message': f'{len(created_slots)} interview slot(s) sent successfully'}, status=201)

        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)
        except Exception as e:
            logger.exception('Error scheduling interview')
            return Response({'error': str(e)}, status=500)


# ---------------- FREELANCER INTERVIEWS ----------------
class FreelancerInterviewsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            applications = Application.objects.filter(freelancer=request.user)
            interviews = InterviewSlot.objects.filter(application__in=applications)
            
            result = []
            for interview in interviews:
                result.append({
                    'id': interview.id,
                    'job_title': interview.application.job.title,
                    'recruiter': interview.application.job.recruiter.username,
                    'scheduled_date': interview.scheduled_date,
                    'duration_minutes': interview.duration_minutes,
                    'meeting_link': interview.meeting_link,
                    'notes': interview.notes,
                    'is_completed': interview.is_completed
                })
            
            return Response(result)
        except Exception as e:
            logger.exception('Error fetching interviews')
            return Response({'error': str(e)}, status=500)


# ---------------- RECRUITER INTERVIEWS ----------------
class RecruiterInterviewsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            jobs = Job.objects.filter(recruiter=request.user)
            applications = Application.objects.filter(job__in=jobs)
            interviews = InterviewSlot.objects.filter(application__in=applications)
            
            result = []
            for interview in interviews:
                result.append({
                    'id': interview.id,
                    'job_title': interview.application.job.title,
                    'freelancer': interview.application.freelancer.username,
                    'scheduled_date': interview.scheduled_date,
                    'duration_minutes': interview.duration_minutes,
                    'meeting_link': interview.meeting_link,
                    'notes': interview.notes,
                    'is_completed': interview.is_completed
                })
            
            return Response(result)
        except Exception as e:
            logger.exception('Error fetching interviews')
            return Response({'error': str(e)}, status=500)



# ---------------- SELECT INTERVIEW SLOT ----------------
class SelectInterviewSlotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slot_id):
        try:
            slot = InterviewSlot.objects.get(id=slot_id, application__freelancer=request.user)
            application = slot.application

            InterviewSlot.objects.filter(application=application).update(is_selected=False)
            slot.is_selected = True
            slot.save()

            application.status = 'interview_scheduled'
            application.save()

            slot_time = slot.scheduled_date.strftime('%B %d, %Y at %I:%M %p')
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.job.recruiter,
                    subject=f"Interview Slot Selected: {application.job.title}",
                    body=f"{request.user.username} has selected the interview slot on {slot_time} ({slot.duration_minutes} min) for {application.job.title}."
                )
                Message.objects.create(
                    sender=application.job.recruiter,
                    recipient=request.user,
                    subject=f"Interview Confirmed: {application.job.title}",
                    body=f"Your interview for {application.job.title} is confirmed on {slot_time} ({slot.duration_minutes} min).{' Meeting: ' + slot.meeting_link if slot.meeting_link else ''}"
                )
                Notification.objects.create(
                    user=application.job.recruiter,
                    notif_type='slot_selected',
                    data={'freelancer': request.user.username, 'job_title': application.job.title, 'slot_time': slot_time}
                )
            except Exception:
                logger.exception('Failed to send confirmation')

            return Response({'message': 'Slot selected successfully', 'slot_time': slot_time})
        except InterviewSlot.DoesNotExist:
            return Response({'error': 'Slot not found'}, status=404)


# ---------------- GET INTERVIEW SLOTS ----------------
class GetInterviewSlotsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, freelancer=request.user)
            slots = InterviewSlot.objects.filter(application=application).order_by('scheduled_date')
            result = [{
                'id': slot.id,
                'scheduled_date': slot.scheduled_date,
                'duration_minutes': slot.duration_minutes,
                'meeting_link': slot.meeting_link,
                'notes': slot.notes,
                'is_selected': slot.is_selected,
            } for slot in slots]
            return Response(result)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)


# ---------------- SEND OFFER LETTER ----------------
class SendOfferLetterView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, job__recruiter=request.user)
            
            offer_file = request.FILES.get('offer_letter')
            offer_message = request.data.get('offer_message', '')
            
            if offer_file:
                application.offer_letter = offer_file
            application.offer_message = offer_message
            application.status = 'offer_sent'
            application.save()
            
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.freelancer,
                    subject=f"Job Offer: {application.job.title}",
                    body=f"Congratulations! We are pleased to offer you the position. {offer_message}"
                )
                Notification.objects.create(
                    user=application.freelancer,
                    notif_type='offer_received',
                    data={'job_title': application.job.title, 'application_id': application.id}
                )
            except Exception:
                logger.exception('Failed to send offer notification')
            
            return Response({'message': 'Offer letter sent successfully'})
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)


# ---------------- ACCEPT OFFER ----------------
class AcceptOfferView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, freelancer=request.user)
            
            application.status = 'hired'
            application.save()
            
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.job.recruiter,
                    subject=f"Offer Accepted: {application.job.title}",
                    body=f"{request.user.username} has accepted the job offer for {application.job.title}."
                )
            except Exception:
                logger.exception('Failed to send acceptance notification')
            
            return Response({'message': 'Offer accepted successfully'})
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)
