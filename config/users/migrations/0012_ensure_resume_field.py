from django.db import migrations, models
from django.db import connection


def add_resume_if_missing(apps, schema_editor):
    # check if column exists
    table = apps.get_model('users', 'FreelancerProfile')._meta.db_table
    col = 'resume'
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name=%s AND column_name=%s",
            [table, col],
        )
        if not cursor.fetchone():
            # add the field via schema_editor
            field = models.FileField(upload_to='resumes/', blank=True, null=True)
            field.set_attributes_from_name(col)
            schema_editor.add_field(apps.get_model('users', 'FreelancerProfile'), field)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_freelancerprofile_resume_message_notification'),
    ]

    operations = [
        migrations.RunPython(add_resume_if_missing, noop),
    ]
