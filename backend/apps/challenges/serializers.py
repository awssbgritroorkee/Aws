from rest_framework import serializers
from .models import Challenge, ChallengeRule, ChallengeReward, Hackathon, ChallengeRegistration


# ─────────────────────────────────────────────────────────────────────────────
# Nested serializers
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeRuleSerializer(serializers.ModelSerializer):
    """
    Serializes a single ChallengeRule entry.
    Returned nested inside ChallengeSerializer as `rules`.
    """
    class Meta:
        model  = ChallengeRule
        fields = ['id', 'title', 'description', 'order']


class ChallengeRewardSerializer(serializers.ModelSerializer):
    """
    Serializes a single ChallengeReward entry.
    Returned nested inside ChallengeSerializer as `rewards`.
    """
    class Meta:
        model  = ChallengeReward
        fields = ['id', 'title', 'prize_value', 'description', 'order']


# ─────────────────────────────────────────────────────────────────────────────
# Main serializer
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeSerializer(serializers.ModelSerializer):
    """
    Full serializer for the Challenge model.

    Includes:
      - `status` — computed property ("UPCOMING" | "LIVE" | "CONCLUDED")
      - Nested `rules` list (ordered by `order` field)
      - Nested `rewards` list (ordered by `order` field)
      - Cloudinary-aware absolute `image` URL
      - `long_description` — raw HTML string (edited via TinyMCE in the admin;
        rendered with dangerouslySetInnerHTML on the React detail page)
    """

    # ── Dynamic status from the model @property ───────────────────────────────
    # ReadOnlyField maps directly to the model @property — no source needed.
    status = serializers.ReadOnlyField()

    # ── Human-readable event type label ──────────────────────────────────────
    # Returns e.g. "Global Hackathon" instead of the raw "hackathon" key.
    event_type_display = serializers.SerializerMethodField()

    # ── Nested relations ──────────────────────────────────────────────────────
    rules   = ChallengeRuleSerializer(many=True, read_only=True)
    rewards = ChallengeRewardSerializer(many=True, read_only=True)

    # ── Image fields — resolved to absolute URLs ───────────────────────────
    image = serializers.SerializerMethodField()

    class Meta:
        model  = Challenge
        fields = [
            # Identity & type
            'id', 'title', 'slug',
            'event_type', 'event_type_display',
            # Dynamic status
            'status',
            # Descriptions
            'short_description', 'long_description', 'description',
            # Images
            'image',
            # Quick-fact badges
            'duration', 'max_seats', 'judging_type',
            # Timeline
            'start_time', 'end_time',
            # Registration
            'registration_link',
            # External event extras
            'organizer', 'total_prize_pool', 'external_link',
            # Nested relations
            'rules', 'rewards',
            # Audit
            'created_at',
        ]

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _resolve_url(self, obj, field_name):
        """Return an absolute URL for an ImageField, handling Cloudinary & local storage."""
        image_field = getattr(obj, field_name, None)
        if not image_field:
            return None
        try:
            url = image_field.url
            # Cloudinary / remote URLs are already absolute
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            # Final fallback for server-side calls without a request context
            return f'https://aws-swae.onrender.com{url}'
        except Exception:
            return str(image_field)

    def get_image(self, obj):
        """Absolute URL for the cover image."""
        return self._resolve_url(obj, 'image')

    def get_event_type_display(self, obj):
        """Human-readable event type label (e.g. 'Global Hackathon' instead of 'hackathon')."""
        return obj.get_event_type_display()


# ─────────────────────────────────────────────────────────────────────────────
# Hackathon serializer
# ─────────────────────────────────────────────────────────────────────────────

class HackathonSerializer(serializers.ModelSerializer):
    """
    Full serializer for the Hackathon model.

    Includes:
      - `status`      — computed property ("UPCOMING" | "LIVE" | "CONCLUDED")
      - `cover_image` — resolved to an absolute URL (Cloudinary or local media)
      - `long_description` — raw TinyMCE HTML; rendered via dangerouslySetInnerHTML in React
    """

    # ── Dynamic status from the model @property ────────────────────────────
    status      = serializers.ReadOnlyField()

    # ── Image resolved to absolute URL ────────────────────────────────────
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model  = Hackathon
        fields = [
            # Identity
            'id', 'title', 'slug',
            # Organizer
            'organizer',
            # Dynamic status
            'status',
            # Image
            'cover_image',
            # Registration
            'registration_link',
            # Timeline
            'start_date', 'end_date',
            # Prize & mode
            'total_prize_pool', 'mode',
            # Descriptions
            'short_description', 'long_description',
            # Audit
            'created_at',
        ]

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _resolve_url(self, obj, field_name):
        """Return an absolute URL for an ImageField, handling Cloudinary & local storage."""
        image_field = getattr(obj, field_name, None)
        if not image_field:
            return None
        try:
            url = image_field.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return f'https://aws-swae.onrender.com{url}'
        except Exception:
            return str(image_field)

    def get_cover_image(self, obj):
        """Absolute URL for the hackathon card / banner image."""
        return self._resolve_url(obj, 'cover_image')


