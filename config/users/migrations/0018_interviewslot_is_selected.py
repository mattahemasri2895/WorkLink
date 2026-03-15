from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_add_missing_fields'),
    ]

    operations = [
        # ADD COLUMN IF NOT EXISTS is safe whether or not 0017 already added it
        migrations.RunSQL(
            sql="ALTER TABLE users_interviewslot ADD COLUMN IF NOT EXISTS is_selected boolean NOT NULL DEFAULT false;",
            reverse_sql=migrations.RunSQL.noop,
            state_operations=[
                migrations.AddField(
                    model_name='interviewslot',
                    name='is_selected',
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
    ]
