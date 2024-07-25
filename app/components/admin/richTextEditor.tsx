import React, { useState, useEffect } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface RichTextEditorProps {
  value: string;
  onEditorChange: (editorState: EditorState) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onEditorChange }) => {
  const [editorState, setEditorState] = useState<EditorState>(
    value
      ? EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(value).contentBlocks))
      : EditorState.createEmpty()
  );

  const customStyleMap = {
    'BOLD': {
      fontWeight: "bold",
      color:'red'
    },
    'H2': {
      fontSize: '20px',
      color: 'green'
    }
  };

  useEffect(() => {
    if (value === "") {
      setEditorState(EditorState.createEmpty());
    } else {
      const blocksFromHtml = htmlToDraft(value);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [value]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    onEditorChange(state);
  };

  return (
    <div className="">
      <Editor
      customStyleMap={customStyleMap}
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbar={{
          options: [
            "inline",
            "blockType",
            "fontSize",
            "fontFamily",
            "list",
            "textAlign",
            "colorPicker",
            "remove",
            "history",
          ],
          inline: {
            options: ["bold", "italic", "underline", "strikethrough", "monospace"],
          },
          blockType: {
            inDropdown: true,
            options: ["Normal", "H1", "H2", "H3"],
          },
          list: {
            inDropdown: true,
            options: ["unordered", "ordered", "indent", "outdent"],
          },
          textAlign: {
            inDropdown: true,
            options: ["left", "center", "right", "justify"],
          },
        }}
      />
    </div>
  );
};

export default RichTextEditor;