# ─────────────────────────────────────────────────────────────────────────────
# ChallengeRegistration serializer — RSVP & "My Registrations" dashboard
# ─────────────────────────────────────────────────────────────────────────────

class ChallengeRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializes a ChallengeRegistration record for the authenticated student.

    In addition to the registration fields (status, project_link, timestamps),
    this serializer includes denormalized read-only fields pulled directly from
    the related Challenge object.  This lets the frontend render full "My
    Registrations" cards in a single API call without any extra fetches:

        challenge_title       — title of the challenge
        challenge_event_type  — raw key, e.g. "sprint" | "hackathon"
        challenge_slug        — slug for the /challenges/<slug> detail link
        challenge_start_time  — ISO 8601 datetime
        challenge_end_time    — ISO 8601 datetime
        challenge_image       — absolute URL (Cloudinary or local)
        challenge_status      — computed "UPCOMING" | "LIVE" | "CONCLUDED"
    """

    # ── Denormalized challenge fields (read-only) ─────────────────────────────
    challenge_title                   = serializers.SerializerMethodField()
    challenge_event_type              = serializers.SerializerMethodField()
    challenge_slug                    = serializers.SerializerMethodField()
    challenge_start_time              = serializers.SerializerMethodField()
    challenge_end_time                = serializers.SerializerMethodField()
    challenge_image                   = serializers.SerializerMethodField()
    challenge_status                  = serializers.SerializerMethodField()
    challenge_submission_type         = serializers.CharField(source='challenge.submission_type', read_only=True)
    challenge_submission_instructions = serializers.CharField(source='challenge.submission_instructions', read_only=True, allow_null=True)

    # ── Human-readable status label ───────────────────────────────────────────
    status_display = serializers.SerializerMethodField()

    # ── Legacy alias ──────────────────────────────────────────────────────────
    project_link   = serializers.ReadOnlyField(source='proof_link')

    class Meta:
        model  = ChallengeRegistration
        fields = [
            # Registration identity
            'id',
            'challenge',           # FK id — useful for POST /register/ idempotency checks
            # Denormalized challenge data (for card rendering)
            'challenge_title',
            'challenge_event_type',
            'challenge_slug',
            'challenge_start_time',
            'challenge_end_time',
            'challenge_image',
            'challenge_status',
            'challenge_submission_type',
            'challenge_submission_instructions',
            # Registration state
            'status',
            'status_display',
            'rejection_reason',
            'proof_link',
            'project_link',
            # Timestamps
            'registered_at',
            'submitted_at',
        ]
        read_only_fields = [
            'id', 'challenge', 'registered_at', 'submitted_at',
            'challenge_title', 'challenge_event_type', 'challenge_slug',
            'challenge_start_time', 'challenge_end_time', 'challenge_image',
            'challenge_status', 'challenge_submission_type', 'challenge_submission_instructions',
            'status_display', 'project_link', 'rejection_reason',
        ]

    # ── SerializerMethodField implementations ─────────────────────────────────

    def _resolve_image(self, obj):
        """Return absolute URL for the challenge cover image."""
        image_field = getattr(obj.challenge, 'image', None)
        if not image_field:
            return None
        try:
            url = image_field.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return f'https://aws-swae.onrender.com{url}'
        except Exception:
            return str(image_field)

    def get_challenge_title(self, obj):
        return obj.challenge.title

    def get_challenge_event_type(self, obj):
        return obj.challenge.event_type

    def get_challenge_slug(self, obj):
        return obj.challenge.slug

    def get_challenge_start_time(self, obj):
        return obj.challenge.start_time

    def get_challenge_end_time(self, obj):
        return obj.challenge.end_time

    def get_challenge_image(self, obj):
        return self._resolve_image(obj)

    def get_challenge_status(self, obj):
        return obj.challenge.status

    def get_status_display(self, obj):
        return obj.get_status_display()
