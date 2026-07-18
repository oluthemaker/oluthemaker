import ReactQuill from "react-quill-new";

const TextBlock = ({
    block,
    index,
    updateContentBlock,
}) => {
    return (
        <ReactQuill
            theme="snow"
            value={block.content}
            onChange={(value) =>
                updateContentBlock(index, {
                    content: value,
                })
            }
        />
    );
};

export default TextBlock;
