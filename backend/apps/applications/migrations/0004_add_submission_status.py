from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0003_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="submission_status",
            field=models.CharField(
                choices=[
                    ("clicked", "Clicked"),
                    ("submitted", "Submitted"),
                    ("abandoned", "Abandoned"),
                ],
                default="clicked",
                max_length=20,
            ),
        ),
    ]
