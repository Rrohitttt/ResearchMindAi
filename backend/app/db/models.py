"""
ORM models. Metadata only — actual paper text/chunks/embeddings are
stored in the vectorstore + uploads folder, referenced here by path/id.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship

from app.db.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    papers = relationship("Paper", back_populates="owner", cascade="all, delete-orphan")
    chats = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="user", cascade="all, delete-orphan")
    generated_outputs = relationship("GeneratedOutput", back_populates="user", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_hash = Column(String, index=True, nullable=False)  # for duplicate detection
    num_pages = Column(Integer, default=0)
    num_chunks = Column(Integer, default=0)
    status = Column(String, default="processing")  # processing | ready | failed
    vectorstore_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="papers")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    paper_id = Column(String, ForeignKey("papers.id"), nullable=True)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    paper_id = Column(String, ForeignKey("papers.id"), nullable=False)
    summary_type = Column(String, nullable=False)  # short | detailed | bullet | technical
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="summaries")


class GeneratedOutput(Base):
    """Stores results from the multi-paper generation features (compare,
    literature survey, research gaps, presentation, viva) so they show up
    in History and don't need to be regenerated to be re-viewed."""
    __tablename__ = "generated_outputs"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    output_type = Column(String, nullable=False)  # compare | literature | gaps | presentation | viva
    title = Column(String, nullable=False)
    paper_ids = Column(Text, nullable=False)  # JSON-encoded list[str]
    content = Column(Text, nullable=False)  # markdown
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="generated_outputs")
