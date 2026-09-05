"""Allow NULL booking_window_days for non-canonical offsets.

Revision ID: 20260906_0002
Revises: 20260905_0001
Create Date: 2026-09-06

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
from sqlalchemy import text

revision: str = "20260906_0002"
down_revision: Union[str, Sequence[str], None] = "20260905_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("searches", "booking_window_days", existing_nullable=False, nullable=True)
    op.alter_column("fare_observations", "booking_window_days", existing_nullable=False, nullable=True)
    op.execute(
        text(
            """
            UPDATE searches
            SET booking_window_days = NULL
            WHERE booking_window_days NOT IN (1, 7, 15, 30, 45)
            """
        )
    )
    op.execute(
        text(
            """
            UPDATE fare_observations
            SET booking_window_days = NULL
            WHERE booking_window_days NOT IN (1, 7, 15, 30, 45)
            """
        )
    )


def downgrade() -> None:
    op.execute(text("UPDATE searches SET booking_window_days = 0 WHERE booking_window_days IS NULL"))
    op.execute(text("UPDATE fare_observations SET booking_window_days = 0 WHERE booking_window_days IS NULL"))
    op.alter_column("searches", "booking_window_days", existing_nullable=True, nullable=False)
    op.alter_column("fare_observations", "booking_window_days", existing_nullable=True, nullable=False)
