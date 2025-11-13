// --- 全域變數 ---
let currentHangeulInfo = '點擊字母發音';
let hangeulList = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// --- 輔助類別：掉落的字母 (Falling Letter) ---
class FallingLetter {
    constructor(p, x, y, letter, sound) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.letter = letter;
        this.sound = sound;
        this.speed = p.random(1, 3);
        this.exploded = false;
        this.explosionTimer = 30; // 爆炸動畫持續幀數
    }

    move() {
        this.y += this.speed;
    }

    display() {
        if (this.exploded) {
            this.p.textSize(40 + (30 - this.explosionTimer));
            this.p.fill(255, 50, 50, this.explosionTimer * 8); // 紅色，逐漸透明
            this.p.text('💥', this.x, this.y);
            this.explosionTimer--;
        } else {
            this.p.textSize(40);
            this.p.fill(50, 70, 150); // 深藍色
            this.p.text(this.letter, this.x, this.y);
        }
    }

    isOffScreen(h) {
        return this.y > h;
    }
}


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
    // ... (draw, drawHangeulArea, mousePressed 邏輯不變) ...
    p.draw = () => {
        p.background(255, 250, 240); 
        p.drawHangeulArea();

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
            
            if (isHover) { p.fill(255, 220, 150); } 
            else if (letter === currentHangeul) { p.fill(255, 180, 50); } 
            else { p.fill(200); }
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
    
    // ****** 圖片變數 ******
    let img_kimchi; 
    let img_hanbok;
    let img_soju;
    let img_bulgogi; 
    let img_bibimbap; 
    
    // 遊戲數據：韓文詞彙與對應的圖片檔名
    const matchData = [
        { id: 1, text: "김치 (Kimchi)", img_key: "kimchi" },
        { id: 2, text: "한복 (Hanbok)", img_key: "hanbok" },
        { id: 3, text: "소주 (Soju)", img_key: "soju" },
        { id: 4, text: "불고기 (Bulgogi)", img_key: "bulgogi" }, 
        { id: 5, text: "비빔밥 (Bibimbap)", img_key: "bibimbap" }, 
    ];
    
    // 預載圖片
    p.preload = () => {
        // 請確保您的圖片檔名和路徑正確
        img_kimchi = p.loadImage('kimchi.jpg'); 
        img_hanbok = p.loadImage('hanbok.jpg');
        img_soju = p.loadImage('soju.jpg');
        img_bulgogi = p.loadImage('bulgogi.jpg'); 
        img_bibimbap = p.loadImage('bibimbap.jpg'); 
    }
    // ... (setup, initGame, draw, mousePressed 邏輯不變) ...
    p.setup = () => {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('matching-canvas-container');
        p.imageMode(p.CENTER);
        p.textAlign(p.CENTER, p.CENTER);
        p.initGame();
    };
    
    p.initGame = () => {
        items = [];
        matchesFound = 0;
        
        const allImages = [
            { id: 1, img: img_kimchi }, 
            { id: 2, img: img_hanbok }, 
            { id: 3, img: img_soju },
            { id: 4, img: img_bulgogi }, 
            { id: 5, img: img_bibimbap } 
        ];
        
        const totalCardWidth = matchData.length * cardSize + (matchData.length - 1) * margin;
        const startX = (canvasW - totalCardWidth) / 2 + cardSize / 2; 
        
        for(let i = 0; i < matchData.length; i++) {
            let data = matchData[i];
            items.push({ 
                type: 'text', id: data.id, value: data.text, matched: false,
                x: startX + i * (cardSize + margin) - cardSize/2, y: canvasH / 3 - cardSize/2, 
                w: cardSize, h: cardSize 
            });
        }

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

            if (selectedCard === item) { p.fill(255, 230, 100); } 
            else { p.fill(240); }
            p.stroke(50);
            p.rect(0, 0, item.w, item.h, 8); 

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
            
            if (p.mouseX > item.x && p.mouseX < item.x + item.w &&
                p.mouseY > item.y && p.mouseY < item.y + item.h) {
                
                if (selectedCard === null) {
                    selectedCard = item;
                } else if (selectedCard === item) {
                    selectedCard = null;
                } else {
                    if (selectedCard.id === item.id && selectedCard.type !== item.type) {
                        selectedCard.matched = true;
                        item.matched = true;
                        selectedCard = null; 
                        matchesFound++;
                    } else {
                        selectedCard = item; 
                    }
                }
                break; 
            }
        }
    };
};


