import * as React from 'react';
import { render } from 'react-dom';
import { PaperEditor, GlobalStyle } from './src/';
import Block from './src/extensions/custom-block';
import Mark from './src/extensions/custom-mark';
import extensions from './src/extensions/';

extensions.push(new Block({
  tagName: 'div',
  className: 'acms-admin-alert',
  icon: '<span class="fa fa-envelope-open"></span>',
}));

// extensions.push(new Mark({
//   tagName: 'i',
//   className: '',
//   icon: '<span class="fa fa-address-book"></span>',
// }));

render(<>
  <GlobalStyle />
  <PaperEditor
    showBackBtn
    showTitle
    autoSave
    titlePlaceholder="ここにタイトルを入力"
    extensions={extensions}
    html={`
<p>Hello World</p>
<h2>Test</h2>
<ul>
  <li>リスト1</li>
  <li>リスト2</li>
</ul>
<table>
  <tr>
    <th>aaa</th>
    <td>ee</td>
  </tr>
</table>
<code>
const a = 'b';<br/>
a.toFixed();<br/>
const c = () => {<br/>
  <br/>
}
</code>
<img src="https://appleple.github.io/SmartPhoto/assets/images/large-kuma.jpg" />
`}
    // json={{
    //   type: 'doc',
    //   content: [
    //   {
    //     type: 'paragraph',
    //     content: [{
    //       type: 'text',
    //       text: 'Example Paragraph'
    //     }]
    //   }
    // ]}}
    onChange={({ json, html }) => {
    }} /></>,
  document.querySelector('#app'));
