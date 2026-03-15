from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('test/', TestAuthView.as_view()),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view()),

    path('freelancer/profile/', FreelancerProfileView.as_view()),
    path('freelancer/resume/', ResumeView.as_view()),
    path('freelancer/resume/<int:freelancer_id>/', ResumeView.as_view()),
    path('freelancer/applications/', MyApplicationsView.as_view()),
    path('freelancer/stats/', FreelancerStatsView.as_view()),
    path('freelancer/messages/', MessagesView.as_view()),
    path('freelancer/messages/thread/<int:partner_id>/', ChatThreadView.as_view()),
    path('freelancer/notifications/', NotificationsView.as_view()),

    path('jobs/create/', JobCreateView.as_view()),
    path('jobs/', JobListView.as_view()),
    path('jobs/<int:job_id>/apply/', ApplyJobView.as_view()),

    path('wishlist/', WishlistView.as_view()),
    path('wishlist/<int:job_id>/', WishlistView.as_view()),

    path('recruiter/applications/', RecruiterApplicationsView.as_view()),
    path('recruiter/application/<int:app_id>/status/', UpdateApplicationStatusView.as_view()),
    path('recruiter/application/<int:app_id>/schedule-interview/', ScheduleInterviewView.as_view()),
    path('recruiter/application/<int:app_id>/send-offer/', SendOfferLetterView.as_view()),
    path('recruiter/interviews/', RecruiterInterviewsView.as_view()),
    path('recruiter/stats/', RecruiterStatsView.as_view()),
    path('recruiter/profile/', RecruiterProfileView.as_view()),
    path('recruiter/job/<int:job_id>/', JobManagementView.as_view()),
    path('resume/', ResumeView.as_view()),
    path('messages/', MessagesView.as_view()),
    path('messages/thread/<int:partner_id>/', ChatThreadView.as_view()),
    path('notifications/', NotificationsView.as_view()),
    path('freelancer/interviews/', FreelancerInterviewsView.as_view()),
    path('freelancer/application/<int:app_id>/slots/', GetInterviewSlotsView.as_view()),
    path('freelancer/slot/<int:slot_id>/select/', SelectInterviewSlotView.as_view()),
    path('freelancer/application/<int:app_id>/accept-offer/', AcceptOfferView.as_view()),
]
