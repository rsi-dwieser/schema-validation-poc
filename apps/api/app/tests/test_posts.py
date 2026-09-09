from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_posts_returns_seed_data() -> None:
    response = client.get("/posts")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_create_get_update_delete_post() -> None:
    created = client.post("/posts", json={"title": "New post", "body": "Body text"})
    assert created.status_code == 201
    post_id = created.json()["id"]

    fetched = client.get(f"/posts/{post_id}")
    assert fetched.status_code == 200
    assert fetched.json()["title"] == "New post"

    updated = client.patch(f"/posts/{post_id}", json={"title": "Updated title"})
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated title"
    assert updated.json()["body"] == "Body text"

    deleted = client.delete(f"/posts/{post_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/posts/{post_id}")
    assert missing.status_code == 404
