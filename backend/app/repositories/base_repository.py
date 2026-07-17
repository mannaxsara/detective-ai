"""
Generic async repository with common CRUD operations.
"""

from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """Base repository providing reusable async CRUD operations.

    Subclasses must set ``model`` to the SQLAlchemy ORM class.
    """

    model: type[T]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, entity_id: int) -> T | None:
        """Fetch a single record by primary key."""
        return await self.session.get(self.model, entity_id)

    async def get_all(self, *, skip: int = 0, limit: int = 100) -> Sequence[T]:
        """Fetch a paginated list of records ordered by ``id``."""
        stmt = select(self.model).offset(skip).limit(limit).order_by(self.model.id.desc())  # type: ignore[attr-defined]
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs: Any) -> T:
        """Insert a new record and return it after flush."""
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, entity_id: int, **kwargs: Any) -> T | None:
        """Update an existing record by primary key."""
        instance = await self.get_by_id(entity_id)
        if instance is None:
            return None
        for key, value in kwargs.items():
            setattr(instance, key, value)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def delete(self, entity_id: int) -> bool:
        """Delete a record by primary key. Returns True if deleted."""
        instance = await self.get_by_id(entity_id)
        if instance is None:
            return False
        await self.session.delete(instance)
        await self.session.flush()
        return True

    async def update_by_id(self, entity_id: int, **kwargs: Any) -> T | None:
        """Update an existing record by primary key (alias for update)."""
        return await self.update(entity_id, **kwargs)

    async def delete_by_id(self, entity_id: int) -> bool:
        """Delete a record by primary key (alias for delete)."""
        return await self.delete(entity_id)

    async def count(self) -> int:
        """Return the total number of records."""
        from sqlalchemy import func as sa_func

        stmt = select(sa_func.count()).select_from(self.model)
        result = await self.session.execute(stmt)
        return result.scalar_one()
