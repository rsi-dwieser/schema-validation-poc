from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_users_returns_seed_data() -> None:
    response = client.get("/users")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_create_get_update_delete_user() -> None:
    created = client.post("/users", json={"name": "Alan Turing", "email": "alan@example.com"})
    assert created.status_code == 201
    user_id = created.json()["id"]

    fetched = client.get(f"/users/{user_id}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Alan Turing"

    updated = client.patch(f"/users/{user_id}", json={"name": "A. Turing"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "A. Turing"
    assert updated.json()["email"] == "alan@example.com"

    deleted = client.delete(f"/users/{user_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/users/{user_id}")
    assert missing.status_code == 404


def test_create_user_rejects_invalid_email() -> None:
    response = client.post("/users", json={"name": "Bad Email", "email": "not-an-email"})
    assert response.status_code == 422
