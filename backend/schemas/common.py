"""
Common schemas used across the application.
"""
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional, Any

T = TypeVar('T')


class SuccessResponse(BaseModel):
    """Generic success response."""
    success: bool = True
    message: str = "Operation completed successfully"


class ErrorResponse(BaseModel):
    """Error response schema."""
    success: bool = False
    error: str
    detail: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginationParams(BaseModel):
    """Pagination query parameters."""
    page: int = 1
    page_size: int = 20
    
    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size


class SortParams(BaseModel):
    """Sorting parameters."""
    sort_by: str = "created_at"
    sort_order: str = "desc"  # asc or desc
    
    @property
    def sort_direction(self) -> int:
        return -1 if self.sort_order == "desc" else 1


class FilterParams(BaseModel):
    """Common filter parameters."""
    search: Optional[str] = None
    status: Optional[str] = None
    
    
class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str = "1.0.0"
    database: str = "connected"
