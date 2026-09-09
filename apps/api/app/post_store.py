from datetime import datetime, timezone
from itertools import count

from app.models import Post, PostCreate, PostUpdate


class PostNotFoundError(Exception):
    def __init__(self, post_id: int) -> None:
        self.post_id = post_id
        super().__init__(f"Post {post_id} not found")


class PostStore:
    """In-memory Post repository. Good enough for a POC; swap for a real DB later."""

    def __init__(self) -> None:
        self._posts: dict[int, Post] = {}
        self._ids = count(1)

    def seed(self, posts: list[PostCreate]) -> None:
        for post in posts:
            self.create(post)

    def list(self) -> list[Post]:
        return list(self._posts.values())

    def get(self, post_id: int) -> Post:
        try:
            return self._posts[post_id]
        except KeyError:
            raise PostNotFoundError(post_id) from None

    def create(self, data: PostCreate) -> Post:
        post_id = next(self._ids)
        post = Post(id=post_id, created_at=datetime.now(timezone.utc), **data.model_dump())
        self._posts[post_id] = post
        return post

    def update(self, post_id: int, data: PostUpdate) -> Post:
        existing = self.get(post_id)
        updated = existing.model_copy(update=data.model_dump(exclude_unset=True))
        self._posts[post_id] = updated
        return updated

    def delete(self, post_id: int) -> None:
        if post_id not in self._posts:
            raise PostNotFoundError(post_id)
        del self._posts[post_id]


post_store = PostStore()
post_store.seed(
    [
        PostCreate(title="Hello, World", body="First post in the POC."),
        PostCreate(title="Splitting generated files", body="Exploring per-tag codegen output."),
    ]
)
