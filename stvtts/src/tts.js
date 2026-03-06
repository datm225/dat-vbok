load("voice_list.js");

function execute(text, voice) {
    // Danh sách các tên miền thay thế của Sangtacviet
    var domains = [
        "https://sangtacviet.com",
        "https://sangtacviet.pro",
        "https://sangtacviet.vip",
        "https://sangtacviet.app"
    ];

    var lastError = "";

    // Thử lần lượt từng tên miền trong danh sách
    for (var i = 0; i < domains.length; i++) {
        var baseDomain = domains[i];
        var url = baseDomain + "/io/s1213/tiktoktts?text=";

        try {
            var response = fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': baseDomain + '/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                body: JSON.stringify({
                    "text": text,
                    "voice": voice
                })
            });

            if (response.ok) {
                // Chuyển đổi dữ liệu Binary từ server thành Base64 cho vBook
                var result = response.base64(); 
                
                // Kiểm tra nếu dữ liệu trả về đủ lớn (tránh trường hợp file lỗi/trống)
                if (result && result.length > 500) {
                    return Response.success(result);
                }
            }
        } catch (e) {
            lastError = e.message;
            // Nếu lỗi, vòng lặp sẽ tiếp tục thử tên miền tiếp theo
            continue; 
        }
    }

    // Nếu đã thử hết các tên miền mà vẫn thất bại
    return Response.error("Lỗi: Không thể lấy dữ liệu âm thanh từ bất kỳ server nào. " + lastError);
}