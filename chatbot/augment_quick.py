"""
Quick Data Augmentation - Manual Patterns
Tăng cường dữ liệu huấn luyện với patterns đảo ngữ và paraphrasing
Không cần LLM API - chạy ngay lập tức
"""

import yaml
from typing import List, Dict

class QuickAugmentor:
    """Augmentation bằng pattern-based rules"""
    
    def __init__(self):
        self.nlu_file = "data/nlu.yml"
        
        # Các địa danh Việt Nam phổ biến
        self.locations = [
            "Hà Nội", "Đà Nẵng", "Nha Trang", "Phú Quốc", "Sapa",
            "Hội An", "Sài Gòn", "TP.HCM", "Huế", "Vũng Tàu",
            "Đà Lạt", "Phan Thiết", "Quy Nhơn", "Cần Thơ", "Hạ Long"
        ]
        
        # Patterns đảo ngữ và biến thể cho từng intent
        self.augmentation_patterns = {
            'search_hotel': [
                "khách sạn ở {location}",
                "ở {location} có khách sạn nào không",
                "{location} có hotel nào đẹp",
                "tìm giúp tôi khách sạn ở {location}",
                "khách sạn {location} tìm giúp tôi",
                "ở {location} tìm khách sạn",
                "resort ở {location}",
                "tìm chỗ nghỉ ở {location}",
                "booking khách sạn tại {location}",
                "cho tôi xem hotel {location}",
                "có chỗ nào ở {location} không",
                "{location} có nơi nào ngủ không",
                "tìm phòng ở {location}",
                "đặt phòng khách sạn {location}",
                "khách sạn giá rẻ ở {location}"
            ],
            'search_destination': [
                "gợi ý điểm đến",
                "nên đi đâu",
                "đi đâu chơi tốt",
                "địa điểm du lịch nào đẹp",
                "điểm đến hot hiện nay",
                "nơi nào đáng đi",
                "tư vấn điểm đến cho tôi",
                "có địa điểm nào hay không",
                "giới thiệu nơi du lịch",
                "địa điểm du lịch hay ở Việt Nam",
                "đi du lịch nên chọn đâu",
                "chỗ nào đẹp để đi chơi",
                "du lịch đi đâu là hợp lý",
                "mùa này nên đi đâu",
                "điểm du lịch nổi tiếng"
            ],
            'search_tour': [
                "tìm tour",
                "có tour nào hay không",
                "tour đi {location}",
                "tour du lịch {location}",
                "tour nội địa",
                "tìm tour trong nước",
                "tour nước ngoài",
                "có tour giá rẻ không",
                "tour 3 ngày 2 đêm",
                "tour ngắn ngày",
                "{location} có tour không",
                "book tour đi {location}",
                "đăng ký tour du lịch",
                "tour đoàn đi {location}",
                "tour trọn gói {location}"
            ],
            'ask_recommendation': [
                "gợi ý cho tôi",
                "recommend điểm đến",
                "tư vấn nên đi đâu",
                "chọn nơi nào tốt",
                "ý kiến của bạn là gì",
                "bạn nghĩ sao về {location}",
                "nên chọn {location} hay không",
                "địa điểm nào phù hợp với tôi",
                "gợi ý địa danh đẹp",
                "tư vấn tour tốt nhất",
                "khách sạn nào đáng ở",
                "chọn resort nào tốt",
                "gợi ý chuyến đi",
                "nơi nào đẹp nhất",
                "điểm đến lý tưởng"
            ],
            'search_flight': [
                "tìm vé máy bay",
                "vé bay đi {location}",
                "chuyến bay từ Hà Nội đến {location}",
                "máy bay đi {location}",
                "book vé máy bay",
                "có chuyến bay nào không",
                "vé máy bay giá rẻ",
                "bay từ TP.HCM đến {location}",
                "chuyến bay khứ hồi",
                "vé bay ngày mai",
                "tìm vé bay",
                "đặt vé máy bay đi {location}",
                "có flight nào không",
                "vé máy bay trong nước",
                "bay quốc tế"
            ],
            'book_hotel': [
                "đặt phòng",
                "book khách sạn",
                "đặt khách sạn ở {location}",
                "tôi muốn đặt phòng",
                "booking hotel",
                "đặt chỗ nghỉ",
                "đặt resort",
                "làm sao để đặt phòng",
                "muốn book phòng",
                "đặt ngay",
                "tôi đặt khách sạn này",
                "book phòng đôi",
                "đặt 2 phòng",
                "đặt phòng cho 3 người",
                "thuê phòng khách sạn"
            ]
        }
    
    def load_existing_data(self) -> Dict[str, List[str]]:
        """Load existing training data"""
        with open(self.nlu_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        intent_examples = {}
        for item in data['nlu']:
            intent = item['intent']
            examples = item['examples'].strip().split('\n')
            examples = [ex.strip('- ').strip() for ex in examples if ex.strip()]
            intent_examples[intent] = examples
        
        return intent_examples
    
    def augment_intent(self, intent: str, existing: List[str]) -> List[str]:
        """Augment examples cho một intent"""
        if intent not in self.augmentation_patterns:
            return []
        
        new_examples = []
        patterns = self.augmentation_patterns[intent]
        
        for pattern in patterns:
            if '{location}' in pattern:
                # Generate với nhiều địa danh
                for loc in self.locations[:10]:  # Top 10 địa danh
                    example = pattern.format(location=loc)
                    if example not in existing and example not in new_examples:
                        new_examples.append(example)
            else:
                # Pattern không có location
                if pattern not in existing:
                    new_examples.append(pattern)
        
        return new_examples
    
    def save_augmented_data(self, all_data: Dict[str, List[str]]):
        """Save augmented data to nlu.yml"""
        # Create new YAML structure
        nlu_data = []
        
        for intent, examples in all_data.items():
            examples_text = "\n".join([f"      - {ex}" for ex in examples])
            nlu_data.append({
                'intent': intent,
                'examples': f"\n{examples_text}"
            })
        
        output = {'version': '3.1', 'nlu': nlu_data}
        
        # Backup
        backup_file = self.nlu_file.replace('.yml', '_backup.yml')
        with open(self.nlu_file, 'r', encoding='utf-8') as f:
            with open(backup_file, 'w', encoding='utf-8') as bf:
                bf.write(f.read())
        print(f"✓ Backup saved to {backup_file}")
        
        # Save new version
        with open(self.nlu_file, 'w', encoding='utf-8') as f:
            yaml.dump(output, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        print(f"✓ Augmented data saved to {self.nlu_file}")
    
    def run(self):
        """Run augmentation"""
        print("="*60)
        print("PATTERN-BASED DATA AUGMENTATION")
        print("="*60)
        
        # Load existing
        existing_data = self.load_existing_data()
        print(f"\n✓ Loaded {len(existing_data)} intents")
        
        # Augment
        augmented_data = {}
        total_added = 0
        
        for intent, existing in existing_data.items():
            if intent in self.augmentation_patterns:
                new_examples = self.augment_intent(intent, existing)
                all_examples = existing + new_examples
                augmented_data[intent] = all_examples
                
                print(f"\n{intent}:")
                print(f"  Existing: {len(existing)}")
                print(f"  Added: {len(new_examples)}")
                print(f"  Total: {len(all_examples)}")
                total_added += len(new_examples)
            else:
                augmented_data[intent] = existing
        
        # Save
        self.save_augmented_data(augmented_data)
        
        print("\n" + "="*60)
        print("SUMMARY")
        print("="*60)
        print(f"Total new examples added: {total_added}")
        print(f"Intents augmented: {len(self.augmentation_patterns)}")
        print("="*60)
        print("\n✓ Augmentation complete!")
        print("\nNext steps:")
        print("1. Review: data/nlu.yml")
        print("2. Train: rasa train")
        print("3. Test: rasa shell")

if __name__ == "__main__":
    augmentor = QuickAugmentor()
    augmentor.run()
