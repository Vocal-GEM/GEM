import json
import os
import numpy as np
import google.generativeai as genai
from pypdf import PdfReader

class SimpleRAG:
    def __init__(self, storage_path='knowledge_base.json'):
        self.storage_path = storage_path
        self.documents = []
        self.load()

    def load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    self.documents = json.load(f)
                print(f"Loaded {len(self.documents)} documents from knowledge base.")
            except Exception as e:
                print(f"Error loading knowledge base: {e}")
                self.documents = []
        else:
            self.documents = []

    def save(self):
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(self.documents, f)
        except Exception as e:
            print(f"Error saving knowledge base: {e}")

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
        # For simplicity, let's chunk by 500 characters overlap
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
                self.documents.append({
                    "text": chunk,
                    "source": source,
                    "embedding": embedding
                })
                count += 1
        
        self.save()
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
        if not self.documents:
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

        for doc in self.documents:
            doc_vec = np.array(doc['embedding'])
            similarity = np.dot(query_vec, doc_vec) / (np.linalg.norm(query_vec) * np.linalg.norm(doc_vec))
            results.append({
                "text": doc['text'],
                "source": doc['source'],
                "score": float(similarity)
            })

        # Sort by score desc
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:k]

# Singleton instance
rag_system = SimpleRAG(os.path.join(os.getcwd(), 'instance', 'knowledge_base.json'))
