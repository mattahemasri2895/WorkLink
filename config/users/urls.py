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
    path('freelancer/notifications/', NotificationsView.as_view()),

    path('jobs/create/', JobCreateView.as_view()),
    path('jobs/', JobListView.as_view()),
    path('jobs/apply/<int:job_id>/', ApplyJobView.as_view()),

    path('recruiter/applications/', RecruiterApplicationsView.as_view()),
    path('recruiter/update/<int:app_id>/', UpdateApplicationStatusView.as_view()),
    path('recruiter/profile/', RecruiterProfileView.as_view()),
    path('messages/', MessagesView.as_view()),
    path('notifications/', NotificationsView.as_view()),
]
