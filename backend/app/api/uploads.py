"""Роутер для загрузки файлов: /api/upload/*."""
from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse

from app.deps import require_roles
from app.models import Client

router = APIRouter(prefix="/api", tags=["uploads"])

# Директория для хранения загруженных файлов
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}


@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    _: Client = Depends(require_roles("manager", "admin")),
) -> dict:
    """Загрузить файл (только менеджер/админ). Возвращает URL загруженного файла."""
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый формат файла. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Генерируем уникальное имя файла
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_name

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    return {"url": f"/api/uploads/{unique_name}"}


@router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Отдать загруженный файл."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден",
        )
    return FileResponse(str(file_path))