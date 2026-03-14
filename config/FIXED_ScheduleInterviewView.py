# Replace lines 574-617 in views.py with this:

class ScheduleInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, app_id):
        try:
            application = Application.objects.get(id=app_id, job__recruiter=request.user)
            
            slots = request.data.get('slots', [])
            
            if not slots:
                return Response({'error': 'No slots provided'}, status=400)
            
            application.status = 'accepted'
            application.save()
            
            slots_text = "Available Interview Slots:\n\n"
            for i, slot in enumerate(slots, 1):
                slots_text += f"Slot {i}:\n"
                slots_text += f"  Date & Time: {slot.get('scheduled_date', 'Not specified')}\n"
                slots_text += f"  Duration: {slot.get('duration_minutes', 30)} minutes\n"
                if slot.get('meeting_link'):
                    slots_text += f"  Meeting Link: {slot.get('meeting_link')}\n"
                if slot.get('notes'):
                    slots_text += f"  Notes: {slot.get('notes')}\n"
                slots_text += "\n"
            
            slots_text += "Please reply with your preferred slot number."
            
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.freelancer,
                    subject=f"Interview Invitation: {application.job.title}",
                    body=f"Congratulations! You have been selected for the interview round for {application.job.title}.\n\n{slots_text}"
                )
                
                Notification.objects.create(
                    user=application.freelancer,
                    notif_type='interview_slots_available',
                    data={'job_title': application.job.title, 'application_id': application.id}
                )
            except Exception as e:
                logger.exception('Failed to send message')
                return Response({'error': 'Failed to send message'}, status=500)
            
            return Response({'message': 'Interview slots sent successfully'}, status=201)
            
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)
        except Exception as e:
            logger.exception('Error scheduling interview')
            return Response({'error': str(e)}, status=500)
