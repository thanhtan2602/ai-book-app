---
description: Tạo ebook từ folder chứa file .srt. Claude tự dịch nội dung (không dùng OpenAI API).
argument-hint: "[folder path chứa file .srt]"
allowed-tools: Bash(npx tsx scripts/create-book.ts:*), Bash(cd my-project:*), Bash(node:*), Bash(wc:*), Bash(rm:*), Read, Write, Edit, Glob, Grep, TodoWrite
---

Tạo ebook từ folder chứa file .srt. Claude tự dịch nội dung (không dùng OpenAI API).

**Input:** $ARGUMENTS là path đến folder gốc.

**Quy trình:**

1. Chạy script parse để scan folder và extract text từ tất cả file .srt:
```
cd my-project && npx tsx scripts/create-book.ts parse "$ARGUMENTS"
```
Script sẽ output JSON chứa: bookTitle, sourcePath, chapters (mỗi chapter có title, order, text gốc tiếng Anh, wordCount).

2. Với MỖI chapter trong JSON output, BẠN (Claude) tự dịch trường `text` sang tiếng Việt:
   - Dịch tự nhiên, mượt mà, giữ đúng nghĩa gốc
   - Thêm paragraph breaks (\n\n) hợp lý cho dễ đọc
   - Bỏ các artifact của subtitle (timestamp, số thứ tự nếu còn sót)
   - Viết như 1 chapter sách thật sự, không phải phụ đề
   - Đặt kết quả dịch vào trường `content` của chapter đó

3. Sau khi dịch XONG TẤT CẢ chapters, tạo file JSON tạm chứa kết quả:
```json
{
  "bookTitle": "...",
  "sourcePath": "...",
  "description": "...",
  "chapters": [
    { "title": "...", "order": 1, "content": "nội dung tiếng Việt đã dịch..." }
  ]
}
```
Lưu file này vào `my-project/tmp-book.json`

4. Chạy script save để lưu vào database:
```
cd my-project && npx tsx scripts/create-book.ts save tmp-book.json
```

5. Xóa file tạm `tmp-book.json` sau khi save thành công.

**Lưu ý:**
- KHÔNG dùng OpenAI API, bạn tự dịch
- Dịch từng chapter một, log tiến trình
- Nếu chapter quá dài (>5000 words), chia nhỏ để dịch rồi ghép lại
