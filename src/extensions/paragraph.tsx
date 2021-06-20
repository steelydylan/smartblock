import * as React from 'react'
import { setBlockType } from 'prosemirror-commands'
import * as uuid from 'uuid/v4'
import ParagraphIcon from '../components/icons/paragraph'
import AlignLeftIcon from '../components/icons/align-left'
import AlignCenterIcon from '../components/icons/align-center'
import AlignRightIcon from '../components/icons/align-right'
import { Extension, ExtensionProps } from '../types'
import { blockActive, getParentNodeFromState } from '../utils'
import Button from '../components/button'

export default class Paragraph extends Extension {
  constructor(props?: ExtensionProps) {
    super(props);
  }

  get name() {
    return 'paragraph';
  }

  get group() {
    return 'block';
  }

  get showMenu() {
    return true;
  }

  get schema() {
    if (this.customSchema) {
      return this.customSchema;
    }
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [
        {
          tag: 'p',
          getAttrs(dom) {
            if (dom.querySelector('img')) {
              return false;
            }
            return {
              id: dom.getAttribute('id') || uuid(),
              align: dom.style.textAlign
            }
          }
        }
      ],
      attrs: {
        align: { default: '' },
        id: { default: '' }
      },
      toDOM: node => {
        return [
          'p',
          (node.attrs.align ? {
            style: `text-align: ${node.attrs.align}`,
            class: this.className
          } : {
            class: this.className
          }),
          0
        ]
      }
    }
  }

  get icon() {
    return <ParagraphIcon style={{ width: '24px', height: '24px' }} />
  }

  active(state) {
    return blockActive(state.schema.nodes.paragraph)(state);
  }

  enable(state) {
    return setBlockType(state.schema.nodes.paragraph)(state);
  }

  customMenu({ state, dispatch }) {
    const node = getParentNodeFromState(state);
    return (
      <>
        <Button
          type="button"
          active={node && node.attrs.align === 'left'}
          onClick={() => {
            setBlockType(state.schema.nodes.paragraph, {
              align: 'left'
            })(state, dispatch);
          }}
        >
          <AlignLeftIcon style={{ width: '24px', height: '24px' }} />
        </Button>
        <Button
          type="button"
          active={node && node.attrs.align === 'center'}
          onClick={() => {
            setBlockType(state.schema.nodes.paragraph, {
              align: 'center'
            })(state, dispatch);
          }}
        >
          <AlignCenterIcon style={{ width: '24px', height: '24px' }} />
        </Button>
        <Button
          type="button"
          active={node && node.attrs.align === 'right'}
          onClick={() => {
            setBlockType(state.schema.nodes.paragraph, {
              align: 'right'
            })(state, dispatch);
          }}
        >
          <AlignRightIcon style={{ width: '24px', height: '24px' }} />
        </Button>
      </>
    )
  }

  onClick(state, dispatch) {
    setBlockType(state.schema.nodes.paragraph)(state, dispatch);
  }
}
