from django.conf import settings
from django.db import migrations, models, connection
import django.db.models.deletion
import django.utils.timezone


def create_wishlist(apps, schema_editor):
    with connection.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS "users_wishlist" (
                "id" bigserial NOT NULL PRIMARY KEY,
                "created_at" timestamp with time zone NOT NULL DEFAULT NOW(),
                "job_id" bigint NOT NULL REFERENCES "users_job" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                "user_id" integer NOT NULL REFERENCES "users_user" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
                CONSTRAINT "users_wishlist_user_id_job_id_uniq" UNIQUE ("user_id", "job_id")
            )
        """)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_ensure_resume_field'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(create_wishlist, noop),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='Wishlist',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                        ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.job')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'ordering': ['-created_at'],
                        'unique_together': {('user', 'job')},
                    },
                ),
            ],
        ),
    ]
