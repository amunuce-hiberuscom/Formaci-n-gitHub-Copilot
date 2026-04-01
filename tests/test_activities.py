def test_get_activities_returns_dictionary_with_expected_fields(client):
    # Arrange
    required_fields = {"description", "schedule", "max_participants", "participants"}

    # Act
    response = client.get("/activities")
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert isinstance(payload, dict)
    assert len(payload) > 0

    first_activity = next(iter(payload.values()))
    assert required_fields.issubset(first_activity.keys())
    assert isinstance(first_activity["participants"], list)
