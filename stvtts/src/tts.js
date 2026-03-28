load("voice_list.js");

function execute(text, voice) {
    const MAX_LENGTH = 300; // Giới hạn ký tự mỗi lần gọi API
    const domains = [
        "https://sangtacviet.pro",
        "https://sangtacviet.vip",
        "https://sangtacviet.com"
    ];

    // --- 1. Hàm bổ trợ chia nhỏ văn bản ---
    function splitIntoChunks(str, len) {
        const chunks = [];
        let i = 0;
        while (i < str.length) {
            let segment = str.substring(i, i + len);
            // Tìm điểm ngắt quãng tự nhiên (dấu câu hoặc xuống dòng)
            let lastBreak = Math.max(
                segment.lastIndexOf('.'), 
                segment.lastIndexOf('!'), 
                segment.lastIndexOf('?'),
                segment.lastIndexOf('\n')
            );
            
            // Nếu không có dấu câu, tìm khoảng trắng
            if (lastBreak === -1) lastBreak = segment.lastIndexOf(' ');
            
            // Nếu vẫn không có (từ quá dài), cắt cứng tại len
            let actualLen = (lastBreak !== -1 && i + len < str.length) ? lastBreak + 1 : len;
            chunks.push(str.substring(i, i + actualLen).trim());
            i += actualLen;
        }
        return chunks.filter(c => c.length > 0);
    }

    // --- 2. Thực thi lấy dữ liệu ---
    const textParts = splitIntoChunks(text, MAX_LENGTH);
    let combinedAudio = [];

    for (let part of textParts) {
        let partSuccess = false;
        
        for (let domain of domains) {
            try {
                let response = fetch(domain + "/io/s1213/tiktoktts", {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Referer': domain + '/'
                    },
                    body: JSON.stringify({ "text": part, "voice": voice })
                });

                if (response.ok) {
                    let b64 = response.base64();
                    if (b64 && b64.length > 500) {
                        combinedAudio.push(b64);
                        partSuccess = true;
                        break; // Chuyển sang đoạn text tiếp theo
                    }
                }
            } catch (e) {
                continue; // Thử domain tiếp theo nếu domain này lỗi
            }
        }
        
        // Nếu một đoạn bị lỗi hoàn toàn sau khi thử tất cả domain, 
        // ta có thể chọn dừng lại hoặc bỏ qua đoạn đó.
        if (!partSuccess) {
            console.log("Không thể lấy audio cho đoạn: " + part.substring(0, 20));
        }
    }

    // --- 3. Trả về kết quả ---
    if (combinedAudio.length > 0) {
        /**
         * LƯU Ý CHO vBOOK:
         * Nếu vBook yêu cầu 1 file duy nhất, bạn có thể thử nối chuỗi: combinedAudio.join("")
         * Nếu vBook hỗ trợ danh sách, trả về mảng.
         * Dưới đây là cách trả về phổ biến nhất (nối chuỗi base64)
         */
        return Response.success(combinedAudio.join("")); 
    }

    return Response.error("Không lấy được dữ liệu âm thanh từ bất kỳ server nào.");
}