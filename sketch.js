// --- 全域變數 ---
let currentHangeulInfo = '點擊字母發音';
let hangeulList = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// --- 區域 1: 基礎入門區 (Hangeul Canvas Instance) ---
const hangeulSketch = (p) => {
    let canvasW = 650;
    let canvasH = 250;
    let hangeulSize = 50;
    let currentHangeul = 'ㄱ';
    
    p.setup = () => {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('hangeul-canvas-container'); 
        p.textAlign(p.CENTER, p.CENTER);
    };

    p.draw = () => {
        p.background(255, 250, 240); // 淺米黃色背景
        p.drawHangeulArea();

        // 顯示發音資訊
        p.fill(50);
        p.textSize(20);
        p.textAlign(p.LEFT, p.TOP);
        p.text(`[${currentHangeul}]: ${currentHangeulInfo}`, 20, canvasH - 40);
    };

    p.drawHangeulArea = () => {
        let x = 50;
        let y = 50;
        
        for (let i = 0; i < hangeulList.length; i++) {
            let letter = hangeulList[i];
            let isHover = p.mouseX > x && p.mouseX < x + hangeulSize && p.mouseY > y && p.mouseY < y + hangeulSize;
            
            if (isHover) {
                p.fill(255, 220, 150); 
            } else if (letter === currentHangeul) {
                p.fill(255, 180, 50); 
            } else {
                p.fill(200);
            }
            p.rect(x, y, hangeulSize, hangeulSize, 5);

            p.fill(0);
            p.textSize(32);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(letter, x + hangeulSize / 2, y + hangeulSize / 2);
            
            x += hangeulSize + 10;
            if ((i + 1) % 8 === 0) { 
                x = 50;
                y += hangeulSize + 10;
            }
        }
    };

    p.mousePressed = () => {
        let x = 50;
        let y = 50;
        
        for (let i = 0; i < hangeulList.length; i++) {
            let letter = hangeulList[i];
            if (p.mouseX > x && p.mouseX < x + hangeulSize && p.mouseY > y && p.mouseY < y + hangeulSize) {
                currentHangeul = letter;
                const sounds = {
                    'ㄱ': 'g/k', 'ㄴ': 'n', 'ㄷ': 'd/t', 'ㄹ': 'r/l', 'ㅁ': 'm', 
                    'ㅂ': 'b/p', 'ㅅ': 's', 'ㅇ': 'ng/silent', 'ㅈ': 'j', 'ㅊ': 'ch', 
                    'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
                };
                currentHangeulInfo = `發音：[${sounds[letter]}]，請跟著念！`;
                return;
            }
            x += hangeulSize + 10;
            if ((i + 1) % 8 === 0) {
                x = 50;
                y += hangeulSize + 10;
            }
        }
    };
};

