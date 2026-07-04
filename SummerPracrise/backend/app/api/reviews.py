"""Роутер отзывов: /api/products/{id}/reviews + /api/reviews/{id}."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user, require_admin
from app.models import Client, Product, Review
from app.schemas import ReviewCreate, ReviewOut

router = APIRouter(tags=["reviews"])


@router.get(
    "/api/products/{product_id}/reviews",
    response_model=list[ReviewOut],
)
async def list_product_reviews(
    product_id: int,
    db: AsyncSession = Depends(get_db),
) -> list[Review]:
    """Список отзывов на товар (доступен всем)."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.client))
        .where(Review.product_id == product_id)
        .order_by(Review.review_date.desc())
    )
    reviews = result.scalars().all()
    return list(reviews)


@router.post(
    "/api/products/{product_id}/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    product_id: int,
    payload: ReviewCreate,
    current_user: Client = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Review:
    """Оставить отзыв на товар (только авторизованный клиент)."""
    product_result = await db.execute(select(Product).where(Product.product_id == product_id))
    if product_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Товар не найден")

    review = Review(
        product_id=product_id,
        client_id=current_user.client_id,
        rating=payload.rating,
        review_text=payload.text,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review, attribute_names=["client"])
    return review


@router.delete("/api/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    _: Client = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Удалить отзыв (только администратор)."""
    result = await db.execute(select(Review).where(Review.review_id == review_id))
    review = result.scalar_one_or_none()
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Отзыв не найден")
    await db.delete(review)
    await db.commit()
