from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("jobs", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="job",
            name="job_type_tags",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
