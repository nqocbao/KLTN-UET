"""Answer generator cho RAG food review.

System prompt và user prompt template lấy nguyên văn từ Phụ lục A.1 của
khóa luận. Module này được dùng chung bởi:
- runtime: action_rag_food_reviews trong chatbot/actions/actions.py
- eval: chatbot/rag/eval_vivutravel_rag_deepeval.py

Mục đích DRY là để bảo đảm prompt "được sử dụng nguyên văn cho mọi truy vấn"
như báo cáo nêu — tức prompt khi eval và prompt khi phục vụ user trùng nhau.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import List, Optional, Tuple

_CHUNK_MARKER_RE = re.compile(
    r"\s*[\(\[\{]\s*Chunk\s*\d+\s*[\)\]\}]\s*",
    re.IGNORECASE,
)


def strip_chunk_markers(text: str) -> str:
    """Loại bỏ các marker (Chunk N) / [Chunk N] / {Chunk N} lẫn vào câu trả lời.

    LLM được hướng dẫn không nhắc marker, nhưng đôi khi vẫn lỡ tay khi câu trả lời
    có nhiều bullet. Lớp này dọn dẹp triệt để trước khi trả về user.
    """
    if not text:
        return text
    cleaned = _CHUNK_MARKER_RE.sub(" ", text)
    cleaned = re.sub(r" +([,.;:!?])", r"\1", cleaned)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)
    cleaned = re.sub(r" +\n", "\n", cleaned)
    return cleaned.strip()

DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEFAULT_ANSWER_LANGUAGE = "tiếng Việt"
DEFAULT_TEMPERATURE = 0.2
DEFAULT_TIMEOUT_SECONDS = float(os.getenv("RAG_ANSWER_TIMEOUT", "20"))


SYSTEM_PROMPT_TEMPLATE = """Vai trò. Bạn là trợ lý du lịch và ẩm thực của VivuTravel, chuyên tư vấn các trải nghiệm food review thực tế tại Việt Nam.

Nguyên tắc sử dụng dữ liệu. Chỉ sử dụng ngữ cảnh đã truy hồi và phần lịch sử hội thoại có liên quan. Nếu thông tin cần thiết không xuất hiện trong ngữ cảnh đã truy hồi, hãy nói rõ rằng dữ liệu đó hiện chưa có trong ngữ cảnh. Nếu ngữ cảnh đã có bằng chứng phù hợp, cần trả lời trực tiếp từ bằng chứng đó thay vì từ chối.

Ngôn ngữ trả lời. Luôn trả lời bằng {answer_language}, mặc định là tiếng Việt tự nhiên, ngắn gọn và sát câu hỏi.

Ràng buộc chung. Không tự tạo, chuẩn hóa lại hoặc đổi tên quán ăn, món ăn hay địa danh không có trong ngữ cảnh. Chỉ đặt câu hỏi làm rõ khi yêu cầu của người dùng không thể trả lời từ dữ liệu hiện có.

Cách trả lời. Câu trả lời cần ngắn gọn, thực tế và đi thẳng vào câu hỏi. Với câu hỏi dữ kiện trực tiếp, trả lời thông tin được hỏi trước và không mở rộng thêm nếu người dùng không yêu cầu. Chỉ nêu giá, sentiment, số bình luận hoặc thông tin bổ sung khi người dùng hỏi hoặc khi cần cho so sánh trực tiếp. Không thêm câu kết chung chung.

Đối với bài food review. Mỗi chunk trong ngữ cảnh được đánh dấu bằng định dạng [Chunk {{i}}] và không được tách hoặc lặp lại. Tuyệt đối không nhắc lại các nhãn nội bộ như [Chunk 1], (Chunk 2), "chunk thứ nhất" hoặc bất kỳ tham chiếu nào tới số thứ tự chunk trong câu trả lời cuối — đây chỉ là nhãn nội bộ để bạn đối chiếu, người dùng cuối không được nhìn thấy. Khi người dùng hỏi về một trường cụ thể như tên quán, địa chỉ, mức giá, sentiment hoặc top comment, chỉ trả lời các dữ kiện có trong chunk tương ứng. Với câu hỏi tư vấn hoặc so sánh, chỉ sử dụng bằng chứng có trong các chunk được truy hồi, ưu tiên các bài có engagement.score cao và sentiment tích cực. Nếu thiếu thuộc tính cần thiết, hãy nói rõ là chưa có trong ngữ cảnh.

Đối với câu hỏi nằm ngoài phạm vi food review. Nếu câu hỏi chuyển sang chủ đề khách sạn, tour hoặc dịch vụ ngoài food, thông báo rằng phần food review không bao phủ chủ đề đó và đề xuất người dùng chuyển sang chức năng tương ứng của hệ thống. Không tự sinh câu trả lời từ tri thức nền của mô hình ngôn ngữ.

