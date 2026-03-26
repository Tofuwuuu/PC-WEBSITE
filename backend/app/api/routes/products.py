from collections.abc import Sequence

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.users import current_active_user
from app.db.session import get_async_session
from app.models.product import Product as ProductModel

router = APIRouter(tags=['products'])


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None = None
    url: str | None = None
    created_at: str | None = None


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    url: str | None = None


def require_authenticated_user(user=Depends(current_active_user)):
    # MVP: any authenticated active user can manage catalog entries.
    return user


@router.get('/products', response_model=list[ProductRead])
async def list_products(session: AsyncSession = Depends(get_async_session)):
    res = await session.execute(select(ProductModel).order_by(ProductModel.created_at.desc()))
    products: Sequence[ProductModel] = res.scalars().all()
    return [
        ProductRead(
            id=p.id,
            name=p.name,
            description=p.description,
            url=p.url,
            created_at=str(p.created_at) if p.created_at else None,
        )
        for p in products
    ]


@router.get('/products/{product_id}', response_model=ProductRead)
async def get_product(product_id: str, session: AsyncSession = Depends(get_async_session)):
    res = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return ProductRead(
        id=product.id,
        name=product.name,
        description=product.description,
        url=product.url,
        created_at=str(product.created_at) if product.created_at else None,
    )


@router.post('/products', response_model=ProductRead)
async def create_product(
    payload: ProductCreate,
    _: object = Depends(require_authenticated_user),
    session: AsyncSession = Depends(get_async_session),
):
    product = ProductModel(
        name=payload.name,
        description=payload.description,
        url=payload.url,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return ProductRead(
        id=product.id,
        name=product.name,
        description=product.description,
        url=product.url,
        created_at=str(product.created_at) if product.created_at else None,
    )


@router.put('/products/{product_id}', response_model=ProductRead)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    _: object = Depends(require_authenticated_user),
    session: AsyncSession = Depends(get_async_session),
):
    res = await session.execute(select(ProductModel).where(ProductModel.id == product_id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')

    if 'name' in payload.model_fields_set and payload.name is not None:
        product.name = payload.name
    if 'description' in payload.model_fields_set:
        product.description = payload.description
    if 'url' in payload.model_fields_set:
        product.url = payload.url

    await session.commit()
    await session.refresh(product)
    return ProductRead(
        id=product.id,
        name=product.name,
        description=product.description,
        url=product.url,
        created_at=str(product.created_at) if product.created_at else None,
    )


@router.delete('/products/{product_id}', status_code=204)
async def delete_product(
    product_id: str,
    _: object = Depends(require_authenticated_user),
    session: AsyncSession = Depends(get_async_session),
):
    await session.execute(delete(ProductModel).where(ProductModel.id == product_id))
    await session.commit()
    return None

