import uuid

from sqlalchemy import Column, DateTime, String, Text, func

from app.db.session import Base


class Product(Base):
    __tablename__ = 'products'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    # Category values are expected to be one of:
    # - categories
    # - pre_built
    # - bundles
    # - accessories
    category = Column(String(50), nullable=False, server_default='categories')
    description = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

