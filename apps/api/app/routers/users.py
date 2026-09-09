from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.models import User, UserCreate, UserUpdate
from app.store import UserNotFoundError, store

router = APIRouter(prefix="/users", tags=["users"])

# A fixed id that always returns a payload violating the declared `User` schema
# (missing `email`, malformed `created_at`). FastAPI only validates/serializes a
# response against `response_model` when you return the model itself; returning a
# `Response` directly bypasses that, the same way a raw SQL query or a stale cache
# entry could drift from the Pydantic model in a real backend. It exists so the
# frontend's generated Zod response validator has something real to catch.
MALFORMED_USER_ID = 999


@router.get("", operation_id="listUsers")
def list_users() -> list[User]:
    return store.list()


@router.get("/{user_id}", operation_id="getUser")
def get_user(user_id: int) -> User:
    if user_id == MALFORMED_USER_ID:
        return JSONResponse(
            {
                "id": MALFORMED_USER_ID,
                "name": "Malformed User",
                "email_address": "wrong-field-name@example.com",
                "created_at": "not-a-timestamp",
            }
        )
    try:
        return store.get(user_id)
    except UserNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User {user_id} not found") from None


@router.post("", operation_id="createUser", status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate) -> User:
    return store.create(data)


@router.patch("/{user_id}", operation_id="updateUser")
def update_user(user_id: int, data: UserUpdate) -> User:
    try:
        return store.update(user_id, data)
    except UserNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User {user_id} not found") from None


@router.delete("/{user_id}", operation_id="deleteUser", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int) -> None:
    try:
        store.delete(user_id)
    except UserNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"User {user_id} not found") from None
