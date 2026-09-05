from __future__ import annotations

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.db.config import get_database_url
from app.db.models import Base
from app.db.seed import seed_reference_data


def _rewrite_database(url: str, database: str) -> str:
    parsed = make_url(url)
    return parsed.set(database=database).render_as_string(hide_password=False)


def _engine_or_skip():
    url = get_database_url()
    connect_args = {"connect_timeout": 5}
    try:
        admin = create_engine(
            _rewrite_database(url, "postgres"),
            pool_pre_ping=True,
            isolation_level="AUTOCOMMIT",
            connect_args=connect_args,
        )
        with admin.connect() as connection:
            exists = connection.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'airfare_index_test'")
            ).scalar()
            if not exists:
                connection.execute(text("CREATE DATABASE airfare_index_test"))
        admin.dispose()
        engine = create_engine(
            _rewrite_database(url, "airfare_index_test"),
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return engine
    except Exception as exc:
        pytest.skip(f"PostgreSQL is not available: {exc}")


@pytest.fixture(scope="session")
def engine():
    engine = _engine_or_skip()
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        seed_reference_data(connection)
    yield engine
    engine.dispose()


@pytest.fixture
def session_factory(engine):
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM fare_observations"))
        connection.execute(text("DELETE FROM searches"))
        connection.execute(text("DELETE FROM scrape_runs"))
        connection.execute(text("DELETE FROM flights"))
        connection.execute(text("DELETE FROM airlines"))
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


@pytest.fixture
def db_session(session_factory) -> Session:
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
