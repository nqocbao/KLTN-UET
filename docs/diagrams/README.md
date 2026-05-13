# Biểu đồ tuần tự RAG - hướng dẫn render ảnh

Biểu đồ cũ quá dài nên khi đưa vào luận văn bị thu nhỏ. Bộ biểu đồ hiện tại được tách thành 2 hình để chữ dễ đọc hơn:

- `rag_sequence.puml`: luồng truy vấn food review qua RAG ở thời điểm người dùng hỏi.
- `rag_index_sequence.puml`: luồng xây dựng hoặc xây lại chỉ mục ChromaDB.
- `rag_sequence.mmd` và `rag_index_sequence.mmd`: bản Mermaid tương ứng để preview nhanh.

## Render bằng PlantUML

Khuyến nghị dùng PlantUML cho luận văn.

### Online

1. Mở `https://www.plantuml.com/plantuml/uml/` hoặc `https://www.planttext.com`.
2. Dán nội dung từng file `.puml`.
3. Export thành PNG hoặc SVG.

Tên ảnh nên dùng:

- `seq_rag.png` cho `rag_sequence.puml`.
- `seq_rag_index.png` cho `rag_index_sequence.puml`.

### CLI

```bash
java -jar plantuml.jar -tpng rag_sequence.puml
java -jar plantuml.jar -tpng rag_index_sequence.puml
```

## Render bằng Mermaid

1. Mở `https://mermaid.live/`.
2. Dán nội dung từng file `.mmd`.
3. Export PNG hoặc SVG.

CLI:

```bash
mmdc -i rag_sequence.mmd -o seq_rag.png -w 1800
mmdc -i rag_index_sequence.mmd -o seq_rag_index.png -w 1800
```

## Gợi ý chèn vào LaTeX

```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth]{seq_rag.png}
    \caption{Biểu đồ tuần tự truy hồi food review qua RAG}
    \label{fig:rag_sequence}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth]{seq_rag_index.png}
    \caption{Biểu đồ tuần tự xây dựng chỉ mục RAG cho food review}
    \label{fig:rag_index_sequence}
\end{figure}
```

Nếu vẫn muốn một hình thật lớn, export SVG/PDF thay vì PNG hoặc đặt hình trong trang ngang. Tuy nhiên, tách thành 2 hình thường dễ đọc hơn khi in.
