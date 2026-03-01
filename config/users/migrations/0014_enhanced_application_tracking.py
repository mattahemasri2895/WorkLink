# Generated migration for enhanced application tracking

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_wishlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('shortlisted', 'Shortlisted'),
                    ('interview_scheduled', 'Interview Scheduled'),
                    ('exam_scheduled', 'Exam Scheduled'),
                    ('hired', 'Hired'),
                    ('rejected', 'Rejected')
                ],
                default='pending',
                max_length=30
            ),
        ),
        migrations.AddField(
            model_name='application',
            name='applied_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='application',
            name='resume_snapshot',
            field=models.FileField(blank=True, null=True, upload_to='application_resumes/'),
        ),
        migrations.CreateModel(
            name='InterviewSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scheduled_date', models.DateTimeField()),
                ('duration_minutes', models.IntegerField(default=30)),
                ('meeting_link', models.URLField(blank=True, default='')),
                ('notes', models.TextField(blank=True, default='')),
                ('is_completed', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interview_slots', to='users.application')),
            ],
        ),
        migrations.CreateModel(
            name='ExamSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scheduled_date', models.DateTimeField()),
                ('duration_minutes', models.IntegerField(default=60)),
                ('exam_link', models.URLField(blank=True, default='')),
                ('instructions', models.TextField(blank=True, default='')),
                ('is_completed', models.BooleanField(default=False)),
                ('score', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exam_slots', to='users.application')),
            ],
        ),
    ]
