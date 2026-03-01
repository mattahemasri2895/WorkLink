# Generated migration to ensure all jobs have status field
from django.db import migrations


def set_default_status(apps, schema_editor):
    Job = apps.get_model('users', 'Job')
    Job.objects.filter(status__isnull=True).update(status='open')
    Job.objects.filter(status='').update(status='open')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0015_job_status'),
    ]

    operations = [
        migrations.RunPython(set_default_status, migrations.RunPython.noop),
    ]
