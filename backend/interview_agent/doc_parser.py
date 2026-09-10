"""
doc_parser.py
Interview Prep Agent — PDF and DOCX text extraction.
Completely separate from the product chatbot; used only by /api/interview/upload_doc.
"""

import io
import pymupdf as fitz  # PyMuPDF — already in requirements.txt


def extract_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF using PyMuPDF (already a project dependency)."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        text = page.get_text().strip()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def extract_from_docx(file_bytes: bytes) -> str:
    """Extract plain text from a DOCX using python-docx."""
    from docx import Document  # imported here so the rest of the app works even before pip install
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_document_text(file_bytes: bytes, filename: str) -> str:
    """
    Route to the correct extractor based on file extension.
    Raises ValueError for unsupported types so the API can return a clean 400.
    """
    name = filename.lower()
    if name.endswith(".pdf"):
        return extract_from_pdf(file_bytes)
    elif name.endswith(".docx"):
        return extract_from_docx(file_bytes)
    else:
        raise ValueError(
            f"Unsupported file type: '{filename}'. "
            "Please upload a PDF (.pdf) or Word document (.docx)."
        )
