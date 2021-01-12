import * as React from 'react';
import { EditorView } from 'prosemirror-view';
import { Schema, Node, DOMParser } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { chainCommands } from 'prosemirror-commands';
import scrollTo from 'scroll-to';
import { EditorState } from 'prosemirror-state';
import classNames from 'classnames';
import * as uuid from 'uuid/v4'

import Editor from './editor';
import InlineMenu from './inline-menu';
import EditMenu from './edit-menu';
import Menu from './menu';
import BackBtn from './back-btn';
import CustomLayout from './custom-layout';
import Title from './title';
import { getScrollTop, getOffset, getViewport, getHtmlFromNode, getParentNodeFromState } from '../utils'
import defaultExtensions from '../extensions/base'
import { Extension, AppProps, Output } from '../types'


const { useState, useEffect, useRef } = React;

interface ProseRender {
  editor: React.ReactChild;
  view: EditorView;
  scrolling: boolean;
}

type EditorOptions = {
  schema: Schema<any, any>;
  plugins: any[];
  doc: Node<Schema<any, any>>;
}

const EDITMENUHEIGHT = 80;

const getBlockSchemas = (extensions: Extension[]) => {
  const nodesSchema = extensions.filter(extension => {
    if (extension.schema && extension.schema.group === 'block') {
      return true
    }
    return false
  })
  const nodes = nodesSchema.reduce((node, curr, index) => {
    const newNode = { [curr.name]: { ...curr.schema } }
    return { ...node, ...newNode }
  }, {})
  return nodes
}

const getBlocks = (extensions: Extension[]) => {
  const nodesSchema = extensions.filter(extension => {
    if (extension.group === 'block') {
      return true
    }
    return false
  })
  return nodesSchema
}

const getMarks = (extensions: Extension[]) => {
  const marksSchema = extensions.filter(extension => {
    if (extension.group === 'mark') {
      return true
    }
    return false
  })
  return marksSchema
}

const getMarkSchemas = (extensions: Extension[]) => {
  const marksSchema = getMarks(extensions)
  const marks = marksSchema.reduce((mark, curr, index) => {
    const newMark = { [curr.name]: { ...curr.schema } }
    return { ...mark, ...newMark }
  }, {})
  return marks
}

const getEdits = (extensions: Extension[]) => {
  const editMarks = extensions.filter(extension => {
    if (extension.group === 'edit') {
      return true
    }
    return false
  })
  return editMarks
}

const getSchemaBlockDependencies = (extensions: Extension[]) => {
  const schemas = extensions.reduce((schema, curr) => {
    if (curr.schemaDependencies) {
      return Object.assign({}, schema, curr.schemaDependencies)
    }
    return schema
  }, {})
  return schemas
}

const getSchemaFromExtensions = (extensions: Extension[]) => {
  let nodes = getBlockSchemas(extensions)
  const nodeDependencies = getSchemaBlockDependencies(extensions)
  const base = {
    doc: {
      content: 'block+'
    },
    text: {
      group: 'inline'
    },
    hard_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() {
        return ['br']
      }
    }
  }
  nodes = { ...nodes, ...base, ...nodeDependencies }
  const marks = getMarkSchemas(extensions)
  return new Schema({ nodes, marks })
}

const getKeys = (extensions: Extension[], schema: Schema) => {
  const extensionKeys = {}
  extensions.forEach(extension => {
    if (extension.keys) {
      const registeredKeys = extension.keys(schema)
      Object.keys(registeredKeys).forEach(key => {
        if (!extensionKeys[key]) {
          extensionKeys[key] = []
        }
        extensionKeys[key].push(registeredKeys[key])
      })
    }
  });

  const keyMaps = {}

  Object.keys(extensionKeys).forEach(extensionKey => {
    keyMaps[extensionKey] = chainCommands(...extensionKeys[extensionKey])
  })

  return keymap(keyMaps)
}

const getMenu = (extensions: Extension[]) => {
  return extensions.filter(extension => extension.showMenu)
}

const onChange = (
  state: EditorState,
  dispatch: typeof EditorView.prototype.dispatch,
  props: AppProps,
  schema: Schema,
  container?: React.MutableRefObject<HTMLDivElement>,
  showdown?: any //any
) => {
  const { doc } = state
  if (container && container.current) {
    const selected = container.current.querySelector(
      '.selected'
    ) as HTMLDivElement
    if (selected) {
      const viewport = getViewport()
      const top = getScrollTop() + viewport.height
      const offsetTop = getOffset(selected).top
      if (offsetTop + EDITMENUHEIGHT >= top) {
        if (
          /iPod|iPhone|iPad/.test(navigator.platform) &&
          document.activeElement
        ) {
          const activeElement = document.activeElement as HTMLElement
          if (activeElement.isContentEditable) {
            scrollTo(0, offsetTop - EDITMENUHEIGHT, {
              duration: 300
            })
            return true;
          }
        } else {
          scrollTo(0, offsetTop - EDITMENUHEIGHT, {
            duration: 300
          })
          return true;
        }
      }
    }
  }
  if (props.onChange) {
    const html = getHtmlFromNode(doc, schema)
    const change: Output = {
      json: doc.toJSON(),
      html,
      schema
    };

    if (props.outputMarkdown && showdown) {
      const converter = new showdown.Converter();
      converter.setFlavor('github');
      change.markdown = converter.makeMd(html)
    }

    props.onChange(change);
  }
  if (props.autoSave) {
    const { pathname } = location;
    const html = getHtmlFromNode(doc, schema);
    localStorage.setItem(`smartblock:${pathname}`, html);
  }
  const { childCount } = doc.content
  const lastNode = doc.content.child(childCount - 1)
  if (lastNode.type.name !== 'paragraph') {
    const { paragraph } = state.schema.nodes
    dispatch(
      state.tr.insert(state.doc.content.size, paragraph.createAndFill())
    )
  } else if (lastNode.textContent.length !== 0) {
    const { paragraph } = state.schema.nodes
    dispatch(
      state.tr.insert(state.doc.content.size, paragraph.createAndFill())
    )
  }
  return false;
}

