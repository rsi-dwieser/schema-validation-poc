from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_comments_returns_seed_data() -> None:
    response = client.get("/comments")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_create_get_update_delete_comment() -> None:
    created = client.post("/comments", json={"post_id": 1, "author": "Alan Turing", "body": "Interesting."})
    assert created.status_code == 201
    comment_id = created.json()["id"]

    fetched = client.get(f"/comments/{comment_id}")
    assert fetched.status_code == 200
    assert fetched.json()["author"] == "Alan Turing"

    updated = client.patch(f"/comments/{comment_id}", json={"body": "Very interesting."})
    assert updated.status_code == 200
    assert updated.json()["body"] == "Very interesting."
    assert updated.json()["author"] == "Alan Turing"

    deleted = client.delete(f"/comments/{comment_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/comments/{comment_id}")
    assert missing.status_code == 404
