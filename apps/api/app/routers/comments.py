from fastapi import APIRouter, HTTPException, status

from app.comment_store import CommentNotFoundError, comment_store
from app.models import Comment, CommentCreate, CommentUpdate

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("", operation_id="listComments")
def list_comments() -> list[Comment]:
    return comment_store.list()


@router.get("/{comment_id}", operation_id="getComment")
def get_comment(comment_id: int) -> Comment:
    try:
        return comment_store.get(comment_id)
    except CommentNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Comment {comment_id} not found") from None


@router.post("", operation_id="createComment", status_code=status.HTTP_201_CREATED)
def create_comment(data: CommentCreate) -> Comment:
    return comment_store.create(data)


@router.patch("/{comment_id}", operation_id="updateComment")
def update_comment(comment_id: int, data: CommentUpdate) -> Comment:
    try:
        return comment_store.update(comment_id, data)
    except CommentNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Comment {comment_id} not found") from None


@router.delete("/{comment_id}", operation_id="deleteComment", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int) -> None:
    try:
        comment_store.delete(comment_id)
    except CommentNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Comment {comment_id} not found") from None