const getPlugins = (extensions: Extension[], schema: Schema) => {
  let customPlugins = []
  extensions.forEach(extension => {
    if (extension.plugins) {
      customPlugins = [...customPlugins, ...extension.plugins]
    }
  })
  const keyPlugin = getKeys(extensions, schema)
  return [...customPlugins, keyPlugin]
}

const getNodeViews = (extensions: Extension[]) => {
  const views = {}
  extensions.forEach(extension => {
    if (extension.view) {
      views[extension.name] = (node: Node, view: EditorView, getPos) => {
        return extension.view(node, view, getPos);
      }
    }
  })
  return views
}

const titleChanged = (title: string, props: AppProps) => {
  const { pathname } = location;
  localStorage.setItem(`smartblock-title:${pathname}`, title);
  if (props.onTitleChange) {
    props.onTitleChange(title);
  }
}

const shouldRenderInlineMenu = (view: EditorView, blocks: Extension[]) => {
  const node = getParentNodeFromState(view.state);
  const currentBlock = blocks.find((block) => {
    if (block.name === node.type.name) {
      return true;
    }
    return false;
  })
  if (currentBlock && currentBlock.hideInlineMenuOnFocus) {
    return false;
  }
  return true;
}

export default (props: AppProps) => {
  const defaultProps = {
    extensions: defaultExtensions,
    offsetTop: 0,
    showBackBtn: false,
    autoSave: false,
    showTitle: false,
    titleText: '',
    full: false,
  }

  props = Object.assign({}, defaultProps, props);
  const { html, json, extensions, showBackBtn, showTitle, markdown, showdown } = props
  let { titleText } = props
  const schema = getSchemaFromExtensions(props.extensions)
  let realHtml = html


  if (json) {
    const node = Node.fromJSON(schema, json)
    realHtml = getHtmlFromNode(node, schema)
  }

  if (markdown && showdown) {
    const converter = new showdown.Converter();
    converter.setFlavor('github');
    realHtml = converter.makeHtml(markdown);
  }

  if (props.autoSave) {
    const { pathname } = location;
    const localHtml = localStorage.getItem(`smartblock:${pathname}`);
    if (localHtml) {
      realHtml = localHtml;
    }
    if (showTitle) {
      titleText = localStorage.getItem(`smartblock-title:${pathname}`);
    }
  }

  const [options, setOptions] = useState<EditorOptions>(null);
  const app = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = document.createElement('div')
    div.innerHTML = realHtml
    const doc = DOMParser.fromSchema(schema).parse(div, {
      preserveWhitespace: true
    });

    if (props.onInit) {
      props.onInit({
        schema
      })
    }
    if (props.getEditorRef) {
      props.getEditorRef(app);
    }
    const editorOptions = { schema, plugins: getPlugins(extensions, schema), doc }
    setOptions(editorOptions);
  }, []);

  const [showMenus, setShowMenus] = useState(true);
  const containerId = React.useMemo(() => {
    return uuid();
  }, []);

  const container = useRef<HTMLDivElement>(null);
  const blocks = getBlocks(extensions)
  const marks = getMarks(extensions)
  const edits = getEdits(extensions)
  const nodeViews = getNodeViews(extensions)

  return (<div 
    id={containerId} 
    onClick={(e) => {
      const target = e.target as HTMLDivElement;
      if (target.getAttribute('id') === containerId) {
        setShowMenus(false);
      } else {
        setShowMenus(true);
      }
    }}
    ref={app}
  >
    <div className={classNames('smartblock-container', {
      'is-full': props.full
    })}>
      {props.showTitle && 
        <Title 
          onChange={(title) => {
            titleChanged(title, props);
          }} 
          defaultValue={titleText}
          placeholder={props.titlePlaceholder}
        />
      }
      <div className="smartblock-inner">
      <div
        className={showMenus ? '' : 'ProseMirrorHideSelection'}
        ref={container}
      >
        <div className="smartblock-input-area">
          {options && <Editor
            options={options}
            nodeViews={nodeViews}
            onChange={(state, dispatch) => {
              const shouldScroll = onChange(state, dispatch, props, schema, container, showdown);
              if (shouldScroll) {
                setTimeout(() => {
                  setShowMenus(true);
                }, 700);
              }
            }}
            render={({ editor, view, scrolling }: ProseRender) => {
              if (scrolling) {
                setShowMenus(false);
              }
              return(
                <>
                  {(showMenus) && <>
                    <Menu view={view} menu={getMenu(blocks)} />
                    <EditMenu view={view} menu={getMenu(edits)} />
                    {shouldRenderInlineMenu(view, blocks) && <InlineMenu menu={getMenu(marks)} blockMenu={getMenu(blocks)} view={view} />}
                    <CustomLayout view={view} menu={getMenu(blocks)} />
                    {showBackBtn && <BackBtn view={view} />}
                  </>}
                  {editor}
                </>);
              }
            }
          />}
        </div>
      </div>
      </div>
    </div>
  </div>)
}
