from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0010_event_meetup_registration_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='require_internal_registration',
            field=models.BooleanField(
                default=True,
                help_text='If unchecked, bypasses the website registration form and directly shows external links on the card.',
            ),
        ),
    ]
