# VivuTravel RAG DeepEval Testcase Schema

This file describes the expected testcase structure for single-turn and conversational RAG evaluation.

## Single-turn testcase (type = "single_turn")
Required fields:
- id
- difficulty: easy | medium | hard
- question_type: what | how | why | recommendation
- domain: food | destination | hotel | tour | policy | travel_experience
- input
- expected_output_outline
- expected_chunk_id (string) or expected_chunk_ids (array of strings)
- context
- target_metadata

Example:
```json
{
  "id": "VT_ST_0001",
  "type": "single_turn",
  "difficulty": "easy",
  "question_type": "what",
  "domain": "food",
  "input": "What does the post talk about?",
  "expected_output_outline": "Summarize the main food item and key details from the post.",
  "expected_chunk_id": "chunk_doc_0001_001",
  "context": "Optional extra instructions for the prompt.",
  "target_metadata": {
    "source_doc_id": "doc_0001",
    "source_chunk_id": "chunk_doc_0001_001",
    "source_url": "https://example.com/post/1",
    "locations": ["Ha Noi"],
    "topics": ["bun cha"],
    "prices": ["40k"],
    "time": "2026-05-01T10:00:00Z"
  }
}
```

## Conversational testcase (type = "conversational")
Required fields:
- id
- difficulty
- domain
- scenario
- expected_outcome
- turns
- context

Turn objects (for role = "user"):
- role
- content
- expected_assistant_output_outline

Example:
```json
{
  "id": "VT_CONV_0001",
  "type": "conversational",
  "difficulty": "hard",
  "domain": "food",
  "scenario": "Multi-turn inquiry about a food review. The bot must keep context.",
  "expected_outcome": "Answers stay grounded in the original post.",
  "expected_chunk_ids": ["chunk_doc_0002_001"],
  "context": "Optional extra instructions for the prompt.",
  "turns": [
    {
      "role": "user",
      "content": "I am interested in this dish. What is the post about?",
      "expected_assistant_output_outline": "Explain the main dish and key details."
    },
    {
      "role": "user",
      "content": "What is the most important detail?",
      "expected_assistant_output_outline": "Highlight the key point from the same post."
    }
  ]
}
```

## Output files
The evaluator writes both JSON and CSV:
- rag_eval_details_<run_id>.json/.csv: per-turn metrics
- rag_eval_summary_<run_id>.json/.csv: per-config aggregation

Detail fields (per turn):
- testcase_id, input, expected_chunk_id, retrieved_chunk_ids, actual_output
- contextual_recall_score, faithfulness_score, answer_relevancy_score
- knowledge_retention_score (conversational only)
- recall_at_1, recall_at_3, recall_at_5, mrr, latency_ms
- contextual_recall_pass, faithfulness_pass, answer_relevancy_pass, knowledge_retention_pass, pass_all

Summary fields (per config):
- chunking_method, chunk_size, chunk_overlap, embedding_model, topK, similarity_threshold
- average_contextual_recall, average_faithfulness, average_answer_relevancy
- average_knowledge_retention, average_mrr, average_latency_ms, pass_rate
