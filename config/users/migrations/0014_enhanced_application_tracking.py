from django.db import migrations, models, connection
import django.db.models.deletion
import django.utils.timezone


def create_interviewslot(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "users_interviewslot" (
                "id" bigserial NOT NULL PRIMARY KEY,
                "scheduled_date" timestamp with time zone NOT NULL,
                "duration_minutes" integer NOT NULL DEFAULT 30,
                "meeting_link" varchar(200) NOT NULL DEFAULT '',
                "notes" text NOT NULL DEFAULT '',
                "is_completed" boolean NOT NULL DEFAULT false,
                "is_selected" boolean NOT NULL DEFAULT false,
                "created_at" timestamp with time zone NOT NULL DEFAULT NOW(),
                "application_id" bigint NOT NULL REFERENCES "users_application" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
            )
        """)


def create_examslot(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "users_examslot" (
                "id" bigserial NOT NULL PRIMARY KEY,
                "scheduled_date" timestamp with time zone NOT NULL,
                "duration_minutes" integer NOT NULL DEFAULT 60,
                "exam_link" varchar(200) NOT NULL DEFAULT '',
                "instructions" text NOT NULL DEFAULT '',
                "is_completed" boolean NOT NULL DEFAULT false,
                "score" integer NULL,
                "created_at" timestamp with time zone NOT NULL DEFAULT NOW(),
                "application_id" bigint NOT NULL REFERENCES "users_application" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
            )
        """)


def add_application_columns(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE "users_application"
            ADD COLUMN IF NOT EXISTS "applied_at" timestamp with time zone NOT NULL DEFAULT NOW()
        """)
        cursor.execute("""
            ALTER TABLE "users_application"
            ADD COLUMN IF NOT EXISTS "resume_snapshot" varchar(100) NULL
        """)


def noop(apps, schema_editor):
    pass


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
        migrations.RunPython(add_application_columns, noop),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(create_interviewslot, noop),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='InterviewSlot',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('scheduled_date', models.DateTimeField()),
                        ('duration_minutes', models.IntegerField(default=30)),
                        ('meeting_link', models.URLField(blank=True, default='')),
                        ('notes', models.TextField(blank=True, default='')),
                        ('is_completed', models.BooleanField(default=False)),
                        ('is_selected', models.BooleanField(default=False)),
                        ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                        ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interview_slots', to='users.application')),
                    ],
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(create_examslot, noop),
            ],
            state_operations=[
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
            ],
        ),
    ]
