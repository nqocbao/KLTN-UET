import { normalizeFacebookFoodPost } from './server/utils/food-review-normalizer';

const samples = [
  "Cơ sở 2 Lĩnh Nam Hoàng Mai Hà Nội",
  "📍 Địa chỉ: Cơ sở 2 Lĩnh Nam Hoàng Mai Hà Nội",
  "Quán A tọa lạc tại Cơ sở 2 Lĩnh Nam Hoàng Mai Hà Nội",
  "Quán A tọa lạc tại Cơ sở 2 Lĩnh Nam, Hoàng Mai, Hà Nội"
];

samples.forEach((text, index) => {
  const result = normalizeFacebookFoodPost({ text });
  console.log(`Sample ${index + 1}:`);
  console.log('Result:', result);
  console.log('---');
});