// --- 區域 2: 配對遊戲 (Matching Game Instance) ---
const matchingSketch = (p) => {
    let canvasW = 950; 
    let canvasH = 500;
    let cardSize = 120; 
    let margin = 30; 
    
    let items = []; 
    let selectedCard = null; 
    let matchesFound = 0;
    
    // ****** 圖片變數已修改：將 img_seoul 替換為 img_bulgogi ******
    let img_kimchi; 
    let img_hanbok;
    let img_soju;
    let img_bulgogi; // *** 新增：韓式烤肉圖片變數 ***
    let img_bibimbap; 
    
    // 遊戲數據：韓文詞彙與對應的圖片檔名
    const matchData = [
        { id: 1, text: "김치 (Kimchi)", img_key: "kimchi" },
        { id: 2, text: "한복 (Hanbok)", img_key: "hanbok" },
        { id: 3, text: "소주 (Soju)", img_key: "soju" },
        { id: 4, text: "불고기 (Bulgogi)", img_key: "bulgogi" }, // *** 已修改：首爾 -> 烤肉 ***
        { id: 5, text: "비빔밥 (Bibimbap)", img_key: "bibimbap" }, 
    ];
    
    // 預載圖片
    p.preload = () => {
        // ****** 圖片載入檔名已修改 ******
        // 請確認您已將 'seoul.jpg' 替換為 'bulgogi.jpg' 檔案
        img_kimchi = p.loadImage('kimchi.jpg'); 
        img_hanbok = p.loadImage('hanbok.jpg');
        img_soju = p.loadImage('soju.jpg');
        img_bulgogi = p.loadImage('bulgogi.jpg'); // *** 載入新的烤肉圖片 ***
        img_bibimbap = p.loadImage('bibimbap.jpg'); 
    }

    p.setup = () => {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('matching-canvas-container');
        p.imageMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.initGame();
    };
    
    // 初始化遊戲卡片位置
    p.initGame = () => {
        items = [];
        matchesFound = 0;
        
        // 將圖片變數存入陣列，方便後續遍歷
        const allImages = [
            { id: 1, img: img_kimchi }, 
            { id: 2, img: img_hanbok }, 
            { id: 3, img: img_soju },
            { id: 4, img: img_bulgogi }, // *** 使用新的烤肉圖片變數 ***
            { id: 5, img: img_bibimbap } 
        ];
        
        // 定義起始位置，並計算卡片總寬度
        const totalCardWidth = matchData.length * cardSize + (matchData.length - 1) * margin;
        const startX = (canvasW - totalCardWidth) / 2 + cardSize / 2; // 讓卡片置中
        
        // 1. 創建文字卡 (韓文) - 放在上半部分
        for(let i = 0; i < matchData.length; i++) {
            let data = matchData[i];
            items.push({ 
                type: 'text', id: data.id, value: data.text, matched: false,
                x: startX + i * (cardSize + margin) - cardSize/2, y: canvasH / 3 - cardSize/2, 
                w: cardSize, h: cardSize 
            });
        }

        // 2. 創建圖片卡 - 放在下半部分
        for(let i = 0; i < allImages.length; i++) {
             let img = allImages[i];
             items.push({ 
                type: 'image', id: img.id, value: img.img, matched: false,
                x: startX + i * (cardSize + margin) - cardSize/2, y: canvasH * 2 / 3 - cardSize/2, 
                w: cardSize, h: cardSize 
            });
        }
    }

    p.draw = () => {
        p.background(255, 255, 255); 
        p.textSize(24); 
        
        for (let item of items) {
            if (item.matched) continue; 
            
            p.push();
            p.translate(item.x, item.y);

            // 繪製卡片背景
            if (selectedCard === item) {
                p.fill(255, 230, 100); 
            } else {
                p.fill(240);
            }
            p.stroke(50);
            p.rect(0, 0, item.w, item.h, 8); 

            // 繪製內容
            if (item.type === 'text') {
                p.fill(50);
                p.textSize(28); 
                p.text(item.value.split(' ')[0], item.w/2, item.h/2); 
            } else if (item.type === 'image') {
                p.image(item.value, item.w/2, item.h/2, item.w * 0.9, item.h * 0.9);
            }
            p.pop();
        }

        if (matchesFound === matchData.length) {
            p.fill(50, 200, 50);
            p.textSize(36);
            p.text("🎉 配對成功！遊戲完成！ 🎉", canvasW/2, canvasH/2);
        }
    };
    
    p.mousePressed = () => {
        for (let item of items) {
            if (item.matched) continue;
            
            // 檢查點擊是否在卡片範圍內
            if (p.mouseX > item.x && p.mouseX < item.x + item.w &&
                p.mouseY > item.y && p.mouseY < item.y + item.h) {
                
                if (selectedCard === null) {
                    selectedCard = item;
                } else if (selectedCard === item) {
                    selectedCard = null;
                } else {
                    if (selectedCard.id === item.id && selectedCard.type !== item.type) {
                        // 匹配成功！
                        selectedCard.matched = true;
                        item.matched = true;
                        selectedCard = null; 
                        matchesFound++;
                    } else {
                        // 匹配失敗
                        selectedCard = item; 
                    }
                }
                break; 
            }
        }
    };
};

// --- 主程式 Setup ---
function setup() {
    currentHangeulInfo = '點擊字母發音';
    
    // 創建 p5.js 實例 (Instance Mode)
    new p5(hangeulSketch);
    new p5(matchingSketch);
    
    // 不需主畫布
    noCanvas(); 
}

function draw() {
    // 留空
}