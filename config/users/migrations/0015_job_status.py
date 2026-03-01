# Generated migration for Job status field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_enhanced_application_tracking'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='status',
            field=models.CharField(
                choices=[('open', 'Open'), ('closed', 'Closed')],
                default='open',
                max_length=20
            ),
        ),
    ]
