from django.db import migrations, models, connection


def column_exists(table_name, column_name):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = %s AND column_name = %s)",
            [table_name, column_name]
        )
        return cursor.fetchone()[0]


def add_missing_columns(apps, schema_editor):
    if not column_exists('users_interviewslot', 'is_selected'):
        field = models.BooleanField(default=False)
        field.set_attributes_from_name('is_selected')
        schema_editor.add_field(apps.get_model('users', 'InterviewSlot'), field)

    if not column_exists('users_application', 'offer_letter'):
        field = models.FileField(upload_to='offer_letters/', blank=True, null=True)
        field.set_attributes_from_name('offer_letter')
        schema_editor.add_field(apps.get_model('users', 'Application'), field)

    if not column_exists('users_application', 'offer_message'):
        field = models.TextField(blank=True, default='')
        field.set_attributes_from_name('offer_message')
        schema_editor.add_field(apps.get_model('users', 'Application'), field)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_ensure_job_status'),
    ]

    operations = [
        migrations.RunPython(add_missing_columns, noop),
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                    ('interview_scheduled', 'Interview Scheduled'),
                    ('interview_completed', 'Interview Completed'),
                    ('interview_rejected', 'Interview Rejected'),
                    ('selected', 'Selected'),
                    ('offer_sent', 'Offer Sent'),
                    ('offer_accepted', 'Offer Accepted'),
                    ('hired', 'Hired'),
                ],
                default='pending',
                max_length=30
            ),
        ),
    ]
