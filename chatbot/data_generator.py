"""
Data Generator for RASA Chatbot
Reward-Guided In-Context Learning with LLM + Vector Database
====================================================================
Tự động sinh và làm sạch dữ liệu huấn luyện cho chatbot du lịch
Sử dụng: Gemini API + ChromaDB + Reward-based filtering
"""

import os
import yaml
import json
import requests
from typing import List, Dict, Tuple
from dataclasses import dataclass
import google.generativeai as genai
from dotenv import load_dotenv
import time
from difflib import SequenceMatcher

load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv('LLM_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

@dataclass
class TrainingExample:
    """Training example với metadata"""
    text: str
    intent: str
    confidence: float
    reward_score: float = 0.0
    
class VectorMemory:
    """Simple in-memory storage để lưu trữ và tìm kiếm examples tương tự"""
    
    def __init__(self, collection_name: str = "training_examples"):
        self.examples = []  # List of TrainingExample
        self.collection_name = collection_name
        print(f"✓ Initialized memory collection: {collection_name}")
    
    def add_examples(self, examples: List[TrainingExample]):
        """Thêm examples vào memory"""
        if not examples:
            return
        self.examples.extend(examples)
        print(f"✓ Added {len(examples)} examples to memory (total: {len(self.examples)})")
    
    def similarity(self, text1: str, text2: str) -> float:
        """Tính độ tương tự giữa 2 text (0-1)"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def find_similar(self, text: str, n_results: int = 5) -> List[Dict]:
        """Tìm examples tương tự"""
        similarities = []
        for ex in self.examples:
            sim = self.similarity(text, ex.text)
            similarities.append((sim, ex))
        
        similarities.sort(reverse=True, key=lambda x: x[0])
        return [{"text": ex.text, "intent": ex.intent, "similarity": sim} 
                for sim, ex in similarities[:n_results]]
    
    def is_duplicate(self, text: str, threshold: float = 0.9) -> bool:
        """Kiểm tra xem text có trùng với examples đã có không"""
        for ex in self.examples:
            if self.similarity(text, ex.text) > threshold:
                return True
        return False

class LLMGenerator:
    """Gemini LLM để sinh training examples"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
        self.generation_config = {
            'temperature': 0.9,  # Cao để đa dạng
            'top_p': 0.95,
            'top_k': 40,
            'max_output_tokens': 2048,
        }
    
    def generate_examples(self, intent: str, existing_examples: List[str], 
                         count: int = 20) -> List[str]:
        """Sinh examples mới cho intent với In-Context Learning"""
        
        examples_text = "\n".join([f"- {ex}" for ex in existing_examples[:5]])
        
        prompt = f"""Bạn là chuyên gia sinh dữ liệu huấn luyện cho chatbot du lịch Việt Nam.

Intent: {intent}

Ví dụ hiện có:
{examples_text}

Nhiệm vụ: Sinh {count} câu tiếng Việt MỚI và ĐA DẠNG cho intent này.

YÊU CẦU:
1. Đa dạng cấu trúc: câu ngắn, câu dài, câu hỏi, câu khẳng định
2. Bao gồm CẢ ĐẢO NGỮ: "khách sạn Hà Nội tìm giúp tôi", "ở Đà Nẵng có resort nào không"
3. Nhiều cách diễn đạt khác nhau: formal, informal, typo nhẹ
4. Bao gồm tên địa danh Việt Nam: Hà Nội, Đà Nẵng, Nha Trang, Phú Quốc, Sapa, Hội An, v.v.
5. KHÔNG lặp lại ví dụ đã có
6. KHÔNG sử dụng ký tự đặc biệt, chỉ text thuần

Format output:
1. [câu 1]
2. [câu 2]
...

Bắt đầu sinh:"""

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # Parse response
            generated = response.text.strip().split('\n')
            examples = []
            for line in generated:
                line = line.strip()
                # Remove numbering
                if line and (line[0].isdigit() or line.startswith('-')):
                    text = line.split('.', 1)[-1].split('-', 1)[-1].strip()
                    if text and len(text) > 3:
                        examples.append(text)
            
            print(f"✓ Generated {len(examples)} examples for intent '{intent}'")
            return examples[:count]
            
        except Exception as e:
            print(f"✗ Error generating examples: {e}")
            return []

class RewardEvaluator:
    """Đánh giá quality của generated examples bằng reward scores"""
    
    def __init__(self, vector_memory: VectorMemory):
        self.vector_memory = vector_memory
    
    def calculate_reward(self, example: TrainingExample, 
                        existing_examples: List[str]) -> float:
        """
        Tính reward score dựa trên:
        1. Diversity (khác biệt với examples hiện có)
        2. Length (độ dài hợp lý)
        3. Quality (không có ký tự lạ, cấu trúc tốt)
        """
        reward = 0.0
        text = example.text
        
        # 1. Diversity score (0-0.4)
        if not self.vector_memory.is_duplicate(text, threshold=0.85):
            reward += 0.4
        else:
            reward += 0.1  # Hơi trùng nhưng vẫn có giá trị
        
        # 2. Length score (0-0.3)
        word_count = len(text.split())
        if 3 <= word_count <= 15:
            reward += 0.3
        elif word_count < 3:
            reward += 0.1
        else:
            reward += 0.2
        
        # 3. Quality score (0-0.3)
        quality = 0.3
        # Penalize if has weird characters
        if any(char in text for char in ['[', ']', '{', '}', '<', '>']):
            quality -= 0.15
        # Penalize if too many punctuation
        punct_count = sum(1 for c in text if c in '!?.,;:')
        if punct_count > 3:
            quality -= 0.1
        # Reward if contains Vietnamese location names
        locations = ['Hà Nội', 'Đà Nẵng', 'Nha Trang', 'Phú Quốc', 'Sapa', 'Hội An', 
                    'Sài Gòn', 'TP.HCM', 'Huế', 'Vũng Tàu', 'Đà Lạt', 'Phan Thiết']
        if any(loc.lower() in text.lower() for loc in locations):
            quality += 0.1
        
        reward += max(0, quality)
        
        return min(1.0, reward)  # Cap at 1.0

class DataAugmentor:
    """Main class orchestrating data augmentation pipeline"""
    
    def __init__(self):
        self.vector_memory = VectorMemory()
        self.llm_generator = LLMGenerator()
        self.reward_evaluator = RewardEvaluator(self.vector_memory)
        self.nlu_file = "data/nlu.yml"
    
    def load_existing_data(self) -> Dict[str, List[str]]:
        """Load existing training data from nlu.yml"""
        with open(self.nlu_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        intent_examples = {}
        for item in data['nlu']:
            intent = item['intent']
            examples = item['examples'].strip().split('\n')
            examples = [ex.strip('- ').strip() for ex in examples if ex.strip()]
            intent_examples[intent] = examples
        
        print(f"✓ Loaded {len(intent_examples)} intents from {self.nlu_file}")
        return intent_examples
    
    def augment_intent(self, intent: str, existing_examples: List[str], 
                      target_count: int = 50) -> List[TrainingExample]:
        """Augment data cho một intent"""
        print(f"\n{'='*60}")
        print(f"Augmenting intent: {intent}")
        print(f"Existing: {len(existing_examples)} examples")
        print(f"Target: {target_count} examples")
        print(f"{'='*60}")
        
        current_count = len(existing_examples)
        if current_count >= target_count:
            print(f"✓ Already have enough examples ({current_count} >= {target_count})")
            return []
        
        # Add existing examples to vector memory
        existing_ex_objs = [
            TrainingExample(text=ex, intent=intent, confidence=1.0, reward_score=1.0)
            for ex in existing_examples
        ]
        self.vector_memory.add_examples(existing_ex_objs)
        
        # Generate new examples
        need_count = target_count - current_count
        generated = self.llm_generator.generate_examples(
            intent, existing_examples, count=need_count * 2  # Generate more to filter
        )
        
        # Filter and score with rewards
        new_examples = []
        for text in generated:
            ex = TrainingExample(text=text, intent=intent, confidence=0.0)
            reward = self.reward_evaluator.calculate_reward(ex, existing_examples)
            ex.reward_score = reward
            
            # Only keep examples with good reward
            if reward >= 0.5:  # Threshold
                new_examples.append(ex)
        
        # Sort by reward and take top N
        new_examples.sort(key=lambda x: x.reward_score, reverse=True)
        new_examples = new_examples[:need_count]
        
        # Add to vector memory
        self.vector_memory.add_examples(new_examples)
        
        print(f"✓ Generated {len(new_examples)} new examples (avg reward: {sum(e.reward_score for e in new_examples)/len(new_examples) if new_examples else 0:.2f})")
        return new_examples
    
    def save_augmented_data(self, augmented_data: Dict[str, List[TrainingExample]]):
        """Save augmented data to nlu.yml"""
        # Load original structure
        with open(self.nlu_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        # Update with augmented examples
        for item in data['nlu']:
            intent = item['intent']
            if intent in augmented_data and augmented_data[intent]:
                # Get existing examples
                existing = item['examples'].strip().split('\n')
                existing = [ex.strip() for ex in existing if ex.strip()]
                
                # Add new examples
                new_texts = [f"      - {ex.text}" for ex in augmented_data[intent]]
                all_examples = existing + new_texts
                
                # Update
                item['examples'] = "\n" + "\n".join(all_examples)
        
        # Save backup
        backup_file = self.nlu_file.replace('.yml', '_backup.yml')
        with open(backup_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False)
        print(f"✓ Backup saved to {backup_file}")
        
        # Save new version
        with open(self.nlu_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False)
        print(f"✓ Augmented data saved to {self.nlu_file}")
    
    def run_augmentation(self, intents: List[str] = None, target_count: int = 50):
        """Run full augmentation pipeline"""
        print("\n" + "="*60)
        print("REWARD-GUIDED DATA AUGMENTATION PIPELINE")
        print("="*60)
        
        # Load existing data
        intent_examples = self.load_existing_data()
        
        # Filter intents if specified
        if intents:
            intent_examples = {k: v for k, v in intent_examples.items() if k in intents}
        
        # Augment each intent
        augmented_data = {}
        for intent, examples in intent_examples.items():
            new_examples = self.augment_intent(intent, examples, target_count)
            if new_examples:
                augmented_data[intent] = new_examples
            time.sleep(1)  # Rate limiting for API
        
        # Save results
        if augmented_data:
            self.save_augmented_data(augmented_data)
            
            # Print summary
            print("\n" + "="*60)
            print("AUGMENTATION SUMMARY")
            print("="*60)
            total_new = sum(len(examples) for examples in augmented_data.values())
            print(f"Total intents augmented: {len(augmented_data)}")
            print(f"Total new examples: {total_new}")
            for intent, examples in augmented_data.items():
                avg_reward = sum(e.reward_score for e in examples) / len(examples)
                print(f"  - {intent}: +{len(examples)} examples (avg reward: {avg_reward:.2f})")
            print("="*60)
        else:
            print("\n✓ No augmentation needed - all intents have sufficient examples")

def main():
    """Main entry point"""
    augmentor = DataAugmentor()
    
    # Augment key intents (có thể customize)
    key_intents = [
        'search_hotel',
        'search_destination', 
        'search_tour',
        'ask_recommendation',
        'search_flight',
        'book_hotel'
    ]
    
    augmentor.run_augmentation(intents=key_intents, target_count=50)
    
    print("\n✓ Data augmentation complete!")
    print("Next steps:")
    print("1. Review augmented data in data/nlu.yml")
    print("2. Train model: rasa train")
    print("3. Test: rasa shell")

if __name__ == "__main__":
    main()
