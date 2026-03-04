"""
Custom exceptions for the application.
"""
from fastapi import HTTPException, status


class GameCraftException(HTTPException):
    """Base exception for GameCraft EDU."""
    pass


class AuthenticationError(GameCraftException):
    """Authentication failed."""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(GameCraftException):
    """User not authorized for this action."""
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class NotFoundError(GameCraftException):
    """Resource not found."""
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} not found"
        )


class ConflictError(GameCraftException):
    """Resource already exists."""
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class ValidationError(GameCraftException):
    """Validation failed."""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


class GameSpecError(GameCraftException):
    """GameSpec validation or processing error."""
    def __init__(self, detail: str = "Invalid game specification"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class SessionError(GameCraftException):
    """Session operation error."""
    def __init__(self, detail: str = "Session error"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class PaymentError(GameCraftException):
    """Payment processing error."""
    def __init__(self, detail: str = "Payment processing failed"):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=detail
        )
