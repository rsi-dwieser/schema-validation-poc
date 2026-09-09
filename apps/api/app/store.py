from datetime import datetime, timezone
from itertools import count

from app.models import User, UserCreate, UserUpdate


class UserNotFoundError(Exception):
    def __init__(self, user_id: int) -> None:
        self.user_id = user_id
        super().__init__(f"User {user_id} not found")


class UserStore:
    """In-memory User repository. Good enough for a POC; swap for a real DB later."""

    def __init__(self) -> None:
        self._users: dict[int, User] = {}
        self._ids = count(1)

    def seed(self, users: list[UserCreate]) -> None:
        for user in users:
            self.create(user)

    def list(self) -> list[User]:
        return list(self._users.values())

    def get(self, user_id: int) -> User:
        try:
            return self._users[user_id]
        except KeyError:
            raise UserNotFoundError(user_id) from None

    def create(self, data: UserCreate) -> User:
        user_id = next(self._ids)
        user = User(id=user_id, created_at=datetime.now(timezone.utc), **data.model_dump())
        self._users[user_id] = user
        return user

    def update(self, user_id: int, data: UserUpdate) -> User:
        existing = self.get(user_id)
        updated = existing.model_copy(update=data.model_dump(exclude_unset=True))
        self._users[user_id] = updated
        return updated

    def delete(self, user_id: int) -> None:
        if user_id not in self._users:
            raise UserNotFoundError(user_id)
        del self._users[user_id]


store = UserStore()
store.seed(
    [
        UserCreate(name="Ada Lovelace", email="ada@example.com"),
        UserCreate(name="Grace Hopper", email="grace@example.com"),
    ]
)
