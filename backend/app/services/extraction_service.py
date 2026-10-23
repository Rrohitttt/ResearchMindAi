"""
FEATURE 6 & 7: Dataset and algorithm extraction.

Deliberately deterministic (regex/keyword matching over the already-indexed
chunks) rather than LLM-based: it's instant, free, fully reproducible, and
doesn't depend on Ollama being available. Confidence is derived from mention
frequency across the paper's chunks.
"""
import json
import re
from pathlib import Path
from typing import List, TypedDict

from app.core.config import settings

DATASETS = [
    "MNIST", "Fashion-MNIST", "CIFAR-10", "CIFAR-100", "ImageNet", "IMDB",
    "COCO", "MS COCO", "SQuAD", "GLUE", "SuperGLUE", "WikiText",
    "Penn Treebank", "LibriSpeech", "KITTI", "Cityscapes", "PASCAL VOC",
    "Open Images", "YouTube-8M", "Common Crawl", "WMT", "CoNLL",
    "Amazon Reviews", "Yelp Reviews", "20 Newsgroups", "Reuters-21578",
    "CelebA", "LFW", "VGGFace2", "Kinetics", "UCF101", "AudioSet",
    "Waymo Open Dataset", "nuScenes", "ADE20K", "Visual Genome",
]

ALGORITHMS = [
    "CNN", "Convolutional Neural Network", "RNN", "Recurrent Neural Network",
    "LSTM", "GRU", "Transformer", "BERT", "RoBERTa", "GPT", "Llama", "T5",
    "ResNet", "VGG", "AlexNet", "Inception", "MobileNet", "EfficientNet",
    "YOLO", "Faster R-CNN", "Mask R-CNN", "U-Net", "GAN",
    "Generative Adversarial Network", "VAE", "Autoencoder",
    "Random Forest", "SVM", "Support Vector Machine", "Decision Tree",
    "XGBoost", "Gradient Boosting", "K-Means", "Naive Bayes",
    "Logistic Regression", "Linear Regression", "K-Nearest Neighbors", "KNN",
    "Attention Mechanism", "Self-Attention", "Reinforcement Learning",
    "Q-Learning", "Diffusion Model", "Graph Neural Network", "GNN",
]


class ExtractedItem(TypedDict):
    name: str
    category: str
    mentions: int
    confidence: float


def _load_chunk_texts(paper_id: str) -> List[str]:
    chunks_path = Path(settings.VECTORSTORE_DIR) / paper_id / "chunks.json"
    if not chunks_path.exists():
        return []
    with open(chunks_path) as f:
        chunks = json.load(f)
    return [c["text"] for c in chunks]


def _count_mentions(full_text: str, term: str) -> int:
    pattern = r"(?<![A-Za-z0-9])" + re.escape(term) + r"(?![A-Za-z0-9])"
    return len(re.findall(pattern, full_text, flags=re.IGNORECASE))


def _confidence_from_mentions(mentions: int) -> float:
    """Simple saturating curve: 1 mention ~0.35, 5+ mentions -> 1.0."""
    return round(min(1.0, 0.25 + mentions * 0.15), 2)


def extract_datasets(paper_id: str) -> List[ExtractedItem]:
    full_text = " ".join(_load_chunk_texts(paper_id))
    results = []
    for name in DATASETS:
        mentions = _count_mentions(full_text, name)
        if mentions > 0:
            results.append(
                ExtractedItem(name=name, category="dataset", mentions=mentions,
                               confidence=_confidence_from_mentions(mentions))
            )
    return sorted(results, key=lambda x: -x["mentions"])


def extract_algorithms(paper_id: str) -> List[ExtractedItem]:
    full_text = " ".join(_load_chunk_texts(paper_id))
    results = []
    for name in ALGORITHMS:
        mentions = _count_mentions(full_text, name)
        if mentions > 0:
            results.append(
                ExtractedItem(name=name, category="algorithm", mentions=mentions,
                               confidence=_confidence_from_mentions(mentions))
            )
    return sorted(results, key=lambda x: -x["mentions"])
