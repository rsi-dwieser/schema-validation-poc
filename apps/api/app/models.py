from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None


class User(UserBase):
    id: int
    created_at: datetime


class PostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=2000)


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    body: str | None = Field(default=None, min_length=1, max_length=2000)


class Post(PostBase):
    id: int
    created_at: datetime


class CommentBase(BaseModel):
    post_id: int
    author: str = Field(min_length=1, max_length=100)
    body: str = Field(min_length=1, max_length=1000)


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    body: str | None = Field(default=None, min_length=1, max_length=1000)


class Comment(CommentBase):
    id: int
    created_at: datetime
