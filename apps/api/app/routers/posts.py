from fastapi import APIRouter, HTTPException, status

from app.models import Post, PostCreate, PostUpdate
from app.post_store import PostNotFoundError, post_store

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", operation_id="listPosts")
def list_posts() -> list[Post]:
    return post_store.list()


@router.get("/{post_id}", operation_id="getPost")
def get_post(post_id: int) -> Post:
    try:
        return post_store.get(post_id)
    except PostNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Post {post_id} not found") from None


@router.post("", operation_id="createPost", status_code=status.HTTP_201_CREATED)
def create_post(data: PostCreate) -> Post:
    return post_store.create(data)


@router.patch("/{post_id}", operation_id="updatePost")
def update_post(post_id: int, data: PostUpdate) -> Post:
    try:
        return post_store.update(post_id, data)
    except PostNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Post {post_id} not found") from None


@router.delete("/{post_id}", operation_id="deletePost", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int) -> None:
    try:
        post_store.delete(post_id)
    except PostNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Post {post_id} not found") from None
