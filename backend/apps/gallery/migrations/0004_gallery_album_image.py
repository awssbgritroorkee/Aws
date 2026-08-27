from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """
    Replaces the flat GalleryPhoto model with the two-model Album/Image system.

    Steps:
      1. Delete the old GalleryPhoto table (all existing rows are dropped).
      2. Create GalleryAlbum.
      3. Create GalleryImage (FK → GalleryAlbum).

    Note: existing GalleryPhoto data is NOT migrated — the old table is wiped.
    If you need to preserve photos, export them before running this migration.
    """

    dependencies = [
        ('gallery', '0003_galleryphoto_created_by'),
        ('auth',    '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # ── 1. Drop the old flat model ─────────────────────────────────────
        migrations.DeleteModel(
            name='GalleryPhoto',
        ),

        # ── 2. Create GalleryAlbum ─────────────────────────────────────────
        migrations.CreateModel(
            name='GalleryAlbum',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title',       models.CharField(max_length=100)),
                ('category',    models.CharField(
                                    choices=[
                                        ('Workshop',  'Workshop'),
                                        ('Hackathon', 'Hackathon'),
                                        ('Project',   'Project Showcase'),
                                        ('Meetup',    'Meetup / Community'),
                                        ('Bootcamp',  'Cloud Bootcamp'),
                                        ('Other',     'Other'),
                                    ],
                                    default='Other',
                                    help_text='Event type — used as a filter tag on the frontend.',
                                    max_length=50,
                                )),
                ('description', models.TextField(blank=True, null=True)),
                ('event_date',  models.DateField(help_text='Date the event took place.')),
                ('created_at',  models.DateTimeField(auto_now_add=True)),
                ('created_by',  models.ForeignKey(
                                    blank=True,
                                    help_text='Admin who created this album.',
                                    null=True,
                                    on_delete=django.db.models.deletion.SET_NULL,
                                    related_name='gallery_albums',
                                    to='auth.user',
                                )),
            ],
            options={
                'verbose_name':        'Gallery Album',
                'verbose_name_plural': 'Gallery Albums',
                'ordering':            ['-event_date', '-created_at'],
            },
        ),

        # ── 3. Create GalleryImage ─────────────────────────────────────────
        migrations.CreateModel(
            name='GalleryImage',
            fields=[
                ('id',      models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image',   models.ImageField(upload_to='gallery/')),
                ('caption', models.CharField(blank=True, max_length=200, null=True)),
                ('album',   models.ForeignKey(
                                help_text='Parent album this image belongs to.',
                                on_delete=django.db.models.deletion.CASCADE,
                                related_name='images',
                                to='gallery.galleryalbum',
                            )),
            ],
            options={
                'verbose_name':        'Gallery Image',
                'verbose_name_plural': 'Gallery Images',
            },
        ),
    ]
