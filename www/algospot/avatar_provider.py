"""Read-only access to avatars restored from the production filesystem."""


class LegacyReadOnlyAvatarProvider:
    """Return the original stored image without creating thumbnail files."""

    @classmethod
    def get_avatar_url(cls, user, width, height=None):
        from avatar.models import Avatar

        avatar = Avatar.objects.filter(user=user, primary=True).first()
        if avatar and avatar.avatar:
            return avatar.avatar.url
        return None
