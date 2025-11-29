import json
import os
import numpy as np
import google.generativeai as genai
from pypdf import PdfReader
from ..models import KnowledgeDocument
from ..extensions import db

class SimpleRAG:
    def __init__(self):
        # No local storage needed anymore
        pass

    def get_embedding(self, text):
        try:
            # Use Gemini's embedding model
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document",
                title="Voice Training Knowledge"
            )
            return result['embedding']
        except Exception as e:
            print(f"Embedding error: {e}")
            return None

    def add_document(self, text, source="unknown"):
        # Chunking (simple split by paragraphs or length)
        # For simplicity, let's chunk by 1000 characters overlap
        chunk_size = 1000
        overlap = 100
        
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append(text[i:i + chunk_size])
            
        count = 0
        for chunk in chunks:
            if len(chunk.strip()) < 50: continue
            
            embedding = self.get_embedding(chunk)
            if embedding:
                doc = KnowledgeDocument(
                    content=chunk,
                    source=source,
                    embedding=embedding
                )
                db.session.add(doc)
                count += 1
        
        try:
            db.session.commit()
        except Exception as e:
            print(f"Database error: {e}")
            db.session.rollback()
            return 0
            
        return count

    def add_pdf(self, file_path):
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return self.add_document(text, source=os.path.basename(file_path))
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return 0

    def query(self, query_text, k=3):
        # Fetch all documents (naive approach for small datasets)
        # In production with large datasets, use pgvector
        try:
            documents = KnowledgeDocument.query.all()
        except Exception as e:
            print(f"Database query error: {e}")
            return []

        if not documents:
            return []

        # Embed query
        try:
            query_embedding = genai.embed_content(
                model="models/embedding-001",
                content=query_text,
                task_type="retrieval_query"
            )['embedding']
        except Exception as e:
            print(f"Query embedding error: {e}")
            return []

        # Calculate Cosine Similarity
        query_vec = np.array(query_embedding)
        results = []

        for doc in documents:
            if not doc.embedding: continue
            
            doc_vec = np.array(doc.embedding)
            similarity = np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
            results.append({
                "text": doc.content,
                "source": doc.source,
                "score": float(similarity)
            })

        # Sort by score desc
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:k]

# Singleton instance
rag_system = SimpleRAG()
