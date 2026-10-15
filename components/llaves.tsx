"use client";
import {
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import { Fragment } from "@tiptap/pm/model";
import { TextSelection, type EditorState, type Transaction } from "@tiptap/pm/state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    llave: { toggleLlave: () => ReturnType };
  }
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const };

function BodyView() {
  return (
    <NodeViewWrapper className="llave-body">
      <div className="llave-brace" contentEditable={false}>
        <svg width="16" height="20" viewBox="0 0 16 20"><path d="M16 1 Q8 1 8 10 L8 20" {...stroke} /></svg>
        <div className="llave-line" />
        <svg width="16" height="24" viewBox="0 0 16 24"><path d="M8 0 Q8 11 1 12 Q8 13 8 24" {...stroke} /></svg>
        <div className="llave-line" />
        <svg width="16" height="20" viewBox="0 0 16 20"><path d="M8 0 L8 10 Q8 19 16 19" {...stroke} /></svg>
      </div>
      <NodeViewContent className="llave-content" />
    </NodeViewWrapper>
  );
}

// Quita la llave: el texto de la izquierda vuelve a ser un párrafo y el contenido de adentro se conserva.
// Si el interior estaba vacío, no deja un párrafo vacío de sobra.
function quitarLlave(state: EditorState, tr: Transaction, depth: number, cursor: "inicio" | "fin") {
  const { schema, selection } = state;
  const $from = selection.$from;
  const node = $from.node(depth);
  const pos = $from.before(depth);
  const label = node.child(0);
  const body = node.child(1);
  const bodyVacio = body.childCount === 1 && body.firstChild!.content.size === 0;

  const para = schema.nodes.paragraph.create(null, label.content);
  let frag = Fragment.from(para);
  if (!bodyVacio) frag = frag.append(body.content);

  tr.replaceWith(pos, pos + node.nodeSize, frag);
  const p = cursor === "fin" ? pos + para.nodeSize - 1 : pos + 1;
  tr.setSelection(TextSelection.near(tr.doc.resolve(p)));
}

export const LlaveLabel = Node.create({
  name: "llaveLabel",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-llave-label]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-llave-label": "", class: "llave-label" }), 0];
  },
  addKeyboardShortcuts() {
    return {
      // Enter en el texto de la izquierda pasa al interior de la llave
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "llaveLabel") return false;
        return editor.commands.setTextSelection($from.after() + 2);
      },
    };
  },
});

export const LlaveBody = Node.create({
  name: "llaveBody",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-llave-body]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-llave-body": "" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BodyView);
  },
});

export const Llave = Node.create({
  name: "llave",
  group: "block",
  content: "llaveLabel llaveBody",
  defining: true,
  priority: 1000,

  parseHTML() {
    return [{ tag: "div[data-llave-box]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-llave-box": "", class: "llave" }), 0];
  },

  addExtensions() {
    return [LlaveLabel, LlaveBody];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        if (!selection.empty) return false;
        const { $from } = selection;

        // A) Dentro de la llave, en el único párrafo y vacío → se quita la llave
        const enCuerpo =
          $from.depth >= 3 &&
          $from.parent.type.name === "paragraph" &&
          $from.parent.content.size === 0 &&
          $from.node($from.depth - 1).type.name === "llaveBody" &&
          $from.node($from.depth - 1).childCount === 1;

        if (enCuerpo) {
          return editor.commands.command(({ state, tr }) => {
            quitarLlave(state, tr, $from.depth - 2, "fin");
            return true;
          });
        }

        // B) Al inicio del texto de la izquierda → se quita la llave (el contenido se conserva)
        if ($from.parent.type.name === "llaveLabel" && $from.parentOffset === 0) {
          return editor.commands.command(({ state, tr }) => {
            quitarLlave(state, tr, $from.depth - 1, "inicio");
            return true;
          });
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      toggleLlave:
        () =>
        ({ state, tr, dispatch }) => {
          const { $from } = state.selection;
          const { schema } = state;

          // 1) Si ya estás dentro de una llave, la quita
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "llave") {
              if (dispatch) {
                quitarLlave(state, tr, d, "fin");
                dispatch(tr);
              }
              return true;
            }
          }

          // 2) Si no, el texto donde estás pasa a la izquierda y se abre la llave
          const parent = $from.parent;
          if (!parent.isTextblock) return false;
          const d = $from.depth;
          const container = $from.node(d - 1);
          const index = $from.index(d - 1);
          if (!container.canReplaceWith(index, index + 1, schema.nodes.llave)) return false;

          if (dispatch) {
            const start = $from.before(d);
            const end = $from.after(d);
            const label = schema.nodes.llaveLabel.create(null, parent.content);
            const body = schema.nodes.llaveBody.create(null, schema.nodes.paragraph.create());
            const llave = schema.nodes.llave.create(null, [label, body]);
            tr.replaceWith(start, end, llave);
            tr.setSelection(TextSelection.create(tr.doc, start + 1 + label.nodeSize + 2));
            dispatch(tr);
          }
          return true;
        },
    };
  },
});