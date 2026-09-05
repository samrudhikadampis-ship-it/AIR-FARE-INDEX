from pydantic import BaseModel, Field


class Quote(BaseModel):
    id: str
    departure_time: str
    arrival_time: str = ""
    duration: str = ""
    duration_minutes: int = 0
    price: str
    price_inr: int
    source: str
    destination: str
    collected_at: str | None = None
    travel_date: str | None = None
    airline: str | None = None


class QuoteListResponse(BaseModel):
    items: list[Quote]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)
