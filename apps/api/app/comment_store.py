from datetime import datetime, timezone
from itertools import count

from app.models import Comment, CommentCreate, CommentUpdate


class CommentNotFoundError(Exception):
    def __init__(self, comment_id: int) -> None:
        self.comment_id = comment_id
        super().__init__(f"Comment {comment_id} not found")


class CommentStore:
    """In-memory Comment repository. Good enough for a POC; swap for a real DB later."""

    def __init__(self) -> None:
        self._comments: dict[int, Comment] = {}
        self._ids = count(1)

    def seed(self, comments: list[CommentCreate]) -> None:
        for comment in comments:
            self.create(comment)

    def list(self) -> list[Comment]:
        return list(self._comments.values())

    def get(self, comment_id: int) -> Comment:
        try:
            return self._comments[comment_id]
        except KeyError:
            raise CommentNotFoundError(comment_id) from None

    def create(self, data: CommentCreate) -> Comment:
        comment_id = next(self._ids)
        comment = Comment(id=comment_id, created_at=datetime.now(timezone.utc), **data.model_dump())
        self._comments[comment_id] = comment
        return comment

    def update(self, comment_id: int, data: CommentUpdate) -> Comment:
        existing = self.get(comment_id)
        updated = existing.model_copy(update=data.model_dump(exclude_unset=True))
        self._comments[comment_id] = updated
        return updated

    def delete(self, comment_id: int) -> None:
        if comment_id not in self._comments:
            raise CommentNotFoundError(comment_id)
        del self._comments[comment_id]


comment_store = CommentStore()
comment_store.seed(
    [
        CommentCreate(post_id=1, author="Ada Lovelace", body="Great first post!"),
        CommentCreate(post_id=1, author="Grace Hopper", body="Agreed, nice to see this working."),
    ]
)
