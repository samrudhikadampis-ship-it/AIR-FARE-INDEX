from fastapi import APIRouter, Depends

from app.deps import get_quotes
from app.models.aggregations import HeatmapResponse
from app.models.quote import Quote
from app.services.aggregations import heatmap_sectors

router = APIRouter()


@router.get("/heatmap/sectors", response_model=HeatmapResponse)
def get_heatmap_sectors(quotes: list[Quote] = Depends(get_quotes)) -> HeatmapResponse:
    return heatmap_sectors(quotes)
