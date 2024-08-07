// richTextEditor.tsx
import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onEditorChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onEditorChange,
}) => {
  const editorRef = useRef<any>(null);

  return (
    <div>
      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        apiKey="7j5tfsxfycw1gz0z0cyp57b3s713xyy54zyr7qxg000qinu4"
        init={{
          menubar: false,
          height: 300,
          //   autosave_ask_before_unload: false,
          //   powerpaste_allow_local_images: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            // "advtable",
          ],
          toolbar:
            " formatselect  bold italic underline strikethrough fontsizeinput  " +
            "forecolor backcolor  alignleft aligncenter alignright alignjustify  " +
            "bullist numlist outdent indent  superscript subscript charmap hr  " +
            "removeformat  ",
          toolbar_mode: "wrap",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
        }}
        onEditorChange={onEditorChange}
      />
    </div>
  );
};

export default RichTextEditor;
