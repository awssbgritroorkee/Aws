import logging
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.core.files.storage import FileSystemStorage

logger = logging.getLogger(__name__)


class SafeCloudinaryStorage(MediaCloudinaryStorage):
    """
    Attempts to upload media to Cloudinary.
    If Cloudinary fails (e.g. 403 Forbidden permission error, quota exceeded, or network issue),
    it safely catches the error and falls back to local FileSystemStorage so Django Admin
    operations never crash with a 500 Internal Server Error.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fallback_storage = FileSystemStorage()

    def _save(self, name, content):
        try:
            return super()._save(name, content)
        except Exception as e:
            logger.error(f"Cloudinary upload failed for '{name}': {e}. Falling back to local storage.")
            try:
                # Reset content file pointer if readable
                if hasattr(content, 'seek'):
                    content.seek(0)
            except Exception:
                pass
            return self.fallback_storage._save(name, content)
