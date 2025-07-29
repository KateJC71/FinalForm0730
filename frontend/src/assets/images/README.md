# 圖片使用說明

## 如何在此專案中使用圖片

### 方法1: 放在 src/assets/images/ 目錄
- 適合需要處理的圖片（如需要優化、壓縮等）
- 使用 import 方式引入

```jsx
import heroImage from '../assets/images/hero-image.jpg';

function Home() {
  return <img src={heroImage} alt="Hero" />;
}
```

### 方法2: 放在 public/ 目錄
- 適合靜態圖片，不需要處理
- 直接使用路徑引用

```jsx
function Home() {
  return <img src="/hero-image.jpg" alt="Hero" />;
}
```

## 建議的圖片格式
- JPG: 適合照片
- PNG: 適合有透明背景的圖片
- WebP: 現代瀏覽器支援，檔案較小
- SVG: 適合圖標和簡單圖形