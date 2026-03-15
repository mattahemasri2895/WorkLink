from django.db import migrations, models, connection


def add_job_status(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE "users_job"
            ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'open'
        """)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_enhanced_application_tracking'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_job_status, noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='job',
                    name='status',
                    field=models.CharField(
                        choices=[('open', 'Open'), ('closed', 'Closed')],
                        default='open',
                        max_length=20
                    ),
                ),
            ],
        ),
    ]
