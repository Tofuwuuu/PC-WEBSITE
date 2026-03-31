import asyncio

import sys
from pathlib import Path

from sqlalchemy import select

backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import AsyncSessionMaker
from app.models.product import Product


async def seed_if_empty() -> None:
    async with AsyncSessionMaker() as session:
        # Only seed when the catalog is empty.
        res = await session.execute(select(Product.id).limit(1))
        first = res.scalar_one_or_none()
        if first:
            print('Seed skipped: products table already has data.')
            return

        demo_products: list[Product] = [
            Product(
                name='AORUS Pre-Built Gaming Rig (Starter)',
                category='pre_built',
                description='Ready-to-run performance with balanced thermals and fast boot.',
                url=None,
            ),
            Product(
                name='Steel Bundle: GPU + Cooling Upgrade',
                category='bundles',
                description='A curated combo focused on value and compatibility for smooth upgrades.',
                url=None,
            ),
            Product(
                name='RGB Accessories Pack (Cable Kit + Strips)',
                category='accessories',
                description='Finishing touches to complete your setup with clean, modern cable management.',
                url=None,
            ),
        ]

        session.add_all(demo_products)
        await session.commit()
        print(f'Seed complete: inserted {len(demo_products)} products.')


if __name__ == '__main__':
    asyncio.run(seed_if_empty())

