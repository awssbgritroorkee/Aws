from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0004_add_user_link_to_member'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='category',
            field=models.CharField(
                choices=[
                    ('LEADERSHIP', 'Leadership (Faculty & Leaders)'),
                    ('CORE', 'Core Team Member'),
                ],
                default='CORE',
                help_text='Controls which section this member appears in on the Team page.',
                max_length=20,
            ),
        ),
    ]
