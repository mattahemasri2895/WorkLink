from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_interviewslot_is_selected'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interviewslot',
            name='meeting_link',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='examslot',
            name='exam_link',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
    ]
