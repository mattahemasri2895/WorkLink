# INSTRUCTIONS TO FIX INTERVIEW SLOT SENDING

## Problem:
The users_interviewslot table doesn't exist, so interview slot scheduling fails.

## Solution:
Replace the ScheduleInterviewView in views.py (around line 574) with this simplified version:

```python
# ---------------- SCHEDULE INTERVIEW (SIMPLIFIED) ----------------
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
            slots_text = "Available Interview Slots:\n\n"
            for i, slot in enumerate(slots, 1):
                from datetime import datetime
                date_str = slot.get('scheduled_date', '')
                if date_str:
                    try:
                        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                        date_str = dt.strftime('%B %d, %Y at %I:%M %p')
                    except:
                        pass
                
                slots_text += f"Slot {i}:\n"
                slots_text += f"  📅 Date & Time: {date_str}\n"
                slots_text += f"  ⏱️ Duration: {slot.get('duration_minutes', 30)} minutes\n"
                if slot.get('meeting_link'):
                    slots_text += f"  🔗 Meeting Link: {slot.get('meeting_link')}\n"
                if slot.get('notes'):
                    slots_text += f"  📝 Notes: {slot.get('notes')}\n"
                slots_text += "\n"
            
            slots_text += "Please reply to this message with your preferred slot number."
            
            # Send message to freelancer
            try:
                Message.objects.create(
                    sender=request.user,
                    recipient=application.freelancer,
                    subject=f"Interview Invitation: {application.job.title}",
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
```

## Steps to Apply:

1. Open: config/users/views.py
2. Find: class ScheduleInterviewView (around line 574)
3. Replace the entire class (from "class ScheduleInterviewView" to the end of the post method)
4. Save the file
5. Restart Django server: python manage.py runserver

## What This Does:

✅ Sends interview slots as a formatted message to the freelancer
✅ Updates application status to 'accepted'
✅ Creates a notification for the freelancer
✅ Works without requiring the users_interviewslot table
✅ Freelancer receives slots in their Messages page

## Testing:

1. Login as Recruiter
2. Go to Applicants
3. Click on a pending application
4. Click "Accept & Send Interview Slots"
5. Add slot details and click "Send Slots"
6. Login as Freelancer
7. Check Messages → Should see interview invitation with slots