Cách dẫn nguồn. Khi câu trả lời tham chiếu một bài review cụ thể, ghi rõ tên quán hoặc địa danh, và đính kèm postUrl của chunk đã dùng để người dùng có thể kiểm tra. Nếu nhiều chunk cùng được sử dụng, liệt kê tối đa ba nguồn theo thứ tự độ liên quan giảm dần."""


def env_first(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return default


def default_answer_provider() -> str:
    return env_first("RAG_ANSWER_PROVIDER", "LLM_PROVIDER", default="openai")


def default_answer_model() -> str:
    configured = env_first("RAG_ANSWER_MODEL")
    if configured:
        return configured
    provider = default_answer_provider().lower().strip()
    if provider == "gemini":
        return "gemini-1.5-flash"
    if provider == "deepseek":
        return "deepseek-chat"
    return "gpt-4o-mini"


def default_answer_language() -> str:
    return env_first("RAG_ANSWER_LANGUAGE", default=DEFAULT_ANSWER_LANGUAGE)


def build_system_prompt(answer_language: Optional[str] = None) -> str:
    lang = (answer_language or default_answer_language()).strip() or DEFAULT_ANSWER_LANGUAGE
    return SYSTEM_PROMPT_TEMPLATE.format(answer_language=lang)


def build_user_prompt(
    question: str,
    contexts: List[str],
    history: Optional[List[Tuple[str, str]]] = None,
    extra_context: str = "",
    scenario: str = "",
) -> str:
    """Lắp ráp user prompt theo template phụ lục A.1."""
    context_block = "\n\n".join(
        f"[Chunk {idx + 1}]\n{ctx}" for idx, ctx in enumerate(contexts) if ctx
    )

    history_lines: List[str] = []
    for user_text, assistant_text in history or []:
        if user_text:
            history_lines.append(f"User: {user_text}")
        if assistant_text:
            history_lines.append(f"Assistant: {assistant_text}")
    history_block = "\n".join(history_lines)

    parts: List[str] = [
        "Answer in Vietnamese using only the retrieved context.",
        "If the answer is not in the context, say you do not know.",
    ]

    if scenario:
        parts.append(f"Scenario: {scenario}")

    if extra_context:
        parts.append(f"Additional context: {extra_context}")

    if history_block:
        parts.append(f"Conversation history:\n{history_block}")

    if context_block:
        parts.append(f"Retrieved context:\n{context_block}")

    parts.append(f"Question: {question}\nAnswer:")
    return "\n\n".join(parts)


@dataclass
class GenerationResult:
    text: str
    used_chunk_indices: List[int]


class AnswerGenerator:
    """LLM wrapper hỗ trợ openai / deepseek / gemini / none."""

    def __init__(
        self,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        answer_language: Optional[str] = None,
        temperature: float = DEFAULT_TEMPERATURE,
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
    ) -> None:
        self.provider = (provider or default_answer_provider()).lower().strip()
        self.model = model or default_answer_model()
        self.answer_language = answer_language or default_answer_language()
        self.temperature = temperature
        self.timeout = timeout
        self._client = None
        self._system_prompt = build_system_prompt(self.answer_language)

    @property
    def system_prompt(self) -> str:
        return self._system_prompt

    def _ensure_client(self) -> None:
        if self._client is not None or self.provider == "none":
            return

        if self.provider == "openai":
            from openai import OpenAI

            api_key = env_first("OPENAI_API_KEY")
            if not api_key and os.getenv("LLM_PROVIDER", "").lower().strip() == "openai":
                api_key = os.getenv("LLM_API_KEY", "")
            if not api_key:
                raise RuntimeError(
                    "Missing OPENAI_API_KEY for OpenAI provider. "
                    "Set OPENAI_API_KEY in chatbot/.env."
                )
            self._client = OpenAI(api_key=api_key, timeout=self.timeout)
            return

        if self.provider == "deepseek":
            from openai import OpenAI

            api_key = env_first("DEEPSEEK_API_KEY")
            if not api_key and os.getenv("LLM_PROVIDER", "").lower().strip() == "deepseek":
                api_key = os.getenv("LLM_API_KEY", "")
            if not api_key:
                raise RuntimeError(
                    "Missing DEEPSEEK_API_KEY for DeepSeek provider. "
                    "Set DEEPSEEK_API_KEY in chatbot/.env."
                )
            base_url = os.getenv("DEEPSEEK_BASE_URL", DEFAULT_DEEPSEEK_BASE_URL)
            self._client = OpenAI(api_key=api_key, base_url=base_url, timeout=self.timeout)
            return

        if self.provider == "gemini":
            import google.generativeai as genai

            api_key = env_first("GEMINI_API_KEY")
            if not api_key and os.getenv("LLM_PROVIDER", "").lower().strip() == "gemini":
                api_key = os.getenv("LLM_API_KEY", "")
            if not api_key:
                raise RuntimeError("Missing GEMINI_API_KEY for Gemini provider")
            genai.configure(api_key=api_key)
            self._client = genai
            return

        raise RuntimeError(f"Unsupported LLM provider: {self.provider}")

    def generate(
        self,
        question: str,
        contexts: List[str],
        history: Optional[List[Tuple[str, str]]] = None,
        extra_context: str = "",
        scenario: str = "",
    ) -> str:
        if self.provider == "none":
            return ""

        self._ensure_client()
        user_prompt = build_user_prompt(
            question=question,
            contexts=contexts,
            history=history,
            extra_context=extra_context,
            scenario=scenario,
        )

        if self.provider in ("openai", "deepseek"):
            response = self._client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                messages=[
                    {"role": "system", "content": self._system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            content = response.choices[0].message.content or ""
            return strip_chunk_markers(content)

        if self.provider == "gemini":
            model = self._client.GenerativeModel(
                self.model,
                system_instruction=self._system_prompt,
            )
            response = model.generate_content(user_prompt)
            return strip_chunk_markers(response.text or "")

        return ""


_DEFAULT_GENERATOR: Optional[AnswerGenerator] = None


def get_default_generator() -> AnswerGenerator:
    """Singleton, lazy-init theo env vars hiện hành."""
    global _DEFAULT_GENERATOR
    if _DEFAULT_GENERATOR is None:
        _DEFAULT_GENERATOR = AnswerGenerator()
    return _DEFAULT_GENERATOR