// --- 區域 4: 韓文字母射擊機 (Shooter Game Instance) ---
const shooterSketch = (p) => {
    let canvasW = 600;
    let canvasH = 400;
    let letters = []; // 儲存掉落中的字母物件
    let score = 0;
    let spawnRate = 90; // 每隔 90 幀生成一個新字母 (約 1.5 秒)
    
    // 遊戲使用的韓文母音和發音
    const vowels = [
        { letter: 'ㅏ', sound: 'a' },
        { letter: 'ㅓ', sound: 'eo' },
        { letter: 'ㅗ', sound: 'o' },
        { letter: 'ㅜ', sound: 'u' }
    ];

    p.setup = () => {
        let canvas = p.createCanvas(canvasW, canvasH);
        canvas.parent('shooter-canvas-container');
        p.textAlign(p.CENTER, p.CENTER);
        
        // 創建按鈕
        const buttonContainer = p.select('#shooter-buttons-container');
        for (let v of vowels) {
            let btn = p.createButton(v.sound);
            btn.class('shooter-buttons-button'); // 使用 CSS 樣式
            btn.parent(buttonContainer);
            // 當按鈕被點擊時，呼叫 checkAnswer 函數
            btn.mousePressed(() => checkAnswer(v.sound)); 
        }
    };

    p.draw = () => {
        p.background(240, 255, 240); // 淺綠色背景
        
        // 1. 生成新字母
        if (p.frameCount % spawnRate === 0) {
            const v = p.random(vowels);
            const x = p.random(50, canvasW - 50);
            letters.push(new FallingLetter(p, x, 0, v.letter, v.sound));
            
            // 隨著得分增加，加快字母掉落速度
            spawnRate = p.max(30, 90 - p.floor(score / 5) * 5);
        }

        // 2. 更新和繪製字母
        for (let i = letters.length - 1; i >= 0; i--) {
            let letter = letters[i];
            
            if (!letter.exploded) {
                letter.move();
            }
            letter.display();

            // 檢查字母是否掉到底部 (錯過)
            if (letter.isOffScreen(canvasH) && !letter.exploded) {
                score = p.max(0, score - 5); // 扣分
                letters.splice(i, 1);
            }
            
            // 清理爆炸完成的字母
            if (letter.exploded && letter.explosionTimer <= 0) {
                letters.splice(i, 1);
            }
        }

        // 3. 繪製分數
        p.fill(50);
        p.textSize(30);
        p.textAlign(p.LEFT, p.TOP);
        p.text(`分數: ${score}`, 20, 20);
        
        p.stroke(255, 50, 50); // 底部死亡線
        p.line(0, canvasH - 10, canvasW, canvasH - 10); 
    };
    
    // 檢查答案的函數
    const checkAnswer = (clickedSound) => {
        let foundMatch = false;
        
        for (let i = letters.length - 1; i >= 0; i--) {
            let letter = letters[i];
            
            // 找到最靠近底部的那個未爆炸的字母
            if (!letter.exploded) {
                if (letter.sound === clickedSound) {
                    // 答對！
                    letter.exploded = true; 
                    score += 10;
                    foundMatch = true;
                    // 不需要 break，讓它繼續爆炸動畫
                } else {
                    // 答錯！
                    score = p.max(0, score - 2); // 小幅懲罰
                }
                break; // 每次點擊只處理一個最靠近的字母
            }
        }
        
        if (!foundMatch) {
             // 如果點擊時畫面上沒有可匹配的字母，也算作失誤
             score = p.max(0, score - 1); 
        }
    }
    
    // 將 checkAnswer 暴露給外部，以便 p5.js 按鈕可以呼叫
    p.checkAnswer = checkAnswer;
};


// --- 主程式 Setup ---
function setup() {
    currentHangeulInfo = '點擊字母發音';
    
    // 創建 p5.js 實例 (Instance Mode)
    new p5(hangeulSketch);
    new p5(matchingSketch);
    new p5(shooterSketch); // *** 新增射擊遊戲實例 ***
    
    // 不需主畫布
    noCanvas(); 
}

function draw() {
    // 留空
}
