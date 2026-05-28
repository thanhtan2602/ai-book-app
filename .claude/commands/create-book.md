---
description: Tạo ebook từ folder chứa file .srt. Claude tự dịch nội dung (không dùng OpenAI API) và lưu vào folder books/.
argument-hint: "[folder path chứa file .srt] [category?]"
allowed-tools: Bash(npx tsx scripts/create-book.ts:*), Bash(cd my-project:*), Read, Write, Glob, TodoWrite
---

Tạo ebook từ folder chứa file .srt. Claude tự dịch nội dung (không dùng OpenAI API).

**Input:** `$ARGUMENTS` — path đến folder gốc chứa file .srt. Có thể thêm tham số category (mặc định: `software`).

**Quy trình:**

1. Parse folder để lấy danh sách chapters:
```
cd my-project && npx tsx scripts/create-book.ts parse "$ARGUMENTS"
```
Script output JSON gồm: `bookTitle`, `sourcePath`, `chapters[]` (mỗi chapter: `title`, `order`, `text` tiếng Anh gốc, `wordCount`).

2. Với **MỖI chapter**, tự dịch trường `text` sang tiếng Việt:
   - Dịch tự nhiên, mượt mà, giữ đúng nghĩa gốc
   - Thêm paragraph breaks (`\n\n`) hợp lý
   - Giữ markdown formatting: `## heading`, `### subheading`, `**bold**`
   - Bỏ artifact subtitle (timestamp, số thứ tự còn sót)
   - Viết như chapter sách thật sự, không phải phụ đề
   - Log tiến trình từng chapter: `[1/N] Đang dịch: "Chapter Title"...`

3. Sau khi dịch xong TẤT CẢ chapters, lưu thành file `.text` vào folder `books/`:

   **Cấu trúc thư mục:**
   ```
   books/
   └── [category]/          # mặc định: software
       └── [bookTitle]/
           ├── 0.Introduction.text    # nếu có chapter order=0
           ├── 1.[chapterTitle].text
           ├── 2.[chapterTitle].text
           └── ...
   ```

   **Tên file:** `[order].[chapterTitle].text`
   - `order` là số nguyên từ JSON (`0`, `1`, `2`, ...)
   - `chapterTitle` là `title` từ JSON (giữ nguyên, không sanitize)
   - Dùng tool **Write** để tạo từng file (path tính từ root workspace: `books/[category]/[bookTitle]/[order].[title].text`)

   **Nội dung file:** chỉ chứa nội dung tiếng Việt đã dịch (plain text + markdown), không có metadata.

4. Sau khi lưu xong, in tóm tắt:
   ```
   Hoàn thành! Đã lưu [N] chapters vào books/[category]/[bookTitle]/
   ```

**Lưu ý:**
- KHÔNG dùng OpenAI API, tự dịch
- KHÔNG lưu vào database
- Nếu chapter quá dài (>5000 words), chia nhỏ để dịch rồi ghép lại
- Category mặc định là `software` nếu không truyền vào
