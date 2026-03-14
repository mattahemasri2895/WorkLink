# COPY THIS ENTIRE SECTION AND REPLACE THE ScheduleInterviewView IN views.py

# ---------------- SCHEDULE INTERVIEW (SIMPLIFIED - NO DATABASE TABLE NEEDED) ----------------
class ScheduleInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, job__recruiter=request.user)
            
            slots = request.data.get('slots', [])
            
            if not slots:
                return Response({'error': 'No slots provided'}, status=400)
            
            # Update application status
            application.status = 'accepted'
            application.save()
            
            # Format slots message
            from datetime import datetime
            slots_text = "📅 Available Interview Slots:\n\n"
            for i, slot in enumerate(slots, 1):
                date_str = slot.get('scheduled_date', '')
                if date_str:
                    try:
                        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                        date_str = dt.strftime('%B %d, %Y at %I:%M %p')
                    except:
                        pass
                
                slots_text += f"✨ Slot {i}:\n"
                slots_text += f"   📅 Date & Time: {date_str}\n"
                slots_text += f"   ⏱️ Duration: {slot.get('duration_minutes', 30)} minutes\n"
                if slot.get('meeting_link'):
                    slots_text += f"   🔗 Meeting Link: {slot.get('meeting_link')}\n"
                if slot.get('notes'):
                    slots_text += f"   📝 Notes: {slot.get('notes')}\n"
                slots_text += "\n"
            
            slots_text += "Please reply to this message with your preferred slot number."
            
            # Send message to freelancer
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.freelancer,
                    subject=f"🎉 Interview Invitation: {application.job.title}",
                    body=f"Congratulations! You have been selected for the interview round for {application.job.title}.\n\n{slots_text}"
                )
                
                # Create notification
                Notification.objects.create(
                    user=application.freelancer,
                    notif_type='interview_slots_available',
                    data={'job_title': application.job.title, 'application_id': application.id}
                )
                
                logger.info(f"Interview slots sent to {application.freelancer.username} for job {application.job.title}")
            except Exception as e:
                logger.exception('Failed to send message')
                return Response({'error': 'Failed to send message'}, status=500)
            
            return Response({'message': 'Interview slots sent successfully'}, status=201)
            
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)
        except Exception as e:
            logger.exception('Error scheduling interview')
            return Response({'error': str(e)}, status=500)
