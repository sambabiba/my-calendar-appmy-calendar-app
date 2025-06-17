const express = require('express');
const path = require('path');
const app = express();

// 정적 파일 서빙
app.use(express.static('.'));

// 메인 페이지 - 환경변수를 HTML에 주입
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <!-- 기존 head 내용 -->
</head>
<body>
    <!-- 환경변수를 window 객체에 설정 -->
    <script>
        window.GEMINI_API_KEY = '${process.env.GEMINI_API_KEY || ''}';
    </script>
    
    <!-- 기존 body 내용들 -->
    
    <script src="script.js"></script>
</body>
</html>
  `;
  res.send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
