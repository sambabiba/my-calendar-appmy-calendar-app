const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 정적 파일 서빙 (CSS, JS, 이미지 등)
app.use('/static', express.static('.'));

// 메인 페이지 - 환경변수를 HTML에 주입
app.get('/', (req, res) => {
  try {
    // index.html 파일 읽기
    let html = fs.readFileSync('index.html', 'utf8');
    
    // 환경변수 주입 스크립트를 head 태그 끝에 추가
    const envScript = `
    <script>
        // Azure 환경변수에서 API 키 설정
        window.GEMINI_API_KEY = '${process.env.GEMINI_API_KEY || ''}';
        console.log('✅ 서버에서 환경변수 주입:', window.GEMINI_API_KEY ? '설정됨' : '설정안됨');
    </script>
</head>`;
    
    // </head> 태그를 찾아서 환경변수 스크립트 주입
    html = html.replace('</head>', envScript);
    
    res.send(html);
  } catch (error) {
    console.error('HTML 파일 읽기 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// script.js 파일 제공 (정적 파일로)
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// CSS 파일 제공
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// 기타 정적 파일들
app.use(express.static('.'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 서버가 포트 ${port}에서 실행중입니다`);
    console.log(`🔑 GEMINI_API_KEY 환경변수:`, process.env.GEMINI_API_KEY ? '설정됨' : '설정안됨');
});
